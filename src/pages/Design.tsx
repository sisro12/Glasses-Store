import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Image as ImageIcon, Download, Loader2, BookmarkPlus } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export function Design() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const generateImage = async () => {
    if (!prompt) return;
    
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `High-end luxury fashion product photography. ${prompt}. Professional studio lighting, minimalist background, 8k resolution, photorealistic.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: size
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/jpeg;base64,${part.inlineData.data}`);
          toast.success(language === 'ar' ? 'تم توليد التصميم بنجاح!' : 'Design generated successfully!');
          break;
        }
      }
    } catch (error: any) {
      console.error("Image generation failed", error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403') || errorMessage.includes('Requested entity was not found')) {
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          toast.error(language === 'ar' ? 'يرجى اختيار مفتاح API صالح والمحاولة مرة أخرى.' : 'Please select a valid API key and try again.');
        } else {
          toast.error(language === 'ar' ? 'تم رفض الإذن. يرجى التأكد من صلاحيات مفتاح API.' : 'Permission denied. Please ensure your API key has access.');
        }
      } else {
        toast.error(language === 'ar' ? 'فشل توليد الصورة. يرجى المحاولة مرة أخرى.' : 'Failed to generate image. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDesign = async () => {
    if (!auth.currentUser) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لحفظ التصميم' : 'Please sign in to save design');
      return;
    }
    if (!generatedImage) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'saved_designs'), {
        userId: auth.currentUser.uid,
        imageUrl: generatedImage,
        prompt: prompt,
        size: size,
        createdAt: new Date().toISOString()
      });
      toast.success(language === 'ar' ? 'تم حفظ التصميم في ملفك الشخصي' : 'Design saved to your profile');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'saved_designs');
      toast.error(language === 'ar' ? 'فشل حفظ التصميم' : 'Failed to save design');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">{t('design.title')}</h1>
          <p className="text-stone-500 max-w-2xl mx-auto">
            {t('design.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 mb-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">
                {t('design.title')}
              </label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('design.placeholder')}
                className="w-full h-32 p-4 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-0 resize-none transition-colors"
              />
            </div>
            
            <div className="w-full md:w-64 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  {t('design.resolution')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${size === s ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={generateImage}
                disabled={isGenerating || !prompt}
                className="mt-auto w-full py-4 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('design.generating')}</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> {t('design.generate')}</>
                )}
              </button>
            </div>
          </div>
        </div>

        {generatedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100"
          >
            <div className="relative rounded-2xl overflow-hidden bg-stone-100">
              <img src={generatedImage} alt="Generated Design" className="w-full h-auto" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={saveDesign}
                  disabled={isSaving}
                  className="p-3 bg-white/90 backdrop-blur rounded-full text-stone-900 hover:bg-white transition-colors shadow-sm disabled:opacity-50"
                  title={language === 'ar' ? 'حفظ التصميم' : 'Save Design'}
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookmarkPlus className="w-5 h-5" />}
                </button>
                <a 
                  href={generatedImage} 
                  download="aura-bespoke-design.jpg"
                  className="p-3 bg-white/90 backdrop-blur rounded-full text-stone-900 hover:bg-white transition-colors shadow-sm"
                  title={t('design.download')}
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
