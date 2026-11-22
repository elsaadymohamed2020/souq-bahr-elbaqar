import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Copy, Package, ShoppingBag } from 'lucide-react';
import { Button } from '../ui';
import { iconFor } from '../client/icons';
import { cn } from '../../lib/cn';

const EASE = [0.16, 1, 0.3, 1];

/** "قطعة واحدة" / "قطعتين" / "3 قطع" / "12 قطعة" with the number in tabular figures. */
export function Pieces({ n }) {
  if (n === 1) return <>قطعة واحدة</>;
  if (n === 2) return <>قطعتين</>;
  return (
    <>
      <span className="num">{n}</span> {n >= 3 && n <= 10 ? 'قطع' : 'قطعة'}
    </>
  );
}

/** Radio indicator that changes shape, not only color, when checked. */
export function RadioMark({ checked, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
        checked ? 'border-amber-500 bg-amber-500 text-ink' : 'border-line-strong bg-surface',
        className
      )}
    >
      {checked ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
    </span>
  );
}

/** Product photo thumbnail with an icon fallback. */
export function Thumb({ product, className, imgClassName }) {
  const Icon = iconFor(product?.icon);
  return (
    <span className={cn('block overflow-hidden bg-surface-2', className)}>
      {product?.img ? (
        <img src={product.img} alt="" width="160" height="120" loading="lazy" decoding="async" className={cn('h-full w-full object-cover', imgClassName)} />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-fg-subtle">
          {Icon ? <Icon className="h-6 w-6" aria-hidden="true" /> : <Package className="h-6 w-6" aria-hidden="true" />}
        </span>
      )}
    </span>
  );
}

/** Copy to clipboard with an inline "اتنسخ" confirmation. */
export function CopyButton({ value, label, className }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      // clipboard can be blocked; the confirmation still helps in a demo
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };
  return (
    <Button variant="soft" size="sm" className={cn('h-10 shrink-0 px-3', className)} onClick={copy} aria-label={copied ? 'اتنسخ' : `انسخ ${label}`}>
      {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'اتنسخ' : 'انسخ'}</span>
    </Button>
  );
}

export function CopyRow({ label, value, display }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2">
      <div className="min-w-0">
        <span className="block text-[11px] font-semibold text-fg-subtle">{label}</span>
        <span className="num block truncate text-right font-heading text-sm font-black text-fg" dir="ltr">
          {display || value}
        </span>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

/**
 * Step indicator with a progress bar per step.
 * Done steps show a check and can be clicked to go back; the current one is marked aria-current.
 */
export function Stepper({ steps, current, onJump }) {
  const reduce = useReducedMotion();
  return (
    <nav aria-label="خطوات الطلب">
      <p className="sr-only" aria-live="polite">
        الخطوة {current + 1} من {steps.length}: {steps[current]?.label}
      </p>
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const inner = (
            <>
              <span className="block h-1.5 overflow-hidden rounded-full bg-surface-3">
                <motion.span
                  className="block h-full rounded-full bg-amber-500"
                  initial={false}
                  animate={{ width: i <= current ? '100%' : '0%' }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                />
              </span>
              <span className="mt-2 flex items-center gap-1.5">
                <span
                  className={cn(
                    'num flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-colors',
                    done && 'bg-ink text-white dark:bg-white dark:text-ink',
                    active && 'bg-amber-500 text-ink',
                    !done && !active && 'border border-line-strong bg-surface text-fg-subtle'
                  )}
                  aria-hidden="true"
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'truncate font-heading text-xs font-bold',
                    active ? 'text-fg' : done ? 'text-fg-muted group-hover:text-fg' : 'text-fg-subtle'
                  )}
                >
                  {s.label}
                  {done ? <span className="sr-only"> (خلصت)</span> : null}
                </span>
              </span>
            </>
          );
          return (
            <li key={s.id} aria-current={active ? 'step' : undefined}>
              {done ? (
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="group block w-full rounded-lg py-1 text-right"
                  aria-label={`ارجع لخطوة ${s.label}`}
                >
                  {inner}
                </button>
              ) : (
                <div className="py-1">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Items + totals. Used in the desktop side column, the phone collapsible, and the review step. */
export function OrderSummary({ items, formatPrice, total, savings = 0, shipping, totalLabel = 'الإجمالي', totalNote, maxItems = 4, className }) {
  const shown = items.slice(0, maxItems);
  const rest = items.length - shown.length;
  return (
    <div className={cn('space-y-3', className)}>
      <ul className="space-y-3">
        {shown.map(({ product, code, quantity, subtotal }) => (
          <li key={code} className="flex items-center gap-3">
            <span className="relative shrink-0">
              <Thumb product={product} className="aspect-[4/3] w-14 rounded-lg" />
              {quantity > 1 ? (
                <span className="num absolute -left-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-black text-white ring-2 ring-surface dark:bg-white dark:text-ink">
                  <span className="sr-only">الكمية </span>
                  {quantity}
                </span>
              ) : null}
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs font-bold leading-snug text-fg">{product.name}</p>
              <span className="num text-[11px] text-fg-subtle" dir="ltr">
                {code}
              </span>
            </div>
            <span className="num shrink-0 text-xs font-black text-fg">{formatPrice(subtotal)} ج</span>
          </li>
        ))}
      </ul>
      {rest > 0 ? (
        <p className="text-xs font-bold text-fg-muted">
          و<span className="num">{rest}</span> كمان في الطلب
        </p>
      ) : null}

      <dl className="space-y-2 border-t border-line pt-3 text-[13px]">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-fg-muted">سعر القطع</dt>
          <dd className="num font-bold text-fg">{formatPrice(total + savings)} ج</dd>
        </div>
        {savings > 0 ? (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-fg-muted">خصم العروض</dt>
            <dd className="num font-bold text-emerald-700 dark:text-emerald-400" dir="ltr">
              -{formatPrice(savings)} ج
            </dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-fg-muted">الشحن</dt>
          <dd className="text-left font-bold text-fg">{shipping}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2.5">
          <dt className="font-heading text-sm font-black text-fg">{totalLabel}</dt>
          <dd className="num font-heading text-lg font-black text-fg">
            {formatPrice(total)} <span className="text-xs font-bold text-fg-muted">ج</span>
          </dd>
        </div>
        {totalNote ? <p className="text-left text-[11px] font-semibold text-fg-subtle">{totalNote}</p> : null}
      </dl>
    </div>
  );
}

/** Phone only: one line with the total that opens into the full summary. */
export function SummaryToggle({ id, count, total, formatPrice, children, className }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className={cn('rounded-2xl border border-line bg-surface-2/60', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex min-h-[48px] w-full items-center gap-2 rounded-2xl px-3 text-right transition-colors hover:bg-surface-2"
      >
        <ShoppingBag className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-fg">
          {open ? 'اخفي الملخص' : 'ملخص الطلب'}{' '}
          <span className="font-semibold text-fg-subtle">
            (<Pieces n={count} />)
          </span>
        </span>
        <span className="num shrink-0 font-heading text-sm font-black text-fg">{formatPrice(total)} ج</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            key="summary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-line p-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Visual card that mirrors what is typed. Decorative: the inputs carry the real labels. */
export function CardPreview({ number, name, expiry, brand }) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[1.586] w-full max-w-[290px] overflow-hidden rounded-2xl bg-gradient-to-br from-ink-950 via-ink-800 to-ink-700 p-4 text-white shadow-soft-lg ring-1 ring-white/10"
    >
      <span className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-amber-500/20 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-brand-blue/25 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <span className="font-heading text-[11px] font-black text-amber-300">سوق بحر البقر الكبير</span>
          <span className="font-heading text-sm font-black tracking-wide text-white/90" dir="ltr">
            {brand?.label || 'CARD'}
          </span>
        </div>
        <span className="block h-7 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-500/80" />
        <div className="num text-left text-[17px] font-bold tracking-[0.12em]" dir="ltr">
          {number || '•••• •••• •••• ••••'}
        </div>
        <div className="flex items-end justify-between gap-3 text-[11px]">
          <div className="min-w-0">
            <span className="block text-[9px] text-white/60">الاسم</span>
            <span className="block truncate font-bold uppercase">{name || 'الاسم على الكارت'}</span>
          </div>
          <div className="shrink-0 text-left">
            <span className="block text-[9px] text-white/60">ينتهي</span>
            <span className="num font-bold" dir="ltr">
              {expiry || 'MM/YY'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
