import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, Info, MapPin, PackageCheck, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Button } from '../ui';
import { cn } from '../../lib/cn';

/** Rough size class for a product, used to pick a shipping price band. */
export function sizeForProduct(p) {
  if (!p) return 'large';
  const name = p.name || '';
  if (/لحام|شاشة/.test(name)) return 'small';
  if (p.cat === 'ind') return /موتور/.test(name) && p.price < 12000 ? 'small' : 'heavy';
  return 'large';
}

/** Answers "متاح شحن للعاشر؟" and "شحن البحيرة؟" before anyone has to ask. */
export default function ShippingEstimator() {
  const { shippingZones, itemSizes, formatPrice, getGeneralWhatsAppLink } = useApp();
  const reduce = useReducedMotion();
  const [zone, setZone] = useState('10th');
  const [size, setSize] = useState('large');
  const z = shippingZones.find((x) => x.id === zone) || shippingZones[0];
  const [lo, hi] = z.prices[size];
  const sizeName = itemSizes.find((s) => s.id === size)?.name;
  const waText = `السلام عليكم يا حاج، عايز أسأل على الشحن لـ ${z.name} (${sizeName}). الموقع قال تقريباً من ${formatPrice(lo)} لـ ${formatPrice(hi)} جنيه. ينفع؟`;

  return (
    <section id="shipping" aria-labelledby="ship-title" className="mx-auto mt-12 max-w-7xl px-3 sm:mt-16 sm:px-6" data-tour="shipping">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-3 lg:col-span-4 lg:pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
            <Truck className="h-3.5 w-3.5" aria-hidden="true" />
            بنوصل لكل المحافظات
          </span>
          <h2 id="ship-title" className="font-heading text-2xl font-black leading-tight text-fg sm:text-3xl">
            ساكن بعيد؟ احسب الشحن لحد بابك
          </h2>
          <p className="max-w-[44ch] text-sm leading-relaxed text-fg-muted">
            ناس كتير من القاهرة والبحيرة والعاشر كانوا بيصرفوا نظر عشان مش عارفين النقل هيكلف كام. دلوقتي السعر التقريبي قدامك قبل ما تسأل.
          </p>
          <ul className="space-y-2 pt-1 text-sm text-fg">
            {['عربية مقفولة ومربوطة للأجهزة', 'التحميل من الفرع علينا', 'تدفع الشحن لما القطعة توصل'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-4 shadow-soft-sm sm:p-6 lg:col-span-8">
          <div className="grid gap-5 md:grid-cols-2">
            <fieldset>
              <legend className="mb-2 flex items-center gap-1.5 font-heading text-sm font-black text-fg">
                <MapPin className="h-4 w-4 text-amber-600" aria-hidden="true" />
                هتستلم فين؟
              </legend>
              <div className="no-scrollbar grid max-h-[264px] grid-cols-1 gap-1.5 overflow-y-auto pl-1">
                {shippingZones.map((s) => (
                  <label
                    key={s.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-500',
                      zone === s.id ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink' : 'border-line text-fg hover:border-line-strong'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input type="radio" name="ship-zone" value={s.id} checked={zone === s.id} onChange={() => setZone(s.id)} className="sr-only" />
                      <span className="font-semibold">{s.name}</span>
                    </span>
                    <span className={cn('shrink-0 text-[11px] font-bold', zone === s.id ? 'text-amber-300 dark:text-amber-700' : 'text-fg-subtle')}>{s.days}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-4">
              <fieldset>
                <legend className="mb-2 font-heading text-sm font-black text-fg">حجم القطعة</legend>
                <div className="grid gap-1.5">
                  {itemSizes.map((s) => (
                    <label
                      key={s.id}
                      className={cn(
                        'flex cursor-pointer flex-col rounded-xl border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-500',
                        size === s.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-line hover:border-line-strong'
                      )}
                    >
                      <input type="radio" name="ship-size" value={s.id} checked={size === s.id} onChange={() => setSize(s.id)} className="sr-only" />
                      <span className="text-sm font-bold text-fg">{s.name}</span>
                      <span className="text-[11px] text-fg-muted">{s.desc}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-auto rounded-2xl bg-ink p-4 text-white" aria-live="polite">
                <span className="text-xs font-bold text-slate-300">التكلفة التقريبية</span>
                  <motion.p
                    key={`${zone}-${size}`}
                    initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="num mt-1 font-heading text-[28px] font-black leading-none text-amber-400"
                  >
                    {formatPrice(lo)} <span className="text-base text-slate-300">لـ</span> {formatPrice(hi)} <span className="text-base text-slate-300">ج</span>
                  </motion.p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                  بيوصل {z.days}
                </p>
                <Button variant="whatsapp" size="md" block className="mt-3" href={getGeneralWhatsAppLink(waText)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                  اتأكد من الشحن على واتساب
                </Button>
              </div>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-fg-subtle">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            أسعار تقريبية للعرض. السعر النهائي بيتحدد مع الفرع حسب العنوان بالظبط ووزن القطعة.
          </p>
        </div>
      </div>
    </section>
  );
}
