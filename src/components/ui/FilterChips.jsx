import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

/**
 * Pill chips. options: [{ id, label, count?, icon? }]
 * Single select by default.
 */
export function FilterChips({ options, value, onChange, className, size = 'md', scroll = true, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('flex gap-2', scroll ? 'no-scrollbar -mx-1 overflow-x-auto px-1 pb-0.5' : 'flex-wrap', className)}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border font-heading font-bold transition-colors duration-150',
              size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
              active
                ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink'
                : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
            )}
          >
            {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
            <span>{opt.label}</span>
            {typeof opt.count === 'number' ? (
              <span
                className={cn(
                  'num rounded-full px-1.5 py-0.5 text-[10px] leading-none',
                  active ? 'bg-white/20 dark:bg-ink/10' : 'bg-surface-2 text-fg-subtle'
                )}
              >
                {opt.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented control with a sliding thumb. options: [{ id, label, icon?, activeClass? }] */
export function SegmentedControl({ options, value, onChange, className, size = 'sm', layoutId, ariaLabel }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('inline-flex rounded-xl border border-line bg-surface-2 p-1', className)}>
      {options.map((opt) => {
        const active = value === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'relative inline-flex items-center justify-center gap-1 rounded-lg font-heading font-bold transition-colors',
              size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
              active ? opt.activeText || 'text-fg' : 'text-fg-subtle hover:text-fg'
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className={cn('absolute inset-0 rounded-lg bg-surface shadow-soft-sm', opt.activeBg)}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-1">
              {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips;
