import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Plus, Edit2, Trash2, Package, ShoppingBag, X, Check, DollarSign, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export function Admin() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', type: '', category: 'glasses', price: 0, stock: 0, image: '', gender: 'unisex'
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const adminEmails = ['alwashameen96@gmail.com', 'sisro.savagon22@gmail.com'];
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAdmin(true);
        fetchProducts();
        subscribeToOrders();
      } else {
        navigate('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const subscribeToOrders = () => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    }, (error) => {
      console.error("Failed to fetch orders", error);
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productForm,
          price: Number(productForm.price),
          stock: Number(productForm.stock)
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productForm,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          createdAt: new Date().toISOString()
        });
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', type: '', category: 'glasses', price: 0, stock: 0, image: '', gender: 'unisex' });
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'products');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
      // Update local state immediately for better UX
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
      toast.error(language === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status');
    }
  };

  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 5);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-serif text-stone-900">Admin Dashboard</h1>
          
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-stone-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'products' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Package className="w-4 h-4" />
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'orders' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {language === 'ar' ? 'الطلبات' : 'Orders'}
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-stone-500 font-medium">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</h3>
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif text-stone-900">${totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-stone-500 font-medium">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</h3>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif text-stone-900">{totalOrders}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-stone-500 font-medium">{language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}</h3>
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif text-stone-900">{totalProducts}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-stone-500 font-medium">{language === 'ar' ? 'تنبيهات المخزون' : 'Low Stock Alerts'}</h3>
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif text-stone-900">{lowStockProducts.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-stone-900">{language === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-stone-500 hover:text-stone-900">
                    {language === 'ar' ? 'عرض الكل' : 'View All'}
                  </button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-stone-900">{order.userEmail}</p>
                        <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-stone-900">${order.totalAmount}</p>
                        <span className={`text-xs font-medium ${
                          order.status === 'Delivered' ? 'text-green-600' :
                          order.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-stone-500 text-sm">{language === 'ar' ? 'لا توجد طلبات بعد.' : 'No orders yet.'}</p>
                  )}
                </div>
              </div>

              {/* Low Stock Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-stone-900">{language === 'ar' ? 'المنتجات منخفضة المخزون' : 'Low Stock Products'}</h3>
                  <button onClick={() => setActiveTab('products')} className="text-sm text-stone-500 hover:text-stone-900">
                    {language === 'ar' ? 'عرض الكل' : 'View All'}
                  </button>
                </div>
                <div className="space-y-4">
                  {lowStockProducts.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-stone-900">{product.name}</p>
                          <p className="text-sm text-stone-500 capitalize">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">{product.stock} left</p>
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <p className="text-stone-500 text-sm">{language === 'ar' ? 'جميع المنتجات متوفرة بكميات جيدة.' : 'All products are well stocked.'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium text-stone-900">{language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', type: '', category: 'glasses', price: 0, stock: 0, image: '', gender: 'unisex' });
                  setIsAddingProduct(true);
                }}
                className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
              </button>
            </div>

            {(isAddingProduct || editingProduct) && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-stone-900">
                    {editingProduct 
                      ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product') 
                      : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
                  </h3>
                  <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="text-stone-400 hover:text-stone-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{language === 'ar' ? 'الاسم' : 'Name'}</label>
                    <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{language === 'ar' ? 'النوع/الستايل' : 'Type/Style'}</label>
                    <input required type="text" value={productForm.type} onChange={e => setProductForm({...productForm, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{language === 'ar' ? 'الفئة' : 'Category'}</label>
                    <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900">
                      <option value="glasses">{language === 'ar' ? 'نظارات' : 'Glasses'}</option>
                      <option value="watches">{language === 'ar' ? 'ساعات' : 'Watches'}</option>
                      <option value="hats">{language === 'ar' ? 'قبعات' : 'Hats'}</option>
                      <option value="accessories">{language === 'ar' ? 'إكسسوارات' : 'Accessories'}</option>
                      <option value="shoes">{language === 'ar' ? 'أحذية' : 'Shoes'}</option>
                      <option value="tshirts">{language === 'ar' ? 'ملابس' : 'Apparel'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{language === 'ar' ? 'الجنس' : 'Gender'}</label>
                    <select value={productForm.gender} onChange={e => setProductForm({...productForm, gender: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900">
                      <option value="unisex">{language === 'ar' ? 'للجنسين' : 'Unisex'}</option>
                      <option value="men">{language === 'ar' ? 'رجال' : 'Men'}</option>
                      <option value="women">{language === 'ar' ? 'نساء' : 'Women'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{language === 'ar' ? 'السعر ($)' : 'Price ($)'}</label>
                    <input required type="number" min="0" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{language === 'ar' ? 'الكمية في المخزون' : 'Stock Quantity'}</label>
                    <input required type="number" min="0" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{language === 'ar' ? 'رابط الصورة' : 'Image URL'}</label>
                    <input required type="url" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-6 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium transition-colors">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                    <button type="submit" className="px-6 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 font-medium transition-colors">{language === 'ar' ? 'حفظ المنتج' : 'Save Product'}</button>
                  </div>
                </form>
              </div>
            )}

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <p className="text-stone-500">{language === 'ar' ? 'لا توجد منتجات. أضف بعض المنتجات للبدء.' : 'No products found. Add some to get started.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 group flex flex-col">
                    <div className="aspect-square relative overflow-hidden bg-stone-100">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button onClick={() => { setEditingProduct(product); setProductForm(product); }} className="p-2 bg-white/90 backdrop-blur-sm text-stone-600 hover:text-stone-900 rounded-full shadow-sm transition-colors" title={language === 'ar' ? 'تعديل' : 'Edit'}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full shadow-sm transition-colors" title={language === 'ar' ? 'حذف' : 'Delete'}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-stone-900 line-clamp-1" title={product.name}>{product.name}</h3>
                          <p className="text-sm text-stone-500 capitalize">{product.category} • {product.type} • {product.gender || 'unisex'}</p>
                        </div>
                        <p className="font-medium text-stone-900">${product.price}</p>
                      </div>
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock} {language === 'ar' ? 'في المخزون' : 'in stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-stone-900">{language === 'ar' ? 'إدارة الطلبات' : 'Manage Orders'}</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="p-4 text-sm font-semibold text-stone-600">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                      <th className="p-4 text-sm font-semibold text-stone-600">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                      <th className="p-4 text-sm font-semibold text-stone-600">{language === 'ar' ? 'العناصر' : 'Items'}</th>
                      <th className="p-4 text-sm font-semibold text-stone-600">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th className="p-4 text-sm font-semibold text-stone-600">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                      <th className="p-4 text-sm font-semibold text-stone-600">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className={`p-4 text-sm font-semibold text-stone-600 ${language === 'ar' ? 'text-left' : 'text-right'}`}>{language === 'ar' ? 'تحديث الحالة' : 'Update Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                        <td className="p-4 text-sm font-mono text-stone-500">{order.id.slice(0, 8)}...</td>
                        <td className="p-4 text-sm text-stone-900">{order.userEmail}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-3">
                            {order.items?.map((item: any, index: number) => (
                              <div key={index} className="flex items-center gap-3">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-stone-200 shadow-sm" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shadow-sm">
                                    <Package className="w-5 h-5 text-stone-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-stone-900 line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-stone-500">{language === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity || 1}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-stone-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-sm text-stone-900 font-medium">${order.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className={`p-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="text-sm border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-stone-900"
                          >
                            <option value="Pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                            <option value="Processing">{language === 'ar' ? 'قيد التجهيز' : 'Processing'}</option>
                            <option value="Shipped">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                            <option value="Delivered">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                            <option value="Cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-500">{language === 'ar' ? 'لا توجد طلبات.' : 'No orders found.'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
