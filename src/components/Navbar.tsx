import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, LogIn, LogOut, User, Globe, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useGender } from '../contexts/GenderContext';

export function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { language, toggleLanguage, t } = useLanguage();
  const { items, setIsCartOpen } = useCart();
  const { setGender } = useGender();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleBack = () => {
    if (location.pathname === '/') {
      setGender(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 pointer-events-none">
      <nav className="mx-auto max-w-6xl bg-white/70 backdrop-blur-lg border border-white/40 rounded-full px-6 h-16 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] pointer-events-auto transition-all duration-500 glass-nav">
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            title={language === 'ar' ? 'رجوع' : 'Back'}
          >
            {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span className="hidden md:inline text-sm font-medium uppercase">
              {language === 'ar' ? 'رجوع' : 'Back'}
            </span>
          </button>
          <Link to="/" className="text-2xl font-serif tracking-tight text-stone-900">
            AURA
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link to="/shop" className="hover:text-stone-900 transition-colors uppercase">{language === 'ar' ? 'المتجر' : 'Shop'}</Link>
          <Link to="/try-on" className="hover:text-stone-900 transition-colors flex items-center gap-2 uppercase">
            <Camera className="w-4 h-4" />
            {t('nav.tryOn')}
          </Link>
          {user?.email && ['alwashameen96@gmail.com', 'sisro.savagon22@gmail.com'].includes(user.email) && (
            <Link to="/admin" className="hover:text-stone-900 transition-colors uppercase font-bold text-stone-900">
              {language === 'ar' ? 'لوحة التحكم' : 'Admin'}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-stone-900 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="hidden md:inline">{user.displayName}</span>
              </Link>
              <button onClick={handleLogout} className="text-stone-500 hover:text-stone-900">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="uppercase">{language === 'en' ? 'SIGN IN' : 'تسجيل الدخول'}</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
