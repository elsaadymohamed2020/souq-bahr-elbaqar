import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary:
    'bg-amber-500 text-ink hover:bg-amber-400 active:bg-amber-600 shadow-[0_6px_16px_-8px_rgba(245,158,11,0.8)]',
  dark: 'bg-ink text-white hover:bg-ink-700 dark:bg-white dark:text-ink dark:hover:bg-slate-200',
  secondary:
    'bg-surface text-fg border border-line hover:border-line-strong hover:bg-surface-2',
  soft: 'bg-surface-2 text-fg hover:bg-surface-3',
  ghost: 'text-fg-muted hover:text-fg hover:bg-surface-2',
  whatsapp: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  outlineLight: 'border border-white/25 text-white hover:bg-white/10',
};

const SIZES = {
  xs: 'h-8 px-2.5 text-xs gap-1 rounded-lg',
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-xl',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-2xl',
  xl: 'h-14 px-6 text-base gap-2.5 rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
  'icon-lg': 'h-12 w-12 rounded-2xl',
};

const Button = forwardRef(function Button(
  { as, href, variant = 'primary', size = 'md', className, children, loading = false, disabled, block, ...props },
  ref
) {
  const Comp = as || (href ? 'a' : 'button');
  const isIcon = size.startsWith('icon');
  return (
    <Comp
      ref={ref}
      href={href}
      disabled={Comp === 'button' ? disabled || loading : undefined}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      type={Comp === 'button' && !props.type ? 'button' : props.type}
      className={cn(
        'inline-flex select-none items-center justify-center font-heading font-bold whitespace-nowrap',
        'transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        isIcon && 'p-0',
        block && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : null}
      {children}
    </Comp>
  );
});

export default Button;
