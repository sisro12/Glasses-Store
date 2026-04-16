import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-20 pb-10 px-6 border-t border-stone-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & About */}
          <div className="space-y-6">
            <Link to="/" className="text-3xl font-serif tracking-tight text-white block">
              AURA
            </Link>
            <p className="text-sm leading-relaxed text-stone-400">
              {language === 'ar' 
                ? 'نقدم لك تجربة تسوق فريدة تجمع بين الفخامة والتكنولوجيا. اكتشف أحدث صيحات الموضة وجربها افتراضياً قبل الشراء.'
                : 'Providing a unique shopping experience that combines luxury and technology. Discover the latest fashion trends and try them on virtually before buying.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-wider text-sm">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/try-on" className="hover:text-white transition-colors">{t('nav.tryOn')}</Link></li>
              <li><Link to="/design" className="hover:text-white transition-colors">{t('nav.design')}</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">{language === 'ar' ? 'حسابي' : 'My Account'}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{language === 'ar' ? 'تتبع الطلب' : 'Track Order'}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-wider text-sm">
              {language === 'ar' ? 'خدمة العملاء' : 'Customer Service'}
            </h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">{language === 'ar' ? 'اتصل بنا' : 'Contact Us'}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{language === 'ar' ? 'سياسة الإرجاع' : 'Returns Policy'}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{language === 'ar' ? 'الشحن والتوصيل' : 'Shipping Info'}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-wider text-sm">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Info'}
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-stone-500 shrink-0" />
                <span>{language === 'ar' ? '123 شارع الموضة، دبي، الإمارات' : '123 Fashion Ave, Dubai, UAE'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-stone-500 shrink-0" />
                <span dir="ltr">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-stone-500 shrink-0" />
                <span>support@auraluxury.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>&copy; {new Date().getFullYear()} AURA Luxury. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
            <Link to="#" className="hover:text-white transition-colors">{language === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
