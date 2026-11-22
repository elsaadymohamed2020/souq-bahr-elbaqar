import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BadgeCheck, ChevronLeft, ChevronRight, ShieldCheck, Tag, Truck, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { scrollToId } from '../../lib/hooks';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Button, Countdown } from '../ui';
import { cn } from '../../lib/cn';

const AUTOPLAY_MS = 6500;

export default function HeroBanner() {
  const { offers, products, deals, applyCategoryPreset, getGeneralWhatsAppLink, formatPrice } = useApp();
  const reduce = useReducedMotion();

  const today = new Date().toISOString().slice(0, 10);
  const liveOffer = offers.filter((o) => o.active && o.ends >= today).sort((a, b) => b.pct - a.pct)[0];
  const availCount = products.filter((p) => p.status === 'avail').length;
  const bestDeal = deals
    .filter((d) => d.status !== 'sold' && d.estimatedRetail)
    .map((d) => ({ ...d, pct: Math.round(((d.estimatedRetail - d.totalPrice) / d.estimatedRetail) * 100) }))
    .sort((a, b) => b.pct - a.pct)[0];

  const slides = useMemo(() => {
    const list = [];
    if (liveOffer) {
      list.push({
        id: 'offer',
        eyebrow: 'عرض لفترة محدودة',
        title: liveOffer.title,
        text: liveOffer.desc || 'السعر القديم بيتشطب لوحده على الموقع، والجديد قدامك.',
        img: '/images/products/welder.jpg',
        tint: 'from-ink via-ink/85 to-ink/10',
        countdown: liveOffer.ends,
        cta: {
          label: 'تسوق العرض',
          onClick: () => {
            applyCategoryPreset('deals');
            scrollToId('items');
          },
        },
      });
    }
    list.push({
      id: 'catalog',
      eyebrow: 'الموقع الرسمي لسوق بحر البقر الكبير',
      title: 'كل المعروض بسعره، قدامك على الموبايل',
      text: `${availCount} قطعة متاحة دلوقتي في الفرعين. شوف السعر والحالة، واحجز على الواتساب في ثانية.`,
      img: '/images/products/fridge.jpg',
      tint: 'from-ink via-ink/80 to-ink/5',
      cta: { label: 'تصفح المعروض', onClick: () => scrollToId('items') },
      secondary: { label: 'احجز واتساب', href: getGeneralWhatsAppLink() },
    });
    if (bestDeal) {
      list.push({
        id: 'lots',
        eyebrow: 'لأصحاب المحلات والورش',
        title: 'لوطات وشروات Total بسعر الجملة',
        text: `وفّر لحد ${bestDeal.pct}% عن سعر القطاعي. ${bestDeal.title} بـ ${formatPrice(bestDeal.totalPrice)} ج.`,
        img: bestDeal.img || '/images/deals/factory-lot.jpg',
        tint: 'from-ink via-ink/85 to-ink/10',
        cta: { label: 'شوف الصفقات', onClick: () => scrollToId('deals') },
      });
    }
    return list;
  }, [liveOffer, availCount, bestDeal, applyCategoryPreset, getGeneralWhatsAppLink, formatPrice]);

  const [[index, direction], setIndex] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const safeIndex = ((index % count) + count) % count;
  const slide = slides[safeIndex];

  const go = useCallback((delta) => setIndex(([i]) => [i + delta, delta]), []);

  useEffect(() => {
    if (reduce || paused || count < 2) return undefined;
    const onVis = () => document.hidden && setPaused(true);
    document.addEventListener('visibilitychange', onVis);
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduce, paused, count, go]);

  const variants = {
    enter: (dir) => ({ opacity: 0, x: reduce ? 0 : dir > 0 ? -40 : 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: reduce ? 0 : dir > 0 ? 40 : -40 }),
  };

  return (
    <section id="top" aria-label="العروض الرئيسية" className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        {/* Slider */}
        <div
          data-tour="hero-banner"
          className="relative overflow-hidden rounded-3xl bg-ink lg:col-span-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onTouchStart={() => setPaused(true)}
          aria-roledescription="carousel"
        >
          <div className="relative h-[300px] sm:h-[340px] lg:h-[min(400px,60vh)]">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={slide.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                drag={reduce ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  // RTL: swiping toward the left moves forward
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                role="group"
                aria-roledescription="slide"
                aria-label={`${safeIndex + 1} من ${count}`}
              >
                <img
                  src={slide.img}
                  alt=""
                  width="1200"
                  height="800"
                  draggable="false"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className={cn('absolute inset-0 bg-gradient-to-l', slide.tint)} aria-hidden="true" />
                <div className="relative flex h-full max-w-xl flex-col justify-end gap-3 p-5 pb-12 sm:justify-center sm:p-9 sm:pb-9">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 font-heading text-[11px] font-black text-ink sm:text-xs">
                    {slide.eyebrow}
                  </span>
                  {slide.id === 'catalog' ? (
                    <h1 className="font-heading text-[26px] font-black leading-[1.15] text-white sm:text-4xl lg:text-[44px]">{slide.title}</h1>
                  ) : (
                    <h2 className="font-heading text-[26px] font-black leading-[1.15] text-white sm:text-4xl lg:text-[44px]">{slide.title}</h2>
                  )}
                  <p className="max-w-md text-sm leading-relaxed text-slate-200 sm:text-base">{slide.text}</p>
                  {slide.countdown ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300">العرض يخلص بعد</span>
                      <Countdown ends={slide.countdown} tone="glass" />
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button size="lg" onClick={slide.cta.onClick}>
                      {slide.cta.label}
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    {slide.secondary ? (
                      <Button size="lg" variant="whatsapp" href={slide.secondary.href} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
                        {slide.secondary.label}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {count > 1 ? (
            <>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-5">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`اعرض الشريحة ${i + 1}`}
                    aria-current={i === safeIndex}
                    onClick={() => setIndex([i, i > safeIndex ? 1 : -1])}
                    className={cn('h-2 rounded-full transition-all duration-300', i === safeIndex ? 'w-7 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80')}
                  />
                ))}
              </div>
              <div className="absolute bottom-3 left-4 hidden gap-2 sm:flex">
                <button type="button" onClick={() => go(-1)} aria-label="الشريحة اللي فاتت" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-ink/40 text-white backdrop-blur transition-colors hover:bg-ink/70">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="الشريحة اللي بعدها" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-ink/40 text-white backdrop-blur transition-colors hover:bg-ink/70">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Side tiles */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1 lg:gap-4">
          <SideTile
            tour="hero-tile-trust"
            icon={ShieldCheck}
            tone="ink"
            title="اتأكد من الرقم اللي كلمك"
            text="فيه ناس بتنصب باسمنا. اكتب الرقم ونقولك رسمي ولا لأ."
            cta="اتأكد دلوقتي"
            onClick={() => {
              scrollToId('trust');
              setTimeout(() => document.getElementById('verify-number-input')?.focus({ preventScroll: true }), 600);
            }}
          />
          <SideTile
            tour="hero-tile-shipping"
            icon={Truck}
            tone="amber"
            title="الشحن لحد بيتك"
            text="العاشر، القاهرة، البحيرة؟ احسب التكلفة التقريبية في ثانية."
            cta="احسب الشحن"
            onClick={() => scrollToId('shipping')}
          />
        </div>
      </div>
    </section>
  );
}

function SideTile({ icon: Icon, title, text, cta, onClick, tone, tour }) {
  return (
    <button
      type="button"
      data-tour={tour}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-start justify-between gap-3 overflow-hidden rounded-3xl p-4 text-right transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99] sm:p-5',
        tone === 'ink' ? 'bg-ink text-white' : 'border border-amber-200 bg-amber-50 text-ink dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-fg'
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-2xl',
          tone === 'ink' ? 'bg-amber-500 text-ink' : 'bg-ink text-amber-400 dark:bg-amber-500 dark:text-ink'
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="space-y-1">
        <span className="block font-heading text-[15px] font-black leading-snug sm:text-lg">{title}</span>
        <span className={cn('line-clamp-2 block text-xs leading-relaxed sm:text-sm', tone === 'ink' ? 'text-slate-300' : 'text-fg-muted')}>{text}</span>
      </span>
      <span className={cn('inline-flex items-center gap-1 font-heading text-xs font-black sm:text-sm', tone === 'ink' ? 'text-amber-400' : 'text-amber-800 dark:text-amber-300')}>
        {cta}
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
      </span>
    </button>
  );
}

export function ValueStrip() {
  const { isOpenNow } = useApp();
  const items = [
    { icon: Tag, title: 'السعر مكتوب', text: 'على كل قطعة، من غير "كلمني خاص"' },
    { icon: BadgeCheck, title: 'متاح ولا اتباع', text: 'الحالة بتتحدث لحظة بلحظة' },
    { icon: WhatsAppIcon, title: 'حجز في ثانية', text: 'زرار واتساب بكود القطعة' },
    { icon: ShieldCheck, title: 'أرقامنا الرسمية بس', text: 'مفيش مكان للنصابين' },
  ];
  return (
    <section aria-label="ليه تشتري من الموقع" className="mx-auto mt-3 max-w-7xl px-3 sm:mt-4 sm:px-6">
      <div className="no-scrollbar -mx-3 flex snap-x gap-2 overflow-x-auto px-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-x-reverse lg:divide-line lg:rounded-2xl lg:border lg:border-line lg:bg-surface">
        <div className="flex shrink-0 snap-start items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 py-3 sm:shrink lg:rounded-none lg:border-0 lg:bg-transparent">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            {isOpenNow ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /> : null}
            <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', isOpenNow ? 'bg-emerald-500' : 'bg-red-500')} />
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-sm font-black text-fg">{isOpenNow ? 'مفتوحين دلوقتي' : 'مقفولين دلوقتي'}</span>
            <span className="block text-[11px] text-fg-muted">يومياً من 9 الصبح لـ 5 المغرب</span>
          </span>
        </div>
        {items.map((it) => (
          <div key={it.title} className="flex shrink-0 snap-start items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 py-3 sm:shrink lg:rounded-none lg:border-0 lg:bg-transparent">
            <it.icon className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="leading-tight">
              <span className="block font-heading text-sm font-black text-fg">{it.title}</span>
              <span className="block whitespace-nowrap text-[11px] text-fg-muted">{it.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

