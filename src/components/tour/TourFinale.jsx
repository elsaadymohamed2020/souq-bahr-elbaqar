import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, MousePointerClick, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTour } from '../../context/TourContext';
import { PITCH, isDevContactSet, devWhatsAppLink } from '../../config/pitch';
import { useOverlay } from '../../lib/useOverlay';
import { WhatsAppIcon } from '../common/BrandIcons';

const WINS = [
  { icon: Clock3, title: 'وقتك', text: 'بكام وفين ولسه موجود بيترد عليهم لوحده. إنت تركز في البيع.' },
  { icon: ShieldCheck, title: 'اسمك', text: 'موقع رسمي بأرقامك بس، والزبون يكشف النصاب في ثانية.' },
  { icon: Truck, title: 'الزبون البعيد', text: 'القاهرة والبحيرة والعاشر يعرفوا السعر والشحن ويحجزوا من بيتهم.' },
];

export default function TourFinale() {
  const { triggerConfetti, setViewMode } = useApp();
  const { stop, start } = useTour();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  useOverlay(true, stop, ref, { initialFocus: false });

  useEffect(() => {
    const t = setTimeout(triggerConfetti, 250);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tryIt = () => {
    stop();
    setViewMode('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="finale-title" className="fixed inset-0 z-[96] flex items-end justify-center overflow-y-auto bg-ink/80 p-3 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl rounded-3xl border border-line bg-surface p-5 text-fg shadow-soft-lg sm:p-8"
      >
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">ده اللي هيبقى عندك</span>
        <h2 id="finale-title" className="mt-3 font-heading text-2xl font-black leading-tight sm:text-3xl">
          يا {PITCH.ownerCall}، الموقع ده بيشتغل بدالك 24 ساعة
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {WINS.map((w, i) => (
            <motion.li
              key={w.title}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
              className="rounded-2xl bg-surface-2 p-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-amber-400 dark:bg-amber-500 dark:text-ink">
                <w.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-heading text-base font-black">{w.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{w.text}</p>
            </motion.li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          {isDevContactSet() ? (
            <a
              href={devWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 font-heading text-sm font-black text-white transition-colors hover:bg-emerald-500"
            >
              <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
              كلم {PITCH.devName} ونبدأ
            </a>
          ) : null}
          <button
            type="button"
            onClick={tryIt}
            autoFocus
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 font-heading text-sm font-black text-ink transition-[background-color,transform] hover:bg-amber-400 active:scale-[0.97]"
          >
            <MousePointerClick className="h-5 w-5" aria-hidden="true" />
            جرّب الموقع بنفسك
          </button>
          <button
            type="button"
            onClick={start}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-line px-4 font-heading text-sm font-bold text-fg transition-colors hover:bg-surface-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            عيد الجولة
          </button>
        </div>
      </motion.div>
    </div>
  );
}
