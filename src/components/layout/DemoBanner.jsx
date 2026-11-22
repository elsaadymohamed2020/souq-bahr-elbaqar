import React from 'react';
import { LayoutDashboard, PlayCircle, RotateCcw, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTour } from '../../context/TourContext';

/** Slim amber demo bar. Always visible (the owner must know this is a proposal, not a live site). */
export default function DemoBanner() {
  const { viewMode, setViewMode, resetDemo } = useApp();
  const { start, active } = useTour();

  const switchView = () => {
    setViewMode(viewMode === 'store' ? 'admin' : 'store');
    window.scrollTo({ top: 0 });
  };

  return (
    <aside
      aria-label="شريط النموذج التجريبي"
      className="sticky top-0 z-50 h-10 border-b border-amber-600/25 bg-gradient-to-l from-amber-400 via-amber-400 to-amber-500 text-ink"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-xs font-bold sm:text-[13px]">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
          </span>
          <span className="truncate">
            <span className="sm:hidden">نموذج تجريبي</span>
            <span className="hidden sm:inline">نموذج تجريبي مقترح لسوق بحر البقر</span>
          </span>
          <span className="hidden truncate text-[11px] font-semibold text-ink/70 lg:inline">
            الأسعار والبيانات للتوضيح، وبتتحدث حي مع لوحة التحكم
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            data-tour="tour-launch"
            onClick={() => start()}
            disabled={active}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-ink px-2.5 font-heading text-[11px] font-black text-white shadow-sm transition-[transform,background-color] hover:bg-ink-700 active:scale-[0.97] disabled:opacity-60 sm:text-xs"
          >
            <PlayCircle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            ابدأ الجولة
          </button>
          <button
            type="button"
            onClick={switchView}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-ink/15 bg-white/70 px-2.5 font-heading text-[11px] font-black text-ink transition-[transform,background-color] hover:bg-white active:scale-[0.97] sm:text-xs"
          >
            {viewMode === 'store' ? (
              <>
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">جرّب لوحة التحكم</span>
                <span className="sm:hidden">اللوحة</span>
              </>
            ) : (
              <>
                <Store className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">واجهة الزبون</span>
                <span className="sm:hidden">الموقع</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => resetDemo()}
            aria-label="رجّع الديمو لأوله"
            title="رجّع الديمو لأوله"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink/80 transition-colors hover:bg-white/60 hover:text-ink active:scale-[0.97]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
