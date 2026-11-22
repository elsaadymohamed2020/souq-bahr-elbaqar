import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center', className)}>
      {Icon ? (
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-fg-subtle">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="font-heading text-base font-black text-fg">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

const AVATAR_TONES = [
  'bg-ink text-amber-400',
  'bg-amber-500 text-ink',
  'bg-emerald-600 text-white',
  'bg-brand-blue text-white',
  'bg-violet-600 text-white',
];

export function Avatar({ name = '', label, size = 'md', className, tone }) {
  const text = label || name.trim().charAt(0) || '؟';
  const idx = tone ?? [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_TONES.length;
  const sizes = { sm: 'h-8 w-8 text-xs rounded-lg', md: 'h-10 w-10 text-sm rounded-xl', lg: 'h-12 w-12 text-base rounded-2xl' };
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center font-heading font-black', sizes[size], AVATAR_TONES[idx], className)}
    >
      {text}
    </span>
  );
}

export function Switch({ checked, onChange, label, className, size = 'md' }) {
  const dims = size === 'sm' ? { track: 'h-5 w-9', knob: 'h-4 w-4', on: -16 } : { track: 'h-6 w-11', knob: 'h-5 w-5', on: -20 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
        dims.track,
        checked ? 'bg-emerald-500' : 'bg-surface-3',
        className
      )}
    >
      <motion.span
        className={cn('block rounded-full bg-white shadow-sm', dims.knob)}
        animate={{ x: checked ? dims.on : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
      />
    </button>
  );
}

/** Fade and rise in once when scrolled into view. Reduced motion: fade only. */
export function Reveal({ as = 'div', children, className, delay = 0, y = 14, ...props }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-line bg-surface-2 px-1 font-sans text-[10px] font-semibold text-fg-subtle">
      {children}
    </kbd>
  );
}
