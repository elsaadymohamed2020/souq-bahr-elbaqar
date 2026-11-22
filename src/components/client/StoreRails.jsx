import React from 'react';
import { ArrowLeft, Flame, History, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { scrollToId } from '../../lib/hooks';
import { Countdown, Rail, SectionHeader } from '../ui';
import ProductCard from './ProductCard';
import { cn } from '../../lib/cn';

export const byNewest = (a, b) =>
  (b.addedAt || 0) - (a.addedAt || 0) ||
  Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) ||
  (Number(String(b.code).split('-')[1]) || 0) - (Number(String(a.code).split('-')[1]) || 0);

/** "عرض النهارده": countdown panel + rail of discounted pieces. */
export function DealsBlock() {
  const { products, getOfferForProduct, offers, applyCategoryPreset } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const offer = offers.filter((o) => o.active && o.ends >= today).sort((a, b) => b.pct - a.pct)[0];
  const items = products.filter((p) => p.status !== 'sold' && getOfferForProduct(p)).sort(byNewest);
  if (!offer || !items.length) return null;

  const seeAll = () => {
    applyCategoryPreset('deals');
    scrollToId('items');
  };

  return (
    <section id="offers" aria-labelledby="deals-title" className="mx-auto mt-8 max-w-7xl px-3 sm:mt-10 sm:px-6" data-tour="deal-rail">
      <div className="grid gap-4 rounded-3xl bg-gradient-to-l from-amber-400 to-amber-500 p-3 sm:p-4 lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-3 rounded-2xl p-2 text-ink lg:col-span-3 lg:p-3">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-heading text-xs font-black text-amber-400">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" />
              عرض النهارده
            </span>
            <h2 id="deals-title" className="font-heading text-2xl font-black leading-tight sm:text-[28px]">
              {offer.title}
            </h2>
            <p className="text-sm font-semibold text-ink/75">السعر القديم بيتشطب لوحده. القطعة واحدة بس، واللي يسبق ياخد.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-col lg:items-start">
            <div>
              <span className="mb-1 block text-xs font-bold text-ink/70">العرض يخلص بعد</span>
              <Countdown ends={offer.ends} tone="dark" />
            </div>
            <button
              type="button"
              onClick={seeAll}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white/80 px-3.5 font-heading text-sm font-black text-ink transition-colors hover:bg-white"
            >
              شوف كل العروض
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">
          <Rail ariaLabel="منتجات عليها خصم" itemClassName="w-[64%] sm:w-[38%] md:w-[31%] lg:w-[31.5%]">
            {items.map((p) => (
              <ProductCard key={p.code} product={p} variant="rail" />
            ))}
          </Rail>
        </div>
      </div>
    </section>
  );
}

/** Image bento of the four departments. No dead cells at any breakpoint. */
export function CategoryBento() {
  const { products, deals, applyCategoryPreset, updateCatalogFilters } = useApp();
  const count = (cat) => products.filter((p) => p.cat === cat && p.status !== 'sold').length;
  const tiles = [
    { id: 'home', preset: null, cat: 'home', title: 'أجهزة منزلية', sub: 'تلاجات، غسالات، بوتاجازات، شاشات', img: '/images/products/fridge.jpg', n: count('home'), className: 'col-span-2 h-44 sm:h-56 lg:row-span-2 lg:h-auto' },
    { id: 'ind', preset: 'ind', title: 'معدات صناعية أوروبي', sub: 'مكن لحام، كمبروسرات، مواتير', img: '/images/products/compressor.jpg', n: count('ind'), className: 'col-span-2 h-40 sm:h-44' },
    { id: 'wood', preset: 'wood', title: 'موبيليا وأبواب', sub: 'خشب زان قديم', img: '/images/products/door.jpg', n: count('wood'), className: 'h-40 sm:h-44' },
    { id: 'lots', section: 'deals', title: 'لوطات وشروات', sub: 'بسعر الجملة', img: '/images/deals/kitchen-lot.jpg', n: deals.filter((d) => d.status !== 'sold').length, className: 'h-40 sm:h-44' },
  ];

  const pick = (t) => {
    if (t.section) {
      scrollToId(t.section);
      return;
    }
    if (t.preset) applyCategoryPreset(t.preset);
    else {
      // "home" has no single preset: show every home appliance
      applyCategoryPreset('all');
      updateCatalogFilters({ cat: t.cat, preset: `cat-${t.cat}` });
    }
    scrollToId('items');
  };

  return (
    <section aria-labelledby="cats-title" className="mx-auto mt-10 max-w-7xl px-3 sm:mt-12 sm:px-6">
      <SectionHeader title="تسوق بالقسم" subtitle="كل قسم وعدد القطع المتاحة فيه دلوقتي" className="mb-4" />
      <h2 id="cats-title" className="sr-only">تسوق بالقسم</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t)}
            className={cn('group relative overflow-hidden rounded-3xl bg-ink text-right', t.className)}
          >
            <img src={t.img} alt="" width="800" height="600" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" aria-hidden="true" />
            <span className="relative flex h-full flex-col justify-end p-4 sm:p-5">
              <span className="num mb-1.5 w-fit rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-ink">{t.n} متاح</span>
              <span className="font-heading text-lg font-black text-white sm:text-xl">{t.title}</span>
              <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-200">
                {t.sub}
                <ArrowLeft className="h-4 w-4 text-amber-400 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function NewArrivals() {
  const { products, applyCategoryPreset, updateCatalogFilters } = useApp();
  const items = [...products].filter((p) => p.status !== 'sold').sort(byNewest).slice(0, 10);
  return (
    <section aria-labelledby="new-title" className="mx-auto mt-10 max-w-7xl px-3 sm:mt-12 sm:px-6" data-tour="new-arrivals">
      <SectionHeader
        eyebrow={
          <>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> بيتحدث أول ما القطعة تنزل
          </>
        }
        title={<span id="new-title">وصل جديد</span>}
        onAction={() => {
          applyCategoryPreset('all');
          updateCatalogFilters({ sort: 'newest' });
          scrollToId('items');
        }}
        className="mb-4"
      />
      <Rail ariaLabel="وصل جديد">
        {items.map((p, i) => (
          <ProductCard key={p.code} product={p} variant="rail" eager={i < 2} />
        ))}
      </Rail>
    </section>
  );
}

export function RecentlyViewed({ exclude, title = 'شفتها قريب' }) {
  const { products, recentlyViewed } = useApp();
  const items = recentlyViewed
    .filter((c) => c !== exclude)
    .map((c) => products.find((p) => p.code === c))
    .filter(Boolean);
  if (items.length < 2) return null;
  return (
    <section aria-label={title} className="mx-auto mt-10 max-w-7xl px-3 sm:px-6">
      <SectionHeader
        title={
          <span className="inline-flex items-center gap-2">
            <History className="h-5 w-5 text-fg-subtle" aria-hidden="true" />
            {title}
          </span>
        }
        className="mb-4"
      />
      <Rail ariaLabel={title}>
        {items.map((p) => (
          <ProductCard key={p.code} product={p} variant="rail" />
        ))}
      </Rail>
    </section>
  );
}
