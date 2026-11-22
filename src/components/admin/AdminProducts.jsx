import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Clock3, MapPin, Package, PackagePlus, PackageSearch, Sparkles, Tag, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, EmptyState, FilterChips, SegmentedControl, Select } from '../ui';
import { cn } from '../../lib/cn';
import { ConfirmDelete, SearchField, Thumb } from './adminShared';

const STATUS_OPTIONS = [
  { id: 'avail', label: 'متاح', icon: CheckCircle2, activeText: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'held', label: 'محجوز', icon: Clock3, activeText: 'text-amber-700 dark:text-amber-300' },
  { id: 'sold', label: 'اتباع', icon: XCircle, activeText: 'text-red-700 dark:text-red-300' },
];

const SORTS = [
  { id: 'newest', label: 'الأحدث الأول' },
  { id: 'price-asc', label: 'السعر: من الأقل' },
  { id: 'price-desc', label: 'السعر: من الأعلى' },
];

function ProductRow({ product }) {
  const { updateProductStatus, deleteProduct, formatPrice, getFinalPrice, getOfferForProduct } = useApp();
  const reduce = useReducedMotion();
  const final = getFinalPrice(product);
  const offer = getOfferForProduct(product);
  const margin = final - (product.cost || 0);

  return (
    <motion.li
      layout={reduce ? false : 'position'}
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduce ? 1 : 0.98, transition: { duration: 0.15 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-card border border-line bg-surface p-3 sm:p-4 lg:rounded-none lg:border-0 lg:px-5 lg:py-3.5"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
        <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center">
          <Thumb src={product.img} className="h-16 w-16 rounded-xl sm:h-14 sm:w-14" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="num rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-fg-muted" dir="ltr">
                {product.code}
              </span>
              {product.isNew ? (
                <Badge tone="blue" size="xs" icon={Sparkles}>
                  جديد
                </Badge>
              ) : null}
              {offer ? (
                <Badge tone="amber" size="xs" icon={Tag}>
                  خصم <span className="num">{offer.pct}%</span>
                </Badge>
              ) : null}
            </div>
            <h3 className="mt-1 line-clamp-2 font-heading text-sm font-bold leading-snug text-fg sm:text-[15px]">{product.name}</h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-fg-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-fg-subtle" aria-hidden="true" />
                فرع {product.branch}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                التكلفة <b className="num font-bold text-fg">{formatPrice(product.cost)}</b> ج
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3 lg:block lg:w-36 lg:border-0 lg:pt-0 lg:text-left">
          <div className="flex items-baseline gap-1.5 lg:justify-end">
            {final !== product.price ? <s className="num text-xs text-fg-subtle">{formatPrice(product.price)}</s> : null}
            <span className="num font-heading text-lg font-black text-fg">{formatPrice(final)}</span>
            <span className="text-xs font-semibold text-fg-subtle">ج</span>
          </div>
          <span className={cn('num text-xs font-bold', margin >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
            ربح {formatPrice(margin)} ج
          </span>
        </div>

        <div className="flex items-center gap-2 lg:w-[320px] lg:justify-end">
          <SegmentedControl
            layoutId={`product-status-${product.code}`}
            ariaLabel={`حالة ${product.name}`}
            options={STATUS_OPTIONS}
            value={product.status}
            onChange={(s) => s !== product.status && updateProductStatus(product.code, s)}
            size="md"
            className="flex-1 lg:flex-none [&>button]:flex-1 [&>button]:px-2.5 lg:[&>button]:px-3"
          />
          <ConfirmDelete itemLabel={`القطعة ${product.code}`} onConfirm={() => deleteProduct(product.code)} />
        </div>
      </div>
    </motion.li>
  );
}

export default function AdminProducts() {
  const { products, openAddProduct, getFinalPrice } = useApp();
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');

  const counts = useMemo(
    () => ({
      all: products.length,
      avail: products.filter((p) => p.status === 'avail').length,
      held: products.filter((p) => p.status === 'held').length,
      sold: products.filter((p) => p.status === 'sold').length,
    }),
    [products]
  );

  const q = query.trim().toLowerCase();
  const list = useMemo(() => {
    const rows = products
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => (status === 'all' || p.status === status) && (!q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)));
    if (sort === 'price-asc') rows.sort((a, b) => getFinalPrice(a.p) - getFinalPrice(b.p));
    else if (sort === 'price-desc') rows.sort((a, b) => getFinalPrice(b.p) - getFinalPrice(a.p));
    else rows.sort((a, b) => (b.p.addedAt || 0) - (a.p.addedAt || 0) || a.i - b.i);
    return rows.map((r) => r.p);
  }, [products, status, q, sort, getFinalPrice]);

  const filterOptions = [
    { id: 'all', label: 'الكل', count: counts.all, icon: Package },
    { id: 'avail', label: 'متاح', count: counts.avail, icon: CheckCircle2 },
    { id: 'held', label: 'محجوز', count: counts.held, icon: Clock3 },
    { id: 'sold', label: 'اتباع', count: counts.sold, icon: XCircle },
  ];

  const clearFilters = () => {
    setStatus('all');
    setQuery('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="دوّر باسم القطعة أو الكود" className="sm:max-w-sm sm:flex-1" />
        <div className="flex gap-2 sm:ms-auto">
          <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
            <label htmlFor="products-sort" className="sr-only">
              الترتيب
            </label>
            <Select id="products-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="font-bold">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="primary" onClick={() => openAddProduct()} className="shrink-0">
            <PackagePlus className="h-[18px] w-[18px]" aria-hidden="true" />
            إضافة قطعة
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterChips ariaLabel="فلتر الحالة" options={filterOptions} value={status} onChange={setStatus} className="min-w-0 flex-1" />
        <p className="shrink-0 text-xs font-bold text-fg-muted" aria-live="polite">
          <span className="num">{list.length}</span> قطعة
        </p>
      </div>

      {list.length ? (
        <div className="lg:overflow-visible lg:rounded-card lg:border lg:border-line lg:bg-surface">
          <div className="hidden items-center gap-5 border-b border-line px-5 py-2.5 text-xs font-bold text-fg-subtle lg:flex" aria-hidden="true">
            <span className="flex-1">القطعة</span>
            <span className="w-36 text-left">السعر على الموقع</span>
            <span className="w-[320px]">الحالة</span>
          </div>
          <ul className="space-y-3 lg:space-y-0 lg:divide-y lg:divide-line">
            <AnimatePresence initial={false}>
              {list.map((p) => (
                <ProductRow key={p.code} product={p} />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      ) : products.length ? (
        <EmptyState
          icon={PackageSearch}
          title="مفيش قطع بالشكل ده"
          description={q ? `مفيش قطعة اسمها أو كودها فيه "${query.trim()}".` : 'جرّب حالة تانية.'}
          action={
            <Button variant="secondary" onClick={clearFilters}>
              شوف كل القطع
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Package}
          title="لسه مفيش قطع"
          description="ضيف أول قطعة وهتظهر على الموقع على طول."
          action={
            <Button variant="primary" onClick={() => openAddProduct()}>
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              إضافة قطعة
            </Button>
          }
        />
      )}
    </div>
  );
}
