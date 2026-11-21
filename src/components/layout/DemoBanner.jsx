import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, LayoutDashboard, RotateCcw, Sparkles } from 'lucide-react';

export default function DemoBanner() {
  const { viewMode, setViewMode, resetDemo } = useApp();

  return (
    <aside aria-label="شريط المعاينة والتبديل" className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-ink shadow-sm border-b border-amber-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        
        {/* Left message */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ink"></span>
          </span>
          <span className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ink shrink-0" />
            نموذج تجريبي مقترح لسوق بحر البقر
          </span>
          <span className="hidden md:inline text-ink/80 text-xs">
            (البيانات والأسعار للتوضيح وتحديثها حي مع لوحة التحكم)
          </span>
        </div>

        {/* Right switchers */}
        <div className="flex items-center gap-2 mr-auto sm:mr-0">
          {viewMode === 'store' ? (
            <button
              onClick={() => setViewMode('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95 text-xs sm:text-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>جرّب لوحة تحكم الإدارة</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('store')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95 text-xs sm:text-sm"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>معاينة واجهة المتجر (الزبون)</span>
            </button>
          )}

          <button
            onClick={resetDemo}
            title="استرجاع البيانات الأصلية للديمو"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/70 hover:bg-white text-ink rounded-xl border border-amber-600/20 font-semibold transition-all active:scale-95 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">إعادة ضبط</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
