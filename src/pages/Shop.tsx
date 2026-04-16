import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { CATEGORIES, CATALOGS, CategoryId } from '../data/catalog';

export function Shop() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [genderFilter, setGenderFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch from Firestore
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const firestoreProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Combine with local catalog (optional, but good for having initial data)
        let localProducts: any[] = [];
        Object.entries(CATALOGS).forEach(([category, items]) => {
          items.forEach(item => {
            localProducts.push({ ...item, category });
          });
        });

        // Merge, preferring Firestore if IDs match (unlikely, but safe)
        const combined = [...firestoreProducts, ...localProducts];
        
        // Remove duplicates by ID just in case
        const uniqueProducts = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price <= maxPrice;
    const matchesGender = genderFilter === 'all' || product.gender === genderFilter || product.gender === 'unisex';
    
    return matchesSearch && matchesCategory && matchesPrice && matchesGender;
  });

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">{language === 'ar' ? 'المتجر' : 'Shop All'}</h1>
          <p className="text-stone-500 max-w-2xl mx-auto">
            {language === 'ar' ? 'اكتشف مجموعتنا الكاملة من المنتجات الفاخرة.' : 'Discover our complete collection of luxury products.'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 shrink-0 space-y-8">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 ${language === 'ar' ? 'right-4' : 'left-4'}`} />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'ابحث عن منتج...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-white border border-stone-200 rounded-full py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
              />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-8">
              <div className="flex items-center gap-2 text-stone-900 font-medium mb-4">
                <Filter className="w-5 h-5" />
                {language === 'ar' ? 'تصفية' : 'Filters'}
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">{language === 'ar' ? 'الفئة' : 'Category'}</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="category" checked={selectedCategory === 'all'} onChange={() => setSelectedCategory('all')} className="text-stone-900 focus:ring-stone-900" />
                    <span className="text-stone-700">{language === 'ar' ? 'الكل' : 'All'}</span>
                  </label>
                  {CATEGORIES.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="category" checked={selectedCategory === cat.id} onChange={() => setSelectedCategory(cat.id)} className="text-stone-900 focus:ring-stone-900" />
                      <span className="text-stone-700">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">{language === 'ar' ? 'الجنس' : 'Gender'}</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="gender" checked={genderFilter === 'all'} onChange={() => setGenderFilter('all')} className="text-stone-900 focus:ring-stone-900" />
                    <span className="text-stone-700">{language === 'ar' ? 'الكل' : 'All'}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="gender" checked={genderFilter === 'men'} onChange={() => setGenderFilter('men')} className="text-stone-900 focus:ring-stone-900" />
                    <span className="text-stone-700">{language === 'ar' ? 'رجال' : 'Men'}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="gender" checked={genderFilter === 'women'} onChange={() => setGenderFilter('women')} className="text-stone-900 focus:ring-stone-900" />
                    <span className="text-stone-700">{language === 'ar' ? 'نساء' : 'Women'}</span>
                  </label>
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">{language === 'ar' ? 'السعر الأقصى' : 'Max Price'}</h3>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-stone-900"
                />
                <div className="flex justify-between text-sm text-stone-500 mt-2">
                  <span>$0</span>
                  <span className="font-medium text-stone-900">${maxPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-100">
                <p className="text-stone-500 text-lg">{language === 'ar' ? 'لم يتم العثور على منتجات تطابق بحثك.' : 'No products found matching your criteria.'}</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setMaxPrice(1000); setGenderFilter('all'); }}
                  className="mt-4 text-stone-900 font-medium underline"
                >
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, i) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col transition-all hover:shadow-md hover:border-stone-200 group"
                  >
                    <Link to={`/product/${product.id}`} className="aspect-square bg-stone-50 rounded-xl mb-4 overflow-hidden relative block">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                      {product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {language === 'ar' ? 'كمية محدودة' : 'Low Stock'}
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-stone-900 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                            {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <Link to={`/product/${product.id}`} className="hover:underline">
                          <h4 className="font-medium text-stone-900 text-lg line-clamp-1">{product.name}</h4>
                        </Link>
                        <p className="text-sm text-stone-500 capitalize">{product.category} • {product.type}</p>
                      </div>
                      <p className="font-serif text-lg text-stone-900">${product.price}</p>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Link 
                        to={`/product/${product.id}`}
                        className="flex-1 bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {language === 'ar' ? 'التفاصيل' : 'Details'}
                      </Link>
                      <Link 
                        to={`/try-on/${product.category}`}
                        className="flex-1 bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {language === 'ar' ? 'تجربة' : 'Try-On'}
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
