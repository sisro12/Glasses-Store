import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navbar
    'nav.tryOn': 'Virtual Try-On',
    'nav.design': 'Bespoke Studio',
    // Home
    'home.hero.title': 'Redefine your style.',
    'home.hero.subtitle': 'Discover fashion crafted for the modern visionary. Experience our AI-powered virtual try-on for eyewear, watches, apparel, and more.',
    'home.hero.cta': 'Start Virtual Try-On',
    'home.collections.tag': 'The Collections',
    'home.collections.title': 'Precision meets elegance.',
    'home.collections.subtitle': 'Select a category below to experience our proprietary AI Virtual Try-On. Every item is anatomically scaled to your unique structure.',
    'cat.glasses': 'Eyewear',
    'cat.glasses.desc': 'Discover frames that perfectly complement your face shape.',
    'cat.watches': 'Timepieces',
    'cat.watches.desc': 'Find the perfect dial size and strap for your wrist.',
    'cat.hats': 'Hats & Headwear',
    'cat.hats.desc': 'Crown your style with anatomically scaled headwear.',
    'cat.accessories': 'Jewelry',
    'cat.accessories.desc': 'Adorn yourself with pieces that match your undertone.',
    'cat.shoes': 'Footwear',
    'cat.shoes.desc': 'Step into luxury with our curated shoe collection.',
    'cat.tshirts': 'Apparel',
    'cat.tshirts.desc': 'Experience the perfect fit tailored to your build.',
    
    // Category Labels & Upload Texts
    'cat.glasses.label': 'Eyewear',
    'cat.glasses.upload': 'front-facing portrait',
    'cat.hats.label': 'Hats',
    'cat.hats.upload': 'front-facing portrait',
    'cat.watches.label': 'Watches',
    'cat.watches.upload': 'photo of your wrist/arm',
    'cat.accessories.label': 'Accessories',
    'cat.accessories.upload': 'portrait or neck photo',
    'cat.shoes.label': 'Shoes',
    'cat.shoes.upload': 'photo of your feet/legs',
    'cat.tshirts.label': 'Apparel',
    'cat.tshirts.upload': 'upper body photo',

    // TryOn
    'tryon.categories': 'Categories',
    'tryon.step1.title': 'Upload your photo',
    'tryon.step1.drag': 'Drag & drop your photo here',
    'tryon.step1.browse': 'or click to browse files',
    'tryon.step1.change': 'Change Photo',
    'tryon.step1.analyze': 'Analyze & Continue',
    'tryon.step1.analyzing': 'Analyzing Anatomy...',
    'tryon.virtualTryOn': 'Virtual Try-On',
    'tryon.price': 'Price',
    'tryon.step2.analysis': 'AI Analysis',
    'tryon.step2.recommendation': 'Recommendation',
    'tryon.step2.select': 'Select',
    'tryon.step2.tryOnBtn': 'Try On Selected Item',
    'tryon.step2.generating': 'Generating Try-On...',
    'tryon.step3.title': 'Your Perfect Fit',
    'tryon.step3.desc': 'Generated with 100% anatomical accuracy.',
    'tryon.step3.tryAnother': 'Try Another Style',
    'tryon.step3.addCart': 'Add to Cart',
    'tryon.step3.save': 'Save to My Account',
    'tryon.step3.saved': 'Saved!',
    
    // Design
    'design.title': 'Bespoke Studio',
    'design.subtitle': 'Describe your dream luxury item, and our AI will generate a photorealistic 4K design.',
    'design.placeholder': 'e.g., A minimalist rose gold chronograph watch with a navy blue leather strap...',
    'design.resolution': 'Resolution',
    'design.generate': 'Generate Design',
    'design.generating': 'Generating...',
    'design.download': 'Download High-Res',
    
    // Profile
    'profile.title': 'My Saved Looks',
    'profile.empty': 'You haven\'t saved any looks yet.',
    'profile.delete': 'Delete',
  },
  ar: {
    // Navbar
    'nav.tryOn': 'القياس الافتراضي',
    'nav.design': 'استوديو التصميم',
    // Home
    'home.hero.title': 'أعد تعريف أسلوبك.',
    'home.hero.subtitle': 'اكتشف أزياء مصممة لأصحاب الرؤية العصرية. جرب القياس الافتراضي المدعوم بالذكاء الاصطناعي للنظارات، الساعات، الملابس، والمزيد.',
    'home.hero.cta': 'ابدأ القياس الافتراضي',
    'home.collections.tag': 'المجموعات',
    'home.collections.title': 'الدقة تلتقي بالأناقة.',
    'home.collections.subtitle': 'اختر فئة أدناه لتجربة القياس الافتراضي المدعوم بالذكاء الاصطناعي. يتم ضبط مقاس كل قطعة تشريحياً لتناسب بنيتك الفريدة.',
    'cat.glasses': 'نظارات',
    'cat.glasses.desc': 'اكتشف الإطارات التي تكمل شكل وجهك بشكل مثالي.',
    'cat.watches': 'ساعات',
    'cat.watches.desc': 'اعثر على حجم المينا والحزام المثالي لمعصمك.',
    'cat.hats': 'قبعات',
    'cat.hats.desc': 'توج أسلوبك بقبعات متناسبة تشريحياً.',
    'cat.accessories': 'مجوهرات',
    'cat.accessories.desc': 'تزين بقطع تتناسب مع لون بشرتك.',
    'cat.shoes': 'أحذية',
    'cat.shoes.desc': 'اخطُ نحو الفخامة مع مجموعتنا المختارة من الأحذية.',
    'cat.tshirts': 'ملابس',
    'cat.tshirts.desc': 'جرب المقاس المثالي المصمم خصيصاً لبنيتك.',
    
    // Category Labels & Upload Texts
    'cat.glasses.label': 'النظارات',
    'cat.glasses.upload': 'صورة أمامية للوجه',
    'cat.hats.label': 'القبعات',
    'cat.hats.upload': 'صورة أمامية للوجه',
    'cat.watches.label': 'الساعات',
    'cat.watches.upload': 'صورة لمعصمك/ذراعك',
    'cat.accessories.label': 'الإكسسوارات',
    'cat.accessories.upload': 'صورة للوجه أو الرقبة',
    'cat.shoes.label': 'الأحذية',
    'cat.shoes.upload': 'صورة لقدميك/ساقيك',
    'cat.tshirts.label': 'الملابس',
    'cat.tshirts.upload': 'صورة للجزء العلوي من الجسم',

    // TryOn
    'tryon.categories': 'الفئات',
    'tryon.step1.title': 'ارفع صورتك',
    'tryon.step1.drag': 'اسحب وأفلت صورتك هنا',
    'tryon.step1.browse': 'أو اضغط لتصفح الملفات',
    'tryon.step1.change': 'تغيير الصورة',
    'tryon.step1.analyze': 'تحليل ومتابعة',
    'tryon.step1.analyzing': 'جاري تحليل البنية...',
    'tryon.virtualTryOn': 'تجربة افتراضية',
    'tryon.price': 'السعر',
    'tryon.step2.analysis': 'تحليل الذكاء الاصطناعي',
    'tryon.step2.recommendation': 'التوصية',
    'tryon.step2.select': 'اختر',
    'tryon.step2.tryOnBtn': 'تجربة القطعة المحددة',
    'tryon.step2.generating': 'جاري توليد التجربة...',
    'tryon.step3.title': 'مقاسك المثالي',
    'tryon.step3.desc': 'تم التوليد بدقة تشريحية 100%.',
    'tryon.step3.tryAnother': 'جرب تصميماً آخر',
    'tryon.step3.addCart': 'أضف إلى السلة',
    'tryon.step3.save': 'حفظ في حسابي',
    'tryon.step3.saved': 'تم الحفظ!',
    
    // Design
    'design.title': 'استوديو التصميم',
    'design.subtitle': 'صف قطعة الأزياء الفاخرة التي تحلم بها، وسيقوم الذكاء الاصطناعي بتوليد تصميم واقعي بدقة 4K.',
    'design.placeholder': 'مثال: ساعة كرونوغراف ذهبية وردية بتصميم بسيط مع حزام جلدي أزرق داكن...',
    'design.resolution': 'الدقة',
    'design.generate': 'توليد التصميم',
    'design.generating': 'جاري التوليد...',
    'design.download': 'تحميل بدقة عالية',
    
    // Profile
    'profile.title': 'إطلالاتي المحفوظة',
    'profile.empty': 'لم تقم بحفظ أي إطلالات بعد.',
    'profile.delete': 'حذف',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
