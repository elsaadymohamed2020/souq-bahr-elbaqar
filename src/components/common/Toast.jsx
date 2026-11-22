import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTour } from '../../context/TourContext';
import { cn } from '../../lib/cn';

const TYPES = {
  success: { icon: CheckCircle2, tone: 'bg-emerald-500/15 text-emerald-400' },
  error: { icon: AlertCircle, tone: 'bg-red-500/15 text-red-400' },
  info: { icon: Info, tone: 'bg-sky-500/15 text-sky-300' },
};

export default function Toast() {
  const { toasts, dismissToast, isCartOpen, isCheckoutOpen, quickViewCode, isAddProductOpen, waitingCustomerAlert, selectedDealForDetail } = useApp();
  const { active: tourActive, dock } = useTour();
  const reduce = useReducedMotion();
  // On phones, sheets and the docked tour card own the bottom of the screen: show toasts at the top then.
  const overlayOpen = isCartOpen || isCheckoutOpen || Boolean(quickViewCode) || isAddProductOpen || Boolean(waitingCustomerAlert) || Boolean(selectedDealForDetail);
  const atTop = (tourActive && dock === 'bottom') || (!tourActive && overlayOpen);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'pointer-events-none fixed inset-x-0 z-[100] flex flex-col items-center gap-2 px-3',
        atTop ? 'top-12 sm:top-auto sm:bottom-6' : 'bottom-[88px] sm:bottom-6'
      )}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const meta = TYPES[t.type] || TYPES.success;
          const Icon = meta.icon;
          return (
            <motion.div
              key={t.id}
              layout={!reduce}
              initial={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : 8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role={t.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-ink px-4 py-3 text-white shadow-soft-lg"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">{t.message}</p>
              {t.action ? (
                <button
                  type="button"
                  onClick={() => {
                    t.action.onClick?.();
                    dismissToast(t.id);
                  }}
                  className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 font-heading text-xs font-black text-ink transition-colors hover:bg-amber-400"
                >
                  {t.action.label}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="إخفاء الإشعار"
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
