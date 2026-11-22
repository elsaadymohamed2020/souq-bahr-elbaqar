import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GripVertical, LayoutGrid, MapPin, SquareKanban, Users, UserRoundSearch } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useIsDesktop } from '../../lib/hooks';
import { Avatar, Button, EmptyState, FilterChips, SegmentedControl } from '../ui';
import { cn } from '../../lib/cn';
import { ChannelMark, SEGMENTS, SegmentBadge, SearchField, sum } from './adminShared';

const SEG_TILE = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  purple: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

function CustomerCard({ customer }) {
  const { setSelectedCustomer, formatPrice } = useApp();
  const reduce = useReducedMotion();
  return (
    <motion.li
      layout={reduce ? false : 'position'}
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={() => setSelectedCustomer(customer)}
        className="flex h-full w-full flex-col rounded-card border border-line bg-surface p-4 text-right transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift active:scale-[0.99] sm:p-5"
      >
        <span className="flex w-full items-start gap-3">
          <Avatar name={customer.name} label={customer.avatar} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-heading text-base font-black text-fg">{customer.name}</span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-fg-subtle">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{customer.gov}</span>
            </span>
          </span>
          <SegmentBadge seg={customer.seg} />
        </span>
        <span className="mt-3 block w-full rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-fg-muted">
          <span className="mb-0.5 block font-bold text-fg">عايز إيه</span>
          <span className="line-clamp-2">{customer.want}</span>
        </span>
        <span className="mt-auto block w-full pt-3">
          <span className="flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-fg-subtle">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <ChannelMark ch={customer.ch} size="xs" />
              <span className="truncate">آخر تواصل {customer.last}</span>
            </span>
            {customer.spent > 0 ? (
              <span className="num shrink-0 font-heading text-sm font-black text-emerald-700 dark:text-emerald-400">{formatPrice(customer.spent)} ج</span>
            ) : (
              <span className="shrink-0">لسه ماشتراش</span>
            )}
          </span>
        </span>
      </button>
    </motion.li>
  );
}

function PipelineCard({ customer, draggable, dragging, onDragStart, onDragEnd }) {
  const { setSelectedCustomer, updateCustomerSegment } = useApp();
  const selectId = `stage-${customer.id}`;
  return (
    <li
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', customer.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(customer.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'rounded-xl border border-line bg-surface shadow-soft-sm transition-[opacity,box-shadow] duration-150 hover:shadow-soft',
        draggable && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-40'
      )}
    >
      <button
        type="button"
        onClick={() => setSelectedCustomer(customer)}
        className="flex w-full items-start gap-2.5 rounded-t-xl p-3 text-right transition-[background-color,transform] duration-150 hover:bg-surface-2/60 active:scale-[0.99]"
      >
        {draggable ? <GripVertical className="mt-1.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" /> : null}
        <Avatar name={customer.name} label={customer.avatar} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-sm font-black text-fg">{customer.name}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-fg-muted">{customer.want}</span>
          <span className="mt-1.5 flex items-center gap-1 text-[11px] text-fg-subtle">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{customer.gov}</span>
          </span>
        </span>
      </button>
      <div className="flex items-center gap-2 border-t border-line px-3 py-2">
        <ChannelMark ch={customer.ch} size="xs" />
        <label htmlFor={selectId} className="sr-only">
          انقل {customer.name} لمرحلة تانية
        </label>
        <select
          id={selectId}
          value={customer.seg}
          onChange={(e) => updateCustomerSegment(customer.id, e.target.value)}
          className="ms-auto h-10 min-w-0 cursor-pointer rounded-lg border border-line bg-surface-2 px-2 text-xs font-bold text-fg transition-colors hover:border-line-strong focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15"
        >
          {SEGMENTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id === customer.seg ? `المرحلة: ${s.label}` : `انقل لـ ${s.label}`}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}

function Pipeline({ customers }) {
  const { updateCustomerSegment, formatPrice } = useApp();
  const isDesktop = useIsDesktop();
  const [dragging, setDragging] = useState(null);
  const [overSeg, setOverSeg] = useState(null);

  const drop = (e, segId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragging;
    setOverSeg(null);
    setDragging(null);
    const c = customers.find((x) => x.id === id);
    if (c && c.seg !== segId) updateCustomerSegment(id, segId);
  };

  return (
    <div className="no-scrollbar -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mx-0 xl:snap-none xl:overflow-visible xl:px-0">
      <div className="flex gap-3 xl:grid xl:grid-cols-4">
        {SEGMENTS.map((s) => {
          const items = customers.filter((c) => c.seg === s.id);
          const Icon = s.icon;
          const over = overSeg === s.id;
          const spent = s.id === 'buy' ? sum(items, (c) => c.spent) : 0;
          return (
            <section
              key={s.id}
              aria-label={`مرحلة ${s.label}`}
              onDragOver={(e) => {
                if (!dragging) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (overSeg !== s.id) setOverSeg(s.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOverSeg(null);
              }}
              onDrop={(e) => drop(e, s.id)}
              className={cn(
                'flex w-[80vw] max-w-[300px] shrink-0 snap-start flex-col rounded-card border transition-colors duration-150 xl:w-auto xl:max-w-none',
                over ? 'border-amber-400 bg-amber-50/70 dark:border-amber-500/50 dark:bg-amber-500/10' : 'border-line bg-surface-2/50'
              )}
            >
              <header className="px-3 pb-2 pt-3">
                <div className="flex items-center gap-2">
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', SEG_TILE[s.tone])}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-sm font-black text-fg">{s.label}</h3>
                  <span className="num rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-fg-muted ring-1 ring-line">{items.length}</span>
                  {spent ? (
                    <span className="num ms-auto text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{formatPrice(spent)} ج</span>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] text-fg-subtle">{s.hint}</p>
              </header>
              <ul className="flex min-h-[132px] flex-1 flex-col gap-2 px-2 pb-2">
                {items.map((c) => (
                  <PipelineCard
                    key={c.id}
                    customer={c}
                    draggable={isDesktop}
                    dragging={dragging === c.id}
                    onDragStart={setDragging}
                    onDragEnd={() => {
                      setDragging(null);
                      setOverSeg(null);
                    }}
                  />
                ))}
                {!items.length ? (
                  <li className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line-strong p-4 text-center text-xs text-fg-subtle">
                    {isDesktop ? 'اسحب عميل وسيبه هنا' : 'مفيش عملاء في المرحلة دي'}
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminCRM() {
  const { customers } = useApp();
  const [view, setView] = useState('grid');
  const [seg, setSeg] = useState('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const searched = useMemo(
    () => customers.filter((c) => !q || [c.name, c.gov, c.want, c.phone].some((v) => v && String(v).toLowerCase().includes(q))),
    [customers, q]
  );
  const gridList = searched.filter((c) => seg === 'all' || c.seg === seg);

  const segOptions = [
    { id: 'all', label: 'الكل', count: searched.length, icon: Users },
    ...SEGMENTS.map((s) => ({ id: s.id, label: s.label, count: searched.filter((c) => c.seg === s.id).length, icon: s.icon })),
  ];

  const clear = () => {
    setQuery('');
    setSeg('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={query} onChange={setQuery} placeholder="دوّر بالاسم أو المحافظة أو الطلب" className="sm:max-w-sm sm:flex-1" />
        <SegmentedControl
          layoutId="crm-view"
          ariaLabel="طريقة العرض"
          value={view}
          onChange={setView}
          size="md"
          className="self-start sm:self-auto"
          options={[
            { id: 'grid', label: 'كروت', icon: LayoutGrid },
            { id: 'pipeline', label: 'مراحل البيع', icon: SquareKanban },
          ]}
        />
      </div>

      {view === 'grid' ? <FilterChips ariaLabel="فلتر المرحلة" options={segOptions} value={seg} onChange={setSeg} /> : null}

      {!searched.length ? (
        <EmptyState
          icon={q ? UserRoundSearch : Users}
          title={q ? 'مفيش عميل بالشكل ده' : 'لسه مفيش عملاء'}
          description={q ? `مفيش حد اسمه أو طلبه فيه "${query.trim()}".` : 'أول ما حد يكلمك على أي قناة هيظهر هنا.'}
          action={
            q ? (
              <Button variant="secondary" onClick={clear}>
                امسح البحث
              </Button>
            ) : null
          }
        />
      ) : view === 'pipeline' ? (
        <Pipeline customers={searched} />
      ) : gridList.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {gridList.map((c) => (
              <CustomerCard key={c.id} customer={c} />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title="مفيش عملاء في المرحلة دي"
          description="جرّب مرحلة تانية أو شوف الكل."
          action={
            <Button variant="secondary" onClick={() => setSeg('all')}>
              شوف كل العملاء
            </Button>
          }
        />
      )}
    </div>
  );
}
