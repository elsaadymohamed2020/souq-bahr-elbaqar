import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartFloatingBtn() {
  const { cartCount, cartTotal, formatPrice, setIsCartOpen, viewMode } = useApp();

  if (cartCount === 0 || viewMode !== 'store') return null;

  return (
    <aside aria-label="سلة المشتريات السريعة" className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom duration-300">
      <button
        onClick={() => setIsCartOpen(true)}
        className="group flex items-center gap-3 px-4 py-3 rounded-full bg-ink hover:bg-slate-800 text-white font-heading font-bold text-sm shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 active:scale-95 border-2 border-amber-400 relative"
      >
        {/* Count Badge */}
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-ink font-heading font-black text-xs flex items-center justify-center shadow-md animate-pulse">
          {cartCount}
        </span>

        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <ShoppingBag className="w-4 h-4" />
        </div>

        <div className="flex flex-col text-right leading-tight">
          <span className="text-[11px] text-amber-400 font-semibold">سلة الطلبات</span>
          <span className="text-xs font-black font-mono">{formatPrice(cartTotal)} ج</span>
        </div>

        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
      </button>
    </aside>
  );
}
