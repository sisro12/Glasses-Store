import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { toast } from 'sonner';

export function Checkout() {
  const { items, total, clearCart } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    paymentMethod: 'cod' // 'cod' or 'card'
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-12 px-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-stone-900 mb-4">{language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</h2>
        <button onClick={() => navigate('/try-on')} className="text-stone-500 hover:text-stone-900 underline">
          {language === 'ar' ? 'العودة للتسوق' : 'Return to shopping'}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لإتمام الطلب' : 'Please sign in to checkout');
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        shippingDetails: formData,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: total,
        shippingFee: 15,
        totalAmount: total + 15,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      
      // Update inventory stock
      for (const item of items) {
        // Only attempt to update if it looks like a Firestore ID (usually > 10 chars)
        if (item.id && item.id.length > 10) {
          try {
            await updateDoc(doc(db, 'products', item.id), {
              stock: increment(-item.quantity)
            });
          } catch (e) {
            console.error("Failed to update stock for item:", item.id, e);
          }
        }
      }

      clearCart();
      toast.success(language === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Order placed successfully!');
      navigate('/profile');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      toast.error(language === 'ar' ? 'فشل إتمام الطلب' : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

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

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Form */}
          <div className="flex-1">
            <h1 className="text-3xl font-serif text-stone-900 mb-8">{language === 'ar' ? 'إتمام الطلب' : 'Checkout'}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Details */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                <h2 className="text-xl font-medium text-stone-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-stone-400" />
                  {language === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-2">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-2">{language === 'ar' ? 'العنوان بالتفصيل' : 'Street Address'}</label>
                    <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">{language === 'ar' ? 'المدينة' : 'City'}</label>
                    <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">{language === 'ar' ? 'البلد' : 'Country'}</label>
                    <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-2">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900" dir="ltr" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                <h2 className="text-xl font-medium text-stone-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-stone-400" />
                  {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </h2>
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({...formData, paymentMethod: 'cod'})} className="w-4 h-4 text-stone-900 focus:ring-stone-900" />
                    <span className="font-medium text-stone-900">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                  </label>
                  <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${formData.paymentMethod === 'card' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value="card" checked={formData.paymentMethod === 'card'} onChange={() => setFormData({...formData, paymentMethod: 'card'})} className="w-4 h-4 text-stone-900 focus:ring-stone-900" />
                    <span className="font-medium text-stone-900">{language === 'ar' ? 'البطاقة الائتمانية (قريباً)' : 'Credit Card (Coming Soon)'}</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || formData.paymentMethod === 'card'}
                className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    {language === 'ar' ? 'تأكيد الطلب' : 'Place Order'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 sticky top-24">
              <h2 className="text-xl font-medium text-stone-900 mb-6">{language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-stone-50" />
                    <div className="flex-1">
                      <h4 className="font-medium text-stone-900 text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-stone-500 text-sm">{language === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}</p>
                      <p className="font-medium text-stone-900 mt-1">${item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-6 space-y-4">
                <div className="flex justify-between text-stone-600">
                  <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{language === 'ar' ? 'رسوم الشحن' : 'Shipping'}</span>
                  <span>$15</span>
                </div>
                <div className="flex justify-between text-lg font-medium text-stone-900 pt-4 border-t border-stone-100">
                  <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span>${total + 15}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
