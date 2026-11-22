import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15 disabled:opacity-60';

export function Field({ label, hint, error, children, className, required, htmlFor }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-xs font-bold text-fg">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, 'h-11', invalid && 'border-red-400 focus:border-red-500 focus:ring-red-500/15', className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, 'min-h-[88px] resize-y py-3 leading-relaxed', invalid && 'border-red-400', className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(inputClass, 'h-11 appearance-none pl-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
    </div>
  );
});

/** Labeled input helper: <LabeledInput label="الاسم" ... /> */
export function LabeledInput({ label, hint, error, required, className, ...props }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} className={className}>
      <Input id={id} invalid={Boolean(error)} required={required} {...props} />
    </Field>
  );
}
