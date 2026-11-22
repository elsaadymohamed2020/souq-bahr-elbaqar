import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, MapPin, Navigation, Phone, Star } from 'lucide-react';
import { useApp, STORE_HOURS } from '../../context/AppContext';
import { useCairoClock } from '../../lib/hooks';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Button } from '../ui';
import { cn } from '../../lib/cn';

function useOpenState() {
  const { minutesOfDay } = useCairoClock();
  const openAt = STORE_HOURS.open * 60;
  const closeAt = STORE_HOURS.close * 60;
  const isOpen = minutesOfDay >= openAt && minutesOfDay < closeAt;
  const fmt = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h} ساعة و ${m} دقيقة`;
    if (h) return `${h} ساعة`;
    return `${m} دقيقة`;
  };
  if (isOpen) return { isOpen, text: `مفتوح دلوقتي · يقفل بعد ${fmt(closeAt - minutesOfDay)}` };
  const until = minutesOfDay < openAt ? openAt - minutesOfDay : 24 * 60 - minutesOfDay + openAt;
  return { isOpen, text: `مقفول دلوقتي · يفتح بعد ${fmt(until)}` };
}

/** Stylized map so the section reads as "location" at a glance. Not a real map. */
function MapArt({ label }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-full min-h-[220px] overflow-hidden rounded-2xl bg-[#E9EEF5] dark:bg-[#14203A]" aria-hidden="true">
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <path d="M-10 190 C 80 150, 150 230, 240 170 S 360 120, 420 150" fill="none" stroke="#9CC3F5" strokeWidth="18" opacity="0.8" />
        <g stroke="currentColor" className="text-white dark:text-[#22314F]" strokeLinecap="round">
          <path d="M0 70 H400" strokeWidth="10" />
          <path d="M60 0 V260" strokeWidth="8" />
          <path d="M210 0 L250 260" strokeWidth="12" />
          <path d="M0 130 L400 110" strokeWidth="6" />
          <path d="M320 0 V260" strokeWidth="6" />
        </g>
        <g className="text-[#D6DEE9] dark:text-[#1B2A47]" fill="currentColor">
          <rect x="80" y="85" width="110" height="34" rx="6" />
          <rect x="268" y="18" width="40" height="40" rx="6" />
          <rect x="80" y="10" width="110" height="46" rx="6" />
          <rect x="335" y="80" width="60" height="22" rx="6" />
        </g>
      </svg>
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 text-center">
        <motion.span
          key={label}
          initial={reduce ? false : { y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full rounded-bl-none bg-amber-500 text-ink shadow-lift"
          style={{ rotate: -45 }}
        >
          <MapPin className="h-6 w-6 rotate-45" />
        </motion.span>
        <span className="mt-2 inline-block rounded-full bg-ink px-3 py-1 font-heading text-xs font-black text-white shadow-soft">{label}</span>
      </div>
    </div>
  );
}

export default function BranchesSection() {
  const { branches, getGeneralWhatsAppLink } = useApp();
  const [activeId, setActiveId] = useState(branches[0]?.id);
  const branch = branches.find((b) => b.id === activeId) || branches[0];
  const status = useOpenState();

  return (
    <section id="branches" aria-labelledby="branches-title" className="mx-auto mt-14 max-w-7xl px-3 sm:mt-20 sm:px-6" data-tour="branches">
      <div className="mb-5 max-w-2xl">
        <h2 id="branches-title" className="font-heading text-2xl font-black text-fg sm:text-3xl">
          المكان فين؟ دوس "وديني" والخريطة توصلك
        </h2>
        <p className="mt-1.5 text-sm text-fg-muted">فرعين في الشرقية، نفس المواعيد ونفس الأسعار. اختار الأقرب ليك.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div role="tablist" aria-label="الفروع" className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {branches.map((b) => {
            const on = b.id === branch.id;
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActiveId(b.id)}
                className={cn(
                  'flex flex-col gap-2 rounded-3xl border-2 p-4 text-right transition-[border-color,background-color,box-shadow] sm:p-5',
                  on ? 'border-ink bg-surface shadow-soft dark:border-amber-500' : 'border-line bg-surface hover:border-line-strong'
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-heading text-base font-black text-fg sm:text-lg">{b.name}</span>
                  {b.featured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                      <Star className="h-3 w-3" aria-hidden="true" /> الرئيسي
                    </span>
                  ) : null}
                </span>
                <span className="line-clamp-2 text-sm text-fg-muted">{b.address}</span>
                <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold', status.isOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  <span className={cn('h-2 w-2 rounded-full', status.isOpen ? 'bg-emerald-500' : 'bg-red-500')} aria-hidden="true" />
                  {status.text}
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="grid gap-4 rounded-3xl border border-line bg-surface p-3 sm:p-4 md:grid-cols-2 lg:col-span-7">
          <MapArt label={branch.locationName} />
          <div className="flex flex-col gap-4 p-1 sm:p-2">
            <div>
              <h3 className="font-heading text-lg font-black text-fg">{branch.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{branch.address}</p>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-fg">
                <Clock3 className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
                يومياً من 9 الصبح لـ 5 المغرب
              </li>
              <li className="flex items-center gap-2 text-fg">
                <Phone className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
                <span className="num" dir="ltr">
                  {branch.phoneDisplay}
                </span>
              </li>
            </ul>
            <div className="mt-auto grid gap-2">
              <Button href={branch.mapUrl} target="_blank" rel="noopener noreferrer" size="lg" variant="dark" block>
                <Navigation className="h-5 w-5" aria-hidden="true" />
                وديني على الخريطة
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button href={`tel:${branch.phone}`} variant="secondary" size="md">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  اتصل
                </Button>
                <Button
                  href={getGeneralWhatsAppLink(`السلام عليكم، عايز أجي ${branch.name}. ممكن اللوكيشن ومواعيد النهارده؟`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  size="md"
                >
                  <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                  واتساب
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
