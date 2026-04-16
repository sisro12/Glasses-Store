import { useState } from 'react';
import { useGender } from '../contexts/GenderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export function GenderSelect() {
  const { setGender } = useGender();
  const { language } = useLanguage();
  const [hovered, setHovered] = useState<'men' | 'women' | null>(null);

  return (
    <div className="h-screen w-full flex flex-row overflow-hidden bg-black font-sans">
      {/* Men Section */}
      <motion.div
        animate={{
          flex: hovered === 'men' ? 1.6 : hovered === 'women' ? 0.6 : 1,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setHovered('men')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => setGender('men')}
        className="relative h-full cursor-pointer overflow-hidden group border-r border-white/10"
      >
        <div className="absolute inset-0 bg-zinc-950 z-0" />
        <motion.img
          animate={{ scale: hovered === 'men' ? 1.05 : 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-70 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 md:p-8">
          <motion.div
            animate={{ y: hovered === 'men' ? -20 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase leading-none" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              <span className="md:hidden">{language === 'ar' ? 'رجال' : 'MEN'}</span>
            </h2>
            <h2 className="hidden md:block text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase leading-none">
              {language === 'ar' ? 'رجال' : 'MEN'}
            </h2>
          </motion.div>
          
          <motion.div
            animate={{ 
              opacity: hovered === 'men' ? 1 : 0, 
              y: hovered === 'men' ? 0 : 20,
              scale: hovered === 'men' ? 1 : 0.9
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-12 md:bottom-24 flex items-center gap-4 text-white/90 tracking-[0.3em] text-xs md:text-base uppercase font-medium"
          >
            <span className="hidden sm:inline">{language === 'ar' ? 'اكتشف المجموعة' : 'Explore Collection'}</span>
            <div className="w-8 sm:w-16 h-[1px] bg-white/90" />
          </motion.div>
        </div>
      </motion.div>

      {/* Women Section */}
      <motion.div
        animate={{
          flex: hovered === 'women' ? 1.6 : hovered === 'men' ? 0.6 : 1,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setHovered('women')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => setGender('women')}
        className="relative h-full cursor-pointer overflow-hidden group"
      >
        <div className="absolute inset-0 bg-rose-950 z-0" />
        <motion.img
          animate={{ scale: hovered === 'women' ? 1.05 : 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-70 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-rose-950/20 to-rose-950/40" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 md:p-8">
          <motion.div
            animate={{ y: hovered === 'women' ? -20 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-rose-50 to-rose-200/40 uppercase leading-none" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              <span className="md:hidden">{language === 'ar' ? 'نساء' : 'WOMEN'}</span>
            </h2>
            <h2 className="hidden md:block text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-rose-50 to-rose-200/40 uppercase leading-none">
              {language === 'ar' ? 'نساء' : 'WOMEN'}
            </h2>
          </motion.div>
          
          <motion.div
            animate={{ 
              opacity: hovered === 'women' ? 1 : 0, 
              y: hovered === 'women' ? 0 : 20,
              scale: hovered === 'women' ? 1 : 0.9
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-12 md:bottom-24 flex items-center gap-4 text-rose-50/90 tracking-[0.3em] text-xs md:text-base uppercase font-medium"
          >
            <div className="w-8 sm:w-16 h-[1px] bg-rose-50/90" />
            <span className="hidden sm:inline">{language === 'ar' ? 'اكتشفي المجموعة' : 'Explore Collection'}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
