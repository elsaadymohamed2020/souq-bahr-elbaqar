import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Boxes, ClipboardList, HandCoins, MapPin, Scale, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Button, StatusBadge } from '../ui';
import { cn } from '../../lib/cn';

const DEAL_LABELS = { avail: 'متاحة للمعاينة', held: 'جاري المعاينة', sold: 'اتباعت' };

/** Full-width dark band: wholesale lots sold "Total". */
export default function BulkDealsSection() {
  const { deals, formatPrice, setSelectedDealForDetail, getWhatsAppDealLink, bookDealDeposit } = useApp();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState('all');

  const filters = useMemo(() => {
    const cats = [...new Set(deals.map((d) => d.category).filter(Boolean))];
    return [
      { id: 'all', label: 'كل الصفقات', count: deals.length },
      { id: 'avail', label: 'المتاح للمعاينة', count: deals.filter((d) => d.status === 'avail').length },
      ...cats.map((c) => ({ id: c, label: c, count: deals.filter((d) => d.category === c).length })),
    ];
  }, [deals]);

  const list = deals.filter((d) => (filter === 'all' ? true : filter === 'avail' ? d.status === 'avail' : d.category === filter));
  const openValue = deals.filter((d) => d.status !== 'sold').reduce((s, d) => s + Number(d.totalPrice || 0), 0);

  return (
    <section id="deals" aria-labelledby="deals-band-title" className="mt-14 bg-ink text-white sm:mt-20" data-tour="deals">
      <div className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="space-y-3 lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              لأصحاب المحلات والورش والتجار
            </span>
            <h2 id="deals-band-title" className="font-heading text-3xl font-black leading-tight sm:text-4xl">
              لوطات وشروات Total
            </h2>
            <p className="max-w-[58ch] text-sm leading-relaxed text-slate-300 sm:text-base">
              صفقات كاملة من تصفية مصانع وفنادق، بتتباع على بعضها بسعر الجملة. شوف كشف المحتويات، واحجز معاينة على الطبيعة قبل ما تدفع.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs text-slate-400">صفقات متاحة</dt>
              <dd className="num mt-1 font-heading text-2xl font-black">{deals.filter((d) => d.status === 'avail').length}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs text-slate-400">قيمة المعروض</dt>
              <dd className="num mt-1 font-heading text-2xl font-black text-amber-400">
                {formatPrice(Math.round(openValue / 1000))}
                <span className="mr-1 text-sm text-slate-300">ألف ج</span>
              </dd>
            </div>
          </dl>
        </div>

        <div role="group" aria-label="نوع الصفقة" className="no-scrollbar -mx-3 mt-6 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 font-heading text-sm font-bold transition-colors',
                filter === f.id ? 'border-amber-500 bg-amber-500 text-ink' : 'border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/5'
              )}
            >
              {f.label}
              <span className={cn('num rounded-full px-1.5 py-0.5 text-[10px]', filter === f.id ? 'bg-ink/15' : 'bg-white/10')}>{f.count}</span>
            </button>
          ))}
        </div>

        <motion.ul layout={!reduce} className="mt-6 grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((deal) => {
              const savePct = deal.estimatedRetail ? Math.round(((deal.estimatedRetail - deal.totalPrice) / deal.estimatedRetail) * 100) : 0;
              const isSold = deal.status === 'sold';
              return (
                <motion.li
                  key={deal.code}
                  layout={!reduce}
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                >
                  <button type="button" onClick={() => setSelectedDealForDetail(deal)} className="group relative h-48 overflow-hidden text-right sm:h-56" aria-label={`كشف محتويات ${deal.title}`}>
                    <img src={deal.img} alt="" width="800" height="500" loading="lazy" className={cn('h-full w-full object-cover transition-transform duration-700 group-hover:scale-105', isSold && 'grayscale')} />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" aria-hidden="true" />
                    <span className="absolute right-3 top-3 flex flex-wrap gap-1.5">
                      <StatusBadge status={deal.status} size="xs" labels={DEAL_LABELS} />
                      {deal.badge ? <span className="rounded-full bg-amber-500 px-2 py-1 font-heading text-[10px] font-black text-ink">{deal.badge}</span> : null}
                    </span>
                    <span className="num absolute bottom-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-black text-ink" dir="ltr">
                      {deal.code}
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
                    <h3 className="line-clamp-2 font-heading text-base font-black leading-snug sm:text-lg">{deal.title}</h3>

                    <ul className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <li className="flex flex-col gap-1 rounded-xl bg-white/5 p-2.5">
                        <Scale className="h-4 w-4 text-amber-400" aria-hidden="true" />
                        <span className="line-clamp-2">{deal.weight}</span>
                      </li>
                      <li className="flex flex-col gap-1 rounded-xl bg-white/5 p-2.5">
                        <Boxes className="h-4 w-4 text-amber-400" aria-hidden="true" />
                        <span className="line-clamp-2">{deal.itemsCount}</span>
                      </li>
                      <li className="flex flex-col gap-1 rounded-xl bg-white/5 p-2.5">
                        <MapPin className="h-4 w-4 text-amber-400" aria-hidden="true" />
                        <span className="line-clamp-2">فرع {deal.branch}</span>
                      </li>
                    </ul>

                    {deal.items?.length ? (
                      <ul className="space-y-1.5 text-xs">
                        {deal.items.slice(0, 3).map((it) => (
                          <li key={it.name} className="flex items-start justify-between gap-3 border-b border-white/5 pb-1.5 last:border-0">
                            <span className="line-clamp-1 text-slate-200">{it.name}</span>
                            <span className="shrink-0 font-bold text-amber-300">{it.qty}</span>
                          </li>
                        ))}
                        {deal.items.length > 3 ? <li className="text-[11px] text-slate-400">+ {deal.items.length - 3} بنود تانية في الكشف</li> : null}
                      </ul>
                    ) : null}

                    {/* Savings meter */}
                    <div className="mt-auto rounded-2xl bg-white/5 p-3.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="num font-heading text-2xl font-black text-white">
                          {formatPrice(deal.totalPrice)} <span className="text-sm font-bold text-slate-300">ج Total</span>
                        </span>
                        {savePct > 0 ? <span className="num rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-black text-emerald-300">وفّر {savePct}%</span> : null}
                      </div>
                      {deal.estimatedRetail ? (
                        <>
                          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-l from-amber-400 to-amber-500"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${100 - savePct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                          <p className="num mt-1.5 text-[11px] text-slate-400">سعرها قطاعي حوالي {formatPrice(deal.estimatedRetail)} ج</p>
                        </>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outlineLight" size="md" className="flex-1" onClick={() => setSelectedDealForDetail(deal)}>
                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                        كشف المحتويات
                      </Button>
                      <Button
                        variant="whatsapp"
                        size="md"
                        className={cn('flex-1', isSold && 'pointer-events-none opacity-40')}
                        href={isSold ? undefined : getWhatsAppDealLink(deal, 'inspect')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                        احجز معاينة
                      </Button>
                      {deal.status === 'avail' ? (
                        <button
                          type="button"
                          onClick={() => bookDealDeposit(deal)}
                          className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-bold text-amber-300 transition-colors hover:bg-white/5"
                        >
                          <HandCoins className="h-4 w-4" aria-hidden="true" />
                          ثبّت الصفقة بعربون {formatPrice(deal.deposit)} ج
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
