import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Card({ as: Comp = 'div', className, interactive, children, ...props }) {
  return (
    <Comp
      className={cn(
        'rounded-card border border-line bg-surface',
        interactive && 'transition-[box-shadow,transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Section title row used by store rails and admin pages: title, optional meta, optional "see all". */
export function SectionHeader({ eyebrow, title, subtitle, action, onAction, actionLabel = 'شوف الكل', children, className, dark }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <div className={cn('flex items-center gap-1.5 text-xs font-bold', dark ? 'text-amber-300' : 'text-amber-700 dark:text-amber-400')}>
            {eyebrow}
          </div>
        ) : null}
        <h2 className={cn('font-heading text-xl font-black leading-tight sm:text-2xl', dark ? 'text-white' : 'text-fg')}>{title}</h2>
        {subtitle ? <p className={cn('max-w-[60ch] text-sm', dark ? 'text-slate-300' : 'text-fg-muted')}>{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onAction || action ? (
          <button
            type="button"
            onClick={onAction}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold transition-colors',
              dark ? 'text-amber-300 hover:text-amber-200' : 'text-brand-blue hover:text-blue-700 dark:text-blue-400'
            )}
          >
            {action || actionLabel}
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default Card;
