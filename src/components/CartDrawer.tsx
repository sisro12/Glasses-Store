import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';
import { toast } from 'sonner';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (!auth.currentUser) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لإتمام الطلب' : 'Please sign in to checkout');
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className={`fixed top-0 ${language === 'ar' ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-serif text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
              <ShoppingBag className="w-12 h-12 text-stone-300" />
              <p>{language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</p>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/try-on');
                }}
                className="text-stone-900 font-medium hover:underline"
              >
                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-stone-900 line-clamp-1">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-stone-500">{item.type}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-stone-900 hover:bg-white rounded-md transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-stone-900 hover:bg-white rounded-md transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-medium text-stone-900">${item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-600">{language === 'ar' ? 'المجموع' : 'Subtotal'}</span>
              <span className="text-xl font-serif text-stone-900">${total}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
