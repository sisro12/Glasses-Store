import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function Home() {
  const [trends, setTrends] = useState<string>('');
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    async function fetchTrends() {
      setIsLoadingTrends(true);
      try {
        const promptLang = language === 'ar' ? 'in Arabic' : 'in English';
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `What are the top 3 luxury fashion trends right now covering eyewear, watches, and apparel? Provide a short, stylish 2-sentence summary ${promptLang}.`
        });
        setTrends(response.text || (language === 'ar' ? "تستمر الكرونوغرافات البسيطة والنظارات الهندسية الجريئة في السيطرة على أزياء الموضة الفاخرة هذا الموسم." : "Minimalist chronographs and bold geometric eyewear continue to dominate luxury fashion this season."));
      } catch (error) {
        console.error("Failed to fetch trends", error);
        setTrends(language === 'ar' ? "تستمر الكرونوغرافات البسيطة والنظارات الهندسية الجريئة في السيطرة على أزياء الموضة الفاخرة هذا الموسم." : "Minimalist chronographs and bold geometric eyewear continue to dominate luxury fashion this season.");
      } finally {
        setIsLoadingTrends(false);
      }
    }
    fetchTrends();
  }, [language]);

  const titleWords = t('home.hero.title').split(' ');

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop" 
            alt="Luxury Fashion" 
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"></div>
        </motion.div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto mt-16">
          <div className="overflow-hidden mb-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="text-6xl md:text-8xl lg:text-9xl font-serif tracking-tight inline-block"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            className="text-lg md:text-2xl font-sans font-light mb-12 max-w-2xl mx-auto opacity-90"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          >
            <Link 
              to="/try-on" 
              className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-stone-900 transition-all duration-500 group"
            >
              <span className="tracking-widest uppercase text-sm">{t('home.hero.cta')}</span>
              <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-200/50 text-stone-700 text-xs font-medium uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-3 h-3" />
            {t('home.collections.tag')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif text-stone-900 mb-6 tracking-tight"
          >
            {t('home.collections.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 max-w-2xl mx-auto leading-relaxed text-lg font-light"
          >
            {t('home.collections.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { id: 'glasses', title: t('cat.glasses'), desc: t('cat.glasses.desc'), img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop' },
            { id: 'watches', title: t('cat.watches'), desc: t('cat.watches.desc'), img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop' },
            { id: 'hats', title: t('cat.hats'), desc: t('cat.hats.desc'), img: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?q=80&w=800&auto=format&fit=crop' },
            { id: 'accessories', title: t('cat.accessories'), desc: t('cat.accessories.desc'), img: 'https://images.unsplash.com/photo-1599643478524-fb66f70d00ea?q=80&w=800&auto=format&fit=crop' },
            { id: 'shoes', title: t('cat.shoes'), desc: t('cat.shoes.desc'), img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop' },
            { id: 'tshirts', title: t('cat.tshirts'), desc: t('cat.tshirts.desc'), img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
          ].map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link 
                to={`/try-on/${cat.id}`}
                className="group relative block h-[400px] w-full rounded-[2rem] overflow-hidden"
              >
                <img 
                  src={cat.img} 
                  alt={cat.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col justify-end">
                  <div className="flex items-end justify-between mb-3">
                    <h3 className="text-3xl font-serif text-white">{cat.title}</h3>
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-stone-900 transition-all duration-500 shrink-0">
                      <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className="text-stone-300 font-light text-sm line-clamp-2">{cat.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
