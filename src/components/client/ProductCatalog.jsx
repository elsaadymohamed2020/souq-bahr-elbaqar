import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Grid2x2, Grid3x3, Heart, PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { matchesQuery } from '../../lib/text';
import { Button, EmptyState, Select, Sheet, Skeleton, Switch } from '../ui';
import { WhatsAppIcon } from '../common/BrandIcons';
import ProductCard from './ProductCard';
import { byNewest } from './StoreRails';
import { cn } from '../../lib/cn';

const SORTS = [
  { id: 'featured', label: 'الأنسب ليك' },
  { id: 'newest', label: 'الأحدث' },
  { id: 'price-asc', label: 'السعر: من الأقل' },
  { id: 'price-desc', label: 'السعر: من الأعلى' },
  { id: 'discount', label: 'أكبر خصم' },
];
const BRANCHES = [
  { id: 'all', label: 'الفرعين' },
  { id: 'بحر البقر', label: 'بحر البقر' },
  { id: 'الصالحية', label: 'الصالحية' },
];
const STATUS_RANK = { avail: 0, held: 1, sold: 2 };

function useCatalog() {
  const app = useApp();
  const { products, catalogFilters: f, getOfferForProduct, getFinalPrice, wishlist } = app;

  const base = (p, skip = {}) => {
    if (!skip.cat && f.cat !== 'all' && p.cat !== f.cat) return false;
    if (f.q && !matchesQuery(`${p.name} ${p.code} ${p.branch} ${p.condition || ''}`, f.q)) return false;
    if (f.branch !== 'all' && p.branch !== f.branch) return false;
    if (f.status === 'avail' && p.status !== 'avail') return false;
    if (f.onlyDiscount && !getOfferForProduct(p)) return false;
    if (f.maxPrice && getFinalPrice(p) > f.maxPrice) return false;
    if (f.wishlistOnly && !wishlist.includes(p.code)) return false;
    return true;
  };

  const results = useMemo(() => {
    const list = products.filter((p) => base(p));
    const saving = (p) => p.price - getFinalPrice(p);
    switch (f.sort) {
      case 'newest':
        return list.sort(byNewest);
      case 'price-asc':
        return list.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
      case 'price-desc':
        return list.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
      case 'discount':
        return list.sort((a, b) => saving(b) - saving(a));
      default:
        return list.sort(
          (a, b) =>
            STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
            Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) ||
            Number(Boolean(b.badge)) - Number(Boolean(a.badge))
        );
    }
  }, [products, f, wishlist, getFinalPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const catCounts = useMemo(() => {
    const out = { all: 0 };
    products.forEach((p) => {
      if (!base(p, { cat: true })) return;
      out.all += 1;
      out[p.cat] = (out[p.cat] || 0) + 1;
    });
    return out;
  }, [products, f, wishlist]); // eslint-disable-line react-hooks/exhaustive-deps

  const priceMax = useMemo(() => {
    const prices = products.map((p) => getFinalPrice(p));
    return Math.ceil(Math.max(1000, ...prices) / 1000) * 1000;
  }, [products, getFinalPrice]);

  const activeCount =
    (f.cat !== 'all' ? 1 : 0) +
    (f.q ? 1 : 0) +
    (f.branch !== 'all' ? 1 : 0) +
    (f.status === 'avail' ? 1 : 0) +
    (f.onlyDiscount ? 1 : 0) +
    (f.maxPrice ? 1 : 0) +
    (f.wishlistOnly ? 1 : 0);

  return { ...app, f, results, catCounts, priceMax, activeCount };
}

function FilterGroup({ title, children }) {
  return (
    <fieldset className="space-y-2 border-b border-line pb-5 last:border-0 last:pb-0">
      <legend className="mb-2 font-heading text-sm font-black text-fg">{title}</legend>
      {children}
    </fieldset>
  );
}

function RadioRow({ name, checked, onChange, label, count }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors',
        checked ? 'bg-surface-2 font-bold text-fg' : 'text-fg-muted hover:bg-surface-2/60'
      )}
    >
      <span className="flex items-center gap-2.5">
        <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-amber-500" />
        {label}
      </span>
      {typeof count === 'number' ? <span className="num text-xs text-fg-subtle">{count}</span> : null}
    </label>
  );
}

function ToggleRow({ label, icon: Icon, checked, onChange, ariaLabel }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg">
        {Icon ? <Icon className="h-4 w-4 text-red-500" aria-hidden="true" /> : null}
        {label}
      </span>
      <Switch checked={checked} onChange={onChange} label={ariaLabel || label} />
    </div>
  );
}

function CatalogFilters({ ctx, idPrefix }) {
  const { f, updateCatalogFilters, resetCatalogFilters, categories, catCounts, priceMax, formatPrice, wishlist, activeCount } = ctx;
  return (
    <div className="space-y-5">
      <FilterGroup title="دوّر في المعروض">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            type="search"
            value={f.q}
            onChange={(e) => updateCatalogFilters({ q: e.target.value, preset: 'search' })}
            placeholder="اسم القطعة أو الكود"
            aria-label="دوّر باسم القطعة أو الكود"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-3 pr-9 text-sm text-fg placeholder:text-fg-subtle focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="القسم">
        {categories.map((c) => (
          <RadioRow
            key={c.id}
            name={`${idPrefix}-cat`}
            checked={f.cat === c.id}
            onChange={() => updateCatalogFilters({ cat: c.id, preset: c.id === 'all' ? 'all' : `cat-${c.id}`, q: '' })}
            label={c.name}
            count={catCounts[c.id] || 0}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="الفرع">
        {BRANCHES.map((b) => (
          <RadioRow key={b.id} name={`${idPrefix}-branch`} checked={f.branch === b.id} onChange={() => updateCatalogFilters({ branch: b.id })} label={b.label} />
        ))}
      </FilterGroup>

      <FilterGroup title="السعر">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-fg-muted">لحد</span>
          <span className="num font-heading text-sm font-black text-fg">{f.maxPrice ? `${formatPrice(f.maxPrice)} ج` : 'أي سعر'}</span>
        </div>
        <input
          type="range"
          min={1000}
          max={priceMax}
          step={500}
          value={f.maxPrice || priceMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            updateCatalogFilters({ maxPrice: v >= priceMax ? null : v });
          }}
          aria-label="أقصى سعر"
          className="w-full accent-amber-500"
        />
        <div className="num flex justify-between text-[11px] text-fg-subtle">
          <span>1,000</span>
          <span>{formatPrice(priceMax)}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="تفضيلات">
        <ToggleRow label="المتاح بس" checked={f.status === 'avail'} onChange={(v) => updateCatalogFilters({ status: v ? 'avail' : 'all' })} ariaLabel="اعرض المتاح بس" />
        <ToggleRow label="عليه خصم" checked={f.onlyDiscount} onChange={(v) => updateCatalogFilters({ onlyDiscount: v })} ariaLabel="اعرض اللي عليه خصم بس" />
        {wishlist.length ? (
          <ToggleRow label="المفضلة بس" icon={Heart} checked={Boolean(f.wishlistOnly)} onChange={(v) => updateCatalogFilters({ wishlistOnly: v })} ariaLabel="اعرض المفضلة بس" />
        ) : null}
      </FilterGroup>

      {activeCount ? (
        <Button variant="secondary" size="md" block onClick={resetCatalogFilters}>
          <X className="h-4 w-4" aria-hidden="true" />
          امسح الفلاتر ({activeCount})
        </Button>
      ) : null}
    </div>
  );
}

function ActivePills({ ctx }) {
  const { f, updateCatalogFilters, categories, formatPrice } = ctx;
  const pills = [];
  if (f.q) pills.push({ key: 'q', label: `"${f.q}"`, clear: { q: '', preset: 'all' } });
  if (f.cat !== 'all') pills.push({ key: 'cat', label: categories.find((c) => c.id === f.cat)?.name, clear: { cat: 'all', preset: 'all' } });
  if (f.branch !== 'all') pills.push({ key: 'branch', label: `فرع ${f.branch}`, clear: { branch: 'all' } });
  if (f.status === 'avail') pills.push({ key: 'status', label: 'المتاح بس', clear: { status: 'all' } });
  if (f.onlyDiscount) pills.push({ key: 'disc', label: 'عليه خصم', clear: { onlyDiscount: false, preset: 'all' } });
  if (f.maxPrice) pills.push({ key: 'price', label: `لحد ${formatPrice(f.maxPrice)} ج`, clear: { maxPrice: null } });
  if (f.wishlistOnly) pills.push({ key: 'wish', label: 'المفضلة', clear: { wishlistOnly: false, preset: 'all' } });
  if (!pills.length) return null;
  return (
    <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => updateCatalogFilters(p.clear)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-xs font-bold text-white transition-colors hover:bg-ink-700 dark:bg-white dark:text-ink"
          aria-label={`شيل فلتر ${p.label}`}
        >
          {p.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export default function ProductCatalog() {
  const ctx = useCatalog();
  const { f, results, updateCatalogFilters, resetCatalogFilters, activeCount, getGeneralWhatsAppLink } = ctx;
  const reduce = useReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dense, setDense] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  const title = f.wishlistOnly ? 'المفضلة' : f.q ? `نتايج "${f.q}"` : 'كل المعروض';
  const gridCols = cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3', dense && 'xl:grid-cols-4');

  return (
    <section id="items" aria-labelledby="catalog-title" className="mx-auto mt-10 max-w-7xl px-3 sm:mt-14 sm:px-6" data-tour="catalog">
      <div className="mb-4">
        <h2 id="catalog-title" className="font-heading text-2xl font-black text-fg sm:text-[28px]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-fg-muted">الأسعار والحالة بتتحدث من لوحة التحكم على طول</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside aria-label="فلاتر المعروض" className="hidden lg:block">
          <div className="no-scrollbar sticky top-[calc(var(--header-h)+16px)] max-h-[calc(100vh-var(--header-h)-32px)] overflow-y-auto rounded-card border border-line bg-surface p-4">
            <CatalogFilters ctx={ctx} idPrefix="side" />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <Button variant="secondary" size="md" className="lg:hidden" onClick={() => setSheetOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              فلتر
              {activeCount ? (
                <span className="num flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-black text-ink">{activeCount}</span>
              ) : null}
            </Button>
            <p className="num text-sm font-bold text-fg-muted" aria-live="polite">
              {results.length} قطعة
            </p>
            <div className="mr-auto flex items-center gap-2">
              <label className="sr-only" htmlFor="sort-select">
                رتّب حسب
              </label>
              <Select id="sort-select" value={f.sort} onChange={(e) => updateCatalogFilters({ sort: e.target.value })} className="h-11 w-[148px] sm:w-[170px]">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <div className="hidden items-center rounded-xl border border-line bg-surface p-1 xl:flex" role="group" aria-label="شكل العرض">
                <button
                  type="button"
                  aria-pressed={!dense}
                  aria-label="3 في الصف"
                  onClick={() => setDense(false)}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-lg', !dense ? 'bg-surface-2 text-fg' : 'text-fg-subtle hover:text-fg')}
                >
                  <Grid2x2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-pressed={dense}
                  aria-label="4 في الصف"
                  onClick={() => setDense(true)}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-lg', dense ? 'bg-surface-2 text-fg' : 'text-fg-subtle hover:text-fg')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <ActivePills ctx={ctx} />

          {!ready ? (
            <div className={gridCols} aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length ? (
            <motion.ul layout={!reduce} className={gridCols}>
              <AnimatePresence initial={false} mode="popLayout">
                {results.map((p, i) => (
                  <motion.li
                    key={p.code}
                    layout={!reduce}
                    initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: reduce ? 1 : 0.96, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 6) * 0.03 }}
                  >
                    <ProductCard product={p} eager={i < 4} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title={f.q ? `"${f.q}" مش موجود دلوقتي` : 'مفيش قطع بالفلاتر دي'}
              description="سيب طلبك على الواتساب، وأول ما القطعة توصل هنبلغك قبل ما تنزل على الصفحة."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="secondary" onClick={resetCatalogFilters}>
                    امسح الفلاتر
                  </Button>
                  <Button
                    variant="whatsapp"
                    href={getGeneralWhatsAppLink(
                      `السلام عليكم يا حاج، أنا بدور على ${f.q || 'قطعة'} ومش لاقيها على الموقع. ممكن تسجلني في قايمة الانتظار وتبلغني أول ما توصل؟`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                    بلغني أول ما توصل
                  </Button>
                </div>
              }
            />
          )}
        </div>
      </div>

      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="فلتر وترتيب"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" onClick={resetCatalogFilters} disabled={!activeCount}>
              امسح
            </Button>
            <Button size="lg" block onClick={() => setSheetOpen(false)}>
              اعرض {results.length} قطعة
            </Button>
          </div>
        }
      >
        <div className="p-5">
          <CatalogFilters ctx={ctx} idPrefix="sheet" />
        </div>
      </Sheet>
    </section>
  );
}
