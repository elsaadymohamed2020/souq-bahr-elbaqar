import React from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, Clock, LayoutDashboard, Store, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { viewMode, setViewMode, isOpenNow, cartCount, setIsCartOpen } = useApp();

  return (
    <header className="sticky top-[41px] z-30 glass-header border-b border-slate-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        
        {/* Logo & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ink via-ink-800 to-ink-950 flex items-center justify-center text-white font-heading font-black text-2xl shadow-glow-amber border border-amber-400/30 relative select-none">
            <span className="text-amber-400">ب</span>
            <div className="absolute -bottom-1 w-6 h-1 rounded-full bg-amber-400 shadow-sm" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-lg sm:text-xl text-ink tracking-tight leading-none">
                سوق بحر البقر الكبير
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-brand-blue border border-blue-200/60">
                <ShieldCheck className="w-3 h-3" />
                رسمي
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              أجهزة منزلية ومعدات أوروبية مستوردة · فرعا الحسينية والصالحية
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Store Hours Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-rose-500'}`} />
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isOpenNow ? 'مفتوح الآن (حتى 5 مساءً)' : 'مغلق الآن · يفتح 9 صباحاً'}</span>
          </div>

          {/* Quick Contact Direct */}
          <a
            href="tel:01034052401"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/80 text-ink border border-slate-200 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>010 3405 2401</span>
          </a>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm bg-amber-500/10 hover:bg-amber-500/20 text-ink border border-amber-400/40 transition-all active:scale-95"
            title="سلة المشتريات"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-500 text-ink text-[10px] font-black flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">السلة</span>
          </button>

          {/* Mode switch button */}
          <button
            onClick={() => setViewMode(viewMode === 'store' ? 'admin' : 'store')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 ${
              viewMode === 'store'
                ? 'bg-ink text-white hover:bg-slate-800'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {viewMode === 'store' ? (
              <>
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">لوحة التحكم</span>
                <span className="sm:hidden">الإدارة</span>
              </>
            ) : (
              <>
                <Store className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">عرض الموقع</span>
                <span className="sm:hidden">الموقع</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
