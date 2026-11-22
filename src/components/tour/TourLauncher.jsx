import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PlayCircle, X } from 'lucide-react';
import { useTour } from '../../context/TourContext';
import { PITCH } from '../../config/pitch';

/** Gentle first-visit invitation to the guided tour. Never forces it. */
export default function TourLauncher() {
  const { active, start, hasSeen, markSeen } = useTour();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasSeen() || new URLSearchParams(window.location.search).get('tour') === '1') return undefined;
    const t = setTimeout(() => setOpen(true), 1600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (active) setOpen(false);
  }, [active]);

  const dismiss = () => {
    setOpen(false);
    markSeen();
  };

  return (
    <AnimatePresence>
      {open && !active ? (
        <motion.aside
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-label="دعوة للجولة"
          className="fixed inset-x-3 bottom-[84px] z-[85] mx-auto max-w-sm rounded-3xl border border-line bg-surface p-4 text-fg shadow-soft-lg lg:bottom-24 lg:left-6 lg:right-auto lg:mx-0"
        >
          <button type="button" onClick={dismiss} aria-label="مش دلوقتي" className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle hover:bg-surface-2 hover:text-fg">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 pl-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-400">
              <PlayCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-base font-black">أهلاً يا {PITCH.ownerCall}</h2>
              <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">خد جولة دقيقتين نوريك فيها الموقع ولوحة التحكم شغالين إزاي.</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={start}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 font-heading text-sm font-black text-ink transition-[background-color,transform] hover:bg-amber-400 active:scale-[0.97]"
            >
              ابدأ الجولة
            </button>
            <button type="button" onClick={dismiss} className="h-11 rounded-xl px-4 font-heading text-sm font-bold text-fg-muted hover:bg-surface-2 hover:text-fg">
              بعدين
            </button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
