import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ShoppingBag, Camera, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { CATALOGS, CategoryId } from '../data/catalog';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        // Try to fetch from Firestore
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Fallback to local catalog
          let found = null;
          for (const category in CATALOGS) {
            const items = CATALOGS[category as CategoryId];
            const item = items.find(i => i.id === id);
            if (item) {
              found = { ...item, category };
              break;
            }
          }
          if (found) {
            setProduct(found);
          } else {
            toast.error(language === 'ar' ? 'المنتج غير موجود' : 'Product not found');
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء جلب المنتج' : 'Error fetching product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, navigate, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors"
        >
          {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span className="text-sm font-medium uppercase tracking-wider">{language === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>

        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-12">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="aspect-square bg-stone-50 rounded-2xl overflow-hidden relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">{product.category}</span>
              <span className="w-1 h-1 rounded-full bg-stone-300"></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">{product.gender}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">{product.name}</h1>
            <p className="text-2xl font-light text-stone-600 mb-8">${product.price}</p>

            <div className="prose prose-stone mb-8">
              <p className="text-stone-500 leading-relaxed">
                {language === 'ar' 
                  ? `هذا الـ ${product.type} مصمم بعناية فائقة ليعكس الفخامة والأناقة. مصنوع من أجود المواد لضمان الراحة والمتانة. مثالي لإضافة لمسة من الرقي إلى إطلالتك اليومية.`
                  : `This ${product.type} is meticulously crafted to reflect luxury and elegance. Made from the finest materials to ensure comfort and durability. Perfect for adding a touch of sophistication to your everyday look.`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => {
                  addToCart(product);
                  toast.success(language === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
                }}
                className="flex-1 bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
              </button>
              
              <Link 
                to={`/try-on/${product.category}`}
                className="flex-1 bg-stone-100 text-stone-900 px-8 py-4 rounded-full font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                {language === 'ar' ? 'تجربة افتراضية' : 'Virtual Try-On'}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-stone-100 pt-8">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-6 h-6 text-stone-400" />
                <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">{language === 'ar' ? 'ضمان أصالة' : 'Authenticity'}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-stone-400" />
                <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">{language === 'ar' ? 'شحن مجاني' : 'Free Shipping'}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCw className="w-6 h-6 text-stone-400" />
                <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">{language === 'ar' ? 'إرجاع مجاني' : 'Free Returns'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
