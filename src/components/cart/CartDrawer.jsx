import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Truck,
  Building2,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    cartItems,
    cartCount,
    cartTotal,
    formatPrice,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getWhatsAppCartBookingLink,
  } = useApp();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) setIsCartOpen(false);
    };
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 sm:pl-16">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-lg text-ink">عربة التسوق</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-ink">
                    {cartCount} {cartCount === 1 ? 'منتج' : 'منتجات'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">سوق بحر البقر الكبير · شراء وحجز فوري</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                  title="إفراغ العربة بالكامل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ</span>
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="إغلاق العربة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="font-heading font-bold text-lg text-ink">عربة التسوق فارغة حالياً</h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    تصفح أجهزتنا الأوروبية المستوردة والمعدات، واختر القطع اللي تناسبك لإضافتها هنا.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-ink text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  تصفح المعروض الآن
                </button>
              </div>
            ) : (
              <>
                {/* Free pickup alert */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>معاينة وتجربة مجانية بالأجهزة في فروعنا قبل استلامها!</span>
                </div>

                {/* Items list */}
                <div className="space-y-3">
                  {cartItems.map(({ product, quantity, finalPrice, subtotal }) => (
                    <div
                      key={product.code}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex gap-3.5 items-center"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                        {product.img ? (
                          <img
                            src={product.img}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tag className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-bold text-xs sm:text-sm text-ink truncate">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(product.code)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                            title="حذف القطعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {product.code}
                          </span>
                          <span>·</span>
                          <span>فرع {product.branch}</span>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading font-black text-sm text-ink">
                              {formatPrice(subtotal)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">جنيه</span>
                            {quantity > 1 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({formatPrice(finalPrice)} للواحدة)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200/60">
                            <button
                              onClick={() => updateCartQuantity(product.code, -1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-ink flex items-center justify-center text-xs shadow-xs transition-colors"
                              title="تقليل الكمية"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-ink">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(product.code, 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-ink flex items-center justify-center text-xs shadow-xs transition-colors"
                              title="زيادة الكمية"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout actions */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/90 space-y-4">
              
              {/* Financial summary */}
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>المجموع الفرعي ({cartCount} قطع):</span>
                  <span>{formatPrice(cartTotal)} جنيه</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>التوصيل / الاستلام:</span>
                  </span>
                  <span className="text-emerald-700 font-bold">استلام مجاني من الفرع</span>
                </div>
                <div className="pt-2 border-t border-slate-200/70 flex justify-between items-baseline">
                  <span className="font-heading font-black text-sm sm:text-base text-ink">
                    الإجمالي النهائي:
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-black text-xl sm:text-2xl text-ink">
                      {formatPrice(cartTotal)}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">جنيه مصري</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-sm sm:text-base shadow-glow-amber transition-all active:scale-98"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>المتابعة للدفع وإنهاء الطلب</span>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                </button>

                <a
                  href={getWhatsAppCartBookingLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-200" />
                  <span>حجز السلة بالكامل عبر واتساب</span>
                </a>
              </div>

              <p className="text-[11px] text-center text-slate-400 font-medium">
                🔒 دفع آمن ومشفر 100% · إمكانية الدفع عند المعاينة في الفرع
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
