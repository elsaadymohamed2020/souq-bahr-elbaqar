import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ClipboardList, Clock3, Coins, Layers, MapPin, Plus, Scale, TrendingDown, Warehouse, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimatedNumber, Badge, Button, EmptyState, FilterChips, SegmentedControl, StatusBadge } from '../ui';
import { cn } from '../../lib/cn';
import { ConfirmDelete, Thumb, sum } from './adminShared';

export const DEAL_LABELS = { avail: 'متاحة', held: 'جاري المعاينة', sold: 'اتباعت' };

const DEAL_STATUS_OPTIONS = [
  { id: 'avail', label: 'متاحة', icon: CheckCircle2, activeText: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'held', label: 'معاينة', icon: Clock3, activeText: 'text-amber-700 dark:text-amber-300' },
  { id: 'sold', label: 'اتباعت', icon: XCircle, activeText: 'text-red-700 dark:text-red-300' },
];

function StatStrip({ deals }) {
  const { formatPrice } = useApp();
  const by = (s) => deals.filter((d) => d.status === s);
  const sold = by('sold');
  const stats = [
    { id: 'vol', label: 'قيمة كل الصفقات', value: sum(deals, (d) => d.totalPrice), money: true, icon: Coins, tone: 'text-fg', sub: `${deals.length} صفقة على الموقع` },
    { id: 'avail', label: 'متاحة للمعاينة', value: by('avail').length, icon: CheckCircle2, tone: 'text-emerald-700 dark:text-emerald-400', sub: 'مستنية تاجر' },
    { id: 'held', label: 'جاري المعاينة', value: by('held').length, icon: Clock3, tone: 'text-amber-700 dark:text-amber-400', sub: 'فيه مشتري بيعاين' },
    { id: 'sold', label: 'اتباعت', value: sold.length, icon: XCircle, tone: 'text-red-700 dark:text-red-400', sub: `بـ ${formatPrice(sum(sold, (d) => d.totalPrice))} ج` },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.id} className="bg-surface p-4 sm:p-5">
            <p className="flex items-center gap-1.5 text-xs font-bold text-fg-muted">
              <Icon className={cn('h-4 w-4', s.tone)} aria-hidden="true" />
              {s.label}
            </p>
            <p className="mt-2 font-heading text-xl font-black text-fg sm:text-2xl">
              <AnimatedNumber value={s.value} format={s.money ? (n) => formatPrice(Math.round(n)) : undefined} />
              {s.money ? <span className="ms-1 text-xs font-semibold text-fg-subtle">ج</span> : null}
            </p>
            <p className="num mt-0.5 truncate text-[11px] text-fg-subtle">{s.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

function DealCard({ deal }) {
  const { formatPrice, updateDealStatus, deleteDeal, setSelectedDealForDetail } = useApp();
  const reduce = useReducedMotion();
  const retail = Number(deal.estimatedRetail) || 0;
  const saving = retail > deal.totalPrice ? Math.round(((retail - deal.totalPrice) / retail) * 100) : 0;
  const itemsCount = deal.items?.length || 0;

  return (
    <motion.article
      layout={reduce ? false : 'position'}
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduce ? 1 : 0.98, transition: { duration: 0.15 } }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-w-0 flex-col rounded-card border border-line bg-surface shadow-soft-sm transition-shadow duration-200 hover:shadow-soft"
    >
      <div className="relative">
        <Thumb src={deal.img} alt={deal.title} icon={Layers} className="aspect-[16/9] w-full rounded-t-card" iconClassName="h-10 w-10" />
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
          <StatusBadge status={deal.status} labels={DEAL_LABELS} className="shadow-soft-sm" />
          {deal.badge ? <Badge tone="glass">{deal.badge}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-muted">
          <span className="num rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold" dir="ltr">
            {deal.code}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-fg-subtle" aria-hidden="true" />
            فرع {deal.branch}
          </span>
          {deal.weight ? (
            <span className="inline-flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-fg-subtle" aria-hidden="true" />
              {deal.weight}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 font-heading text-base font-black leading-snug text-fg">{deal.title}</h3>

        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold text-fg-subtle">السعر على بعضه</p>
            <p className={cn('font-heading text-2xl font-black', deal.status === 'sold' ? 'text-fg-subtle line-through' : 'text-fg')}>
              <span className="num">{formatPrice(deal.totalPrice)}</span> <span className="text-xs font-semibold text-fg-subtle">ج</span>
            </p>
          </div>
          {saving ? (
            <Badge tone="emerald" icon={TrendingDown}>
              أقل من السوق <span className="num">{saving}%</span>
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button variant="soft" size="sm" className="h-10" onClick={() => setSelectedDealForDetail(deal)}>
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            كشف المحتويات (<span className="num">{itemsCount}</span> بند)
          </Button>
          {deal.location ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-fg-muted">
              <Warehouse className="h-3.5 w-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
              <span className="line-clamp-1">{deal.location}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <SegmentedControl
            layoutId={`deal-status-${deal.code}`}
            ariaLabel={`حالة الصفقة ${deal.code}`}
            options={DEAL_STATUS_OPTIONS}
            value={deal.status}
            onChange={(s) => s !== deal.status && updateDealStatus(deal.code, s)}
            size="md"
            className="[&>button]:px-3"
          />
          <ConfirmDelete itemLabel={`الصفقة ${deal.code}`} onConfirm={() => deleteDeal(deal.code)} />
        </div>
      </div>
    </motion.article>
  );
}

export default function AdminDeals() {
  const { deals, setIsAddDealOpen } = useApp();
  const [status, setStatus] = useState('all');

  const options = useMemo(
    () => [
      { id: 'all', label: 'الكل', count: deals.length, icon: Layers },
      { id: 'avail', label: 'متاحة', count: deals.filter((d) => d.status === 'avail').length, icon: CheckCircle2 },
      { id: 'held', label: 'جاري المعاينة', count: deals.filter((d) => d.status === 'held').length, icon: Clock3 },
      { id: 'sold', label: 'اتباعت', count: deals.filter((d) => d.status === 'sold').length, icon: XCircle },
    ],
    [deals]
  );

  const list = deals.filter((d) => status === 'all' || d.status === status);

  return (
    <div className="space-y-4 lg:space-y-5">
      <StatStrip deals={deals} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips ariaLabel="فلتر حالة الصفقات" options={options} value={status} onChange={setStatus} className="min-w-0 sm:flex-1" />
        <Button variant="primary" onClick={() => setIsAddDealOpen(true)} className="shrink-0 self-start sm:self-auto">
          <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          صفقة جديدة
        </Button>
      </div>

      {list.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {list.map((deal) => (
              <DealCard key={deal.code} deal={deal} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title={deals.length ? 'مفيش صفقات بالحالة دي' : 'لسه مفيش صفقات'}
          description={deals.length ? 'جرّب حالة تانية.' : 'نزّل أول لوط أو شروة وهتظهر للتجار على الموقع.'}
          action={
            deals.length ? (
              <Button variant="secondary" onClick={() => setStatus('all')}>
                شوف كل الصفقات
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setIsAddDealOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                صفقة جديدة
              </Button>
            )
          }
        />
      )}
    </div>
  );
}
