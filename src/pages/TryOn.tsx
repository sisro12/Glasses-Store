import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Camera, Upload, Sparkles, Ruler, ChevronRight, CheckCircle2, Glasses, Watch, Shirt, Footprints, Gem, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useGender } from '../contexts/GenderContext';
import { toast } from 'sonner';
import { CATEGORIES, CATALOGS, CategoryId } from '../data/catalog';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Local types and constants removed as they are imported from ../data/catalog


export function TryOn() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { gender } = useGender();
  
  const activeCategory = (CATEGORIES.find(c => c.id === categoryId)?.id || 'glasses') as CategoryId;
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [portraitBase64, setPortraitBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ measurement: string, characteristic: string, recommendation: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<typeof CATALOGS['glasses'][0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [firestoreProducts, setFirestoreProducts] = useState<any[]>([]);

  const currentConfig = CATEGORIES.find(c => c.id === activeCategory)!;
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFirestoreProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  const localCatalog = CATALOGS[activeCategory] || [];
  const dbCatalog = firestoreProducts.filter(p => p.category === activeCategory);
  
  // Merge and filter by gender
  const combinedCatalog = [...dbCatalog, ...localCatalog].filter(item => item.gender === gender || item.gender === 'unisex');
  // Remove duplicates by ID
  const currentCatalog = Array.from(new Map(combinedCatalog.map(item => [item.id, item])).values());

  // Reset state when category changes
  useEffect(() => {
    setStep(1);
    setPortraitBase64(null);
    setAnalysisResult(null);
    setSelectedItem(null);
    setTryOnImage(null);
    setIsSaved(false);
  }, [activeCategory]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPortraitBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  } as any);

  const analyzeImage = async () => {
    if (!portraitBase64) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = portraitBase64.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          currentConfig.analysisPrompt
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      setAnalysisResult(result);
      
      // After analysis, automatically trigger generation
      await generateTryOn(result);
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error(language === 'ar' ? 'فشل تحليل الصورة. يرجى المحاولة مرة أخرى.' : 'Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const fetchImageAsBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateTryOn = async (analysisResultData: any) => {
    if (!portraitBase64 || !selectedItem) return;
    
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    setIsAnalyzing(false); // Turn off analyzing spinner
    setStep(3); // Move to result view (which will show generating spinner)
    setIsSaved(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const portraitBase64Data = portraitBase64.split(',')[1];
      const itemBase64Full = await fetchImageAsBase64(selectedItem.image);
      const itemBase64Data = itemBase64Full.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Reference Image 1: A high-resolution photo of a person's ${currentConfig.promptTarget}.` },
            {
              inlineData: {
                data: portraitBase64Data,
                mimeType: "image/jpeg",
              },
            },
            { text: `Reference Image 2: A product photo of ${currentConfig.label}.` },
            {
              inlineData: {
                data: itemBase64Data,
                mimeType: "image/jpeg",
              },
            },
            {
              text: `Instructions:

Extraction & Placement: Extract the item from Image 2 and place it onto the ${currentConfig.promptTarget} in Image 1.

Perspective & Alignment: Automatically warp and adjust the item's perspective to match the anatomy's tilt and angle.

Realistic Integration: Apply 'Ambient Occlusion' and 'Contact Shadows' where the item touches the body.

Fidelity: Add realistic reflections and subtle textures so it looks like a real physical object under the current lighting of the portrait.

Final Output: A photorealistic image where the user is naturally wearing the item. No artifacts, 100% seamless blending.`,
            },
          ],
        }
      });

      let generatedImageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (generatedImageUrl) {
        setTryOnImage(generatedImageUrl);
      } else {
        throw new Error("No image generated");
      }

    } catch (error: any) {
      console.error("Try-on generation failed", error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403') || errorMessage.includes('Requested entity was not found')) {
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          toast.error(language === 'ar' ? 'يرجى اختيار مفتاح API صالح والمحاولة مرة أخرى.' : 'Please select a valid API key and try again.');
        } else {
          toast.error(language === 'ar' ? 'تم رفض الإذن. يرجى التأكد من صلاحيات مفتاح API.' : 'Permission denied. Please ensure your API key has access.');
        }
      } else {
        toast.error(language === 'ar' ? 'فشل توليد التجربة. يرجى المحاولة مرة أخرى.' : 'Failed to generate try-on. Please try again.');
      }
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTryOn = async () => {
    if (!auth.currentUser || !tryOnImage || !selectedItem) return;
    
    setIsSaving(true);
    try {
      let imageToSave = tryOnImage;
      
      // Basic compression if image is too large for Firestore (1MB limit)
      if (imageToSave.length > 1000000) {
        const img = new Image();
        img.src = imageToSave;
        await new Promise(resolve => { img.onload = resolve; });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale down to max 800x800 while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        imageToSave = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
      }

      await addDoc(collection(db, 'tryons'), {
        userId: auth.currentUser.uid,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        category: activeCategory,
        imageUrl: imageToSave,
        createdAt: new Date().toISOString()
      });
      setIsSaved(true);
      toast.success(language === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tryons');
      toast.error(language === 'ar' ? 'فشل الحفظ.' : 'Failed to save try-on.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 pt-16">
      {/* Sidebar Navigation */}
      <aside className={`w-64 fixed h-[calc(100vh-4rem)] border-stone-200 bg-white hidden md:flex flex-col overflow-y-auto z-10 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'}`}>
        <div className="p-6">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{t('tryon.categories')}</h3>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <Link
                  key={cat.id}
                  to={`/try-on/${cat.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-stone-100 text-stone-900 font-medium' 
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-stone-900' : 'text-stone-400'}`} />
                  {t(`cat.${cat.id}.label`)}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-w-0 p-4 md:p-12 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'}`}>
        <div className="max-w-5xl mx-auto">
          
          {/* Mobile Category Selector (Dropdown/Horizontal Scroll) */}
          <div className="md:hidden flex overflow-x-auto pb-4 mb-8 hide-scrollbar gap-2 w-full">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <Link
                  key={cat.id}
                  to={`/try-on/${cat.id}`}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? 'bg-stone-900 text-white shadow-md' 
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{t(`cat.${cat.id}.label`)}</span>
                </Link>
              );
            })}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 md:mb-12">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {s}
                </div>
                {i < 2 && (
                  <div className={`w-8 md:w-16 h-px mx-1 md:mx-2 ${step > s ? 'bg-stone-900' : 'bg-stone-200'}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Catalog */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-2">{t('tryon.step2.select')} {t(`cat.${currentConfig.id}.label`)}</h2>
                  <p className="text-stone-500">{t(`cat.${currentConfig.id}.desc`)}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentCatalog.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col transition-all hover:shadow-md hover:border-stone-200"
                    >
                      <Link to={`/product/${item.id}`} className="aspect-video bg-stone-50 rounded-xl mb-4 overflow-hidden relative block group">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                      </Link>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <Link to={`/product/${item.id}`} className="hover:underline">
                            <h4 className="font-medium text-stone-900 text-lg">{item.name}</h4>
                          </Link>
                          <p className="text-sm text-stone-500">{item.type}</p>
                        </div>
                        <p className="font-serif text-lg text-stone-900">${item.price}</p>
                      </div>
                      <div className="mt-auto flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setStep(2);
                          }}
                          className="flex-1 bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          {t('tryon.virtualTryOn')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Upload */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto w-full"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-4">{t('tryon.step1.title')}</h2>
                  <p className="text-stone-500 text-sm md:text-base">
                    {language === 'ar' 
                      ? `يرجى توفير ${t(`cat.${currentConfig.id}.upload`)} واضحة لتجربة ${selectedItem?.name}.`
                      : `Please provide a clear ${t(`cat.${currentConfig.id}.upload`)} to try on ${selectedItem?.name}.`}
                  </p>
                </div>

                {!portraitBase64 ? (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-stone-900 bg-stone-100' : 'border-stone-300 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-6 h-6 md:w-8 md:h-8 text-stone-600" />
                    </div>
                    <p className="text-stone-900 font-medium mb-1 text-sm md:text-base">{t('tryon.step1.drag')}</p>
                    <p className="text-stone-500 text-xs md:text-sm">{t('tryon.step1.browse')}</p>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                    <div className="relative aspect-[3/4] md:aspect-square rounded-xl overflow-hidden mb-6 bg-stone-100">
                      <img src={portraitBase64} alt="Uploaded portrait" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPortraitBase64(null)}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-stone-900 hover:bg-white transition-colors"
                      >
                        {t('tryon.step1.change')}
                      </button>
                    </div>
                    <button 
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="w-5 h-5 animate-spin" />
                          {t('tryon.step1.analyzing')}
                        </>
                      ) : (
                        <>
                          {t('tryon.step1.analyze')}
                          <ChevronRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={() => setStep(1)}
                    className="text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors"
                  >
                    {language === 'ar' ? 'العودة إلى المنتجات' : 'Back to Catalog'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Result */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid xl:grid-cols-3 gap-8"
              >
                {/* Left Column: Analysis Results */}
                <div className="xl:col-span-1 space-y-6">
                  {analysisResult && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                      <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-stone-900" />
                        <h3 className="text-lg font-serif text-stone-900">{t('tryon.step2.analysis')}</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-stone-500 mb-1">{currentConfig.characteristicLabel}</p>
                          <p className="text-stone-900 font-medium text-lg">{analysisResult.characteristic}</p>
                        </div>
                        <div className="h-px bg-stone-100" />
                        <div>
                          <p className="text-sm text-stone-500 mb-1">{currentConfig.measurementLabel}</p>
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-stone-400" />
                            <p className="text-stone-900 font-medium text-lg">{analysisResult.measurement}</p>
                          </div>
                        </div>
                        <div className="h-px bg-stone-100" />
                        <div>
                          <p className="text-sm text-stone-500 mb-1">{t('tryon.step2.recommendation')}</p>
                          <p className="text-stone-700 leading-relaxed">{analysisResult.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Item Card */}
                  {selectedItem && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                      <h4 className="text-sm font-medium text-stone-500 mb-3 uppercase tracking-wider">Selected Item</h4>
                      <div className="flex items-center gap-4">
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-stone-900">{selectedItem.name}</p>
                          <p className="text-sm text-stone-500">${selectedItem.price}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Generated Image */}
                <div className="xl:col-span-2 text-center">
                  <h2 className="text-3xl font-serif text-stone-900 mb-2">{t('tryon.step3.title')}</h2>
                  <p className="text-stone-500 mb-8">{t('tryon.step3.desc')}</p>
                  
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 mb-8 relative min-h-[400px] flex items-center justify-center">
                    {isGenerating ? (
                      <div className="flex flex-col items-center text-stone-500">
                        <Sparkles className="w-8 h-8 animate-spin mb-4 text-stone-900" />
                        <p>{t('tryon.step2.generating')}</p>
                      </div>
                    ) : tryOnImage ? (
                      <img src={tryOnImage} alt="Virtual Try-On Result" className="w-full rounded-2xl" />
                    ) : null}
                  </div>

                  {!isGenerating && tryOnImage && (
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => setStep(1)}
                        className="px-8 py-4 rounded-xl font-medium text-stone-600 hover:bg-stone-200 bg-stone-100 transition-colors"
                      >
                        {t('tryon.step3.tryAnother')}
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedItem) {
                            addToCart({
                              id: selectedItem.id,
                              name: selectedItem.name,
                              price: selectedItem.price,
                              image: selectedItem.image,
                              type: selectedItem.type
                            });
                          }
                        }}
                        className="bg-stone-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors"
                      >
                        {t('tryon.step3.addCart')}
                      </button>
                      {auth.currentUser && (
                        <button 
                          onClick={handleSaveTryOn}
                          disabled={isSaving || isSaved}
                          className={`px-8 py-4 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                            isSaved 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200'
                          }`}
                        >
                          {isSaving ? (
                            <Sparkles className="w-5 h-5 animate-spin" />
                          ) : isSaved ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : null}
                          {isSaved ? t('tryon.step3.saved') : t('tryon.step3.save')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
