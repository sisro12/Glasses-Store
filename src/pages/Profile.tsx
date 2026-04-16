import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, X, ZoomIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export function Profile() {
  const [activeTab, setActiveTab] = useState<'tryons' | 'designs' | 'orders'>('tryons');
  const [savedLooks, setSavedLooks] = useState<any[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchData(user.uid);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch Try-ons
      const tryonsQuery = query(collection(db, 'tryons'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const tryonsSnap = await getDocs(tryonsQuery);
      setSavedLooks(tryonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch Designs
      const designsQuery = query(collection(db, 'saved_designs'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const designsSnap = await getDocs(designsQuery);
      setSavedDesigns(designsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch Orders
      const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const ordersSnap = await getDocs(ordersQuery);
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTryon = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه التجربة؟' : 'Are you sure you want to delete this try-on?')) {
      try {
        await deleteDoc(doc(db, 'tryons', id));
        setSavedLooks(prev => prev.filter(look => look.id !== id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'tryons');
      }
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا التصميم؟' : 'Are you sure you want to delete this design?')) {
      try {
        await deleteDoc(doc(db, 'saved_designs', id));
        setSavedDesigns(prev => prev.filter(design => design.id !== id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'saved_designs');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-serif text-stone-900">{language === 'ar' ? 'حسابي' : 'My Profile'}</h1>
          
          <div className="flex bg-stone-200/50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('tryons')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tryons' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
            >
              {language === 'ar' ? 'التجارب الافتراضية' : 'Virtual Try-Ons'}
            </button>
            <button 
              onClick={() => setActiveTab('designs')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'designs' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
            >
              {language === 'ar' ? 'التصاميم المحفوظة' : 'Saved Designs'}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
            >
              {language === 'ar' ? 'الطلبات' : 'Orders'}
            </button>
          </div>
        </div>
        
        {/* Try-ons Tab */}
        {activeTab === 'tryons' && (
          savedLooks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
              <p className="text-stone-500">{t('profile.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedLooks.map((look) => (
                <div key={look.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 group">
                  <div className="aspect-[3/4] relative group/image cursor-pointer" onClick={() => setSelectedImage(look)}>
                    <img src={look.imageUrl} alt={look.itemName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity w-8 h-8 drop-shadow-md" />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTryon(look.id);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                      title={t('profile.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-stone-900 truncate">{look.itemName}</h3>
                    <p className="text-sm text-stone-500 capitalize">{look.category}</p>
                    <p className="text-xs text-stone-400 mt-2">
                      {new Date(look.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Designs Tab */}
        {activeTab === 'designs' && (
          savedDesigns.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
              <p className="text-stone-500">{language === 'ar' ? 'لا توجد تصاميم محفوظة.' : 'No saved designs yet.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDesigns.map((design) => (
                <div key={design.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 group">
                  <div className="aspect-video relative group/image cursor-pointer" onClick={() => setSelectedImage({ imageUrl: design.imageUrl, itemName: 'Custom Design', category: 'Design' })}>
                    <img src={design.imageUrl} alt="Saved Design" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity w-8 h-8 drop-shadow-md" />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDesign(design.id);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                      title={t('profile.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-stone-600 line-clamp-2 italic">"{design.prompt}"</p>
                    <p className="text-xs text-stone-400 mt-3">
                      {new Date(design.createdAt).toLocaleDateString()} • {design.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
              <p className="text-stone-500">{language === 'ar' ? 'لا توجد طلبات سابقة.' : 'No previous orders.'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-stone-100">
                    <div>
                      <p className="text-sm text-stone-500">{language === 'ar' ? 'رقم الطلب:' : 'Order ID:'} <span className="font-mono text-stone-900">{order.id}</span></p>
                      <p className="text-xs text-stone-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-lg text-stone-900">${order.totalAmount}</p>
                      <span className="inline-block mt-1 px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full font-medium">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-stone-50" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-900">{item.name}</p>
                          <p className="text-xs text-stone-500">{language === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-stone-900">${item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Zoom Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit
            >
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.itemName} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  draggable={false}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium">
            {selectedImage.itemName} • <span className="capitalize">{selectedImage.category}</span>
          </div>
        </div>
      )}
    </div>
  );
}
