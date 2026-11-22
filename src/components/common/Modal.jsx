import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useOverlay } from '../../lib/useOverlay';
import { cn } from '../../lib/cn';

/**
 * Dialog: bottom sheet on phones, centered card on larger screens.
 * Props kept compatible with the old Modal: isOpen, onClose, title, children, maxWidth.
 * New: footer, icon, subtitle, bodyClassName, tone ('default' | 'celebrate').
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-lg',
  bodyClassName,
  tone = 'default',
  hideHeader = false,
  dataTour,
}) {
  const ref = useRef(null);
  const titleId = useId();
  const reduce = useReducedMotion();
  useOverlay(isOpen, onClose, ref);

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            data-tour={dataTour}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-soft-lg outline-none sm:rounded-3xl',
              maxWidth
            )}
          >
            {!hideHeader ? (
              <div
                className={cn(
                  'flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4 sm:px-6',
                  tone === 'celebrate' ? 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10' : 'border-line bg-surface'
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  {Icon ? (
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        tone === 'celebrate' ? 'bg-amber-500 text-ink' : 'bg-surface-2 text-fg'
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                  <div className="min-w-0">
                    <h3 id={titleId} className="font-heading text-lg font-black leading-snug text-fg sm:text-xl">
                      {title}
                    </h3>
                    {subtitle ? <p className="mt-0.5 text-xs text-fg-muted sm:text-sm">{subtitle}</p> : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                  aria-label="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null}

            <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6', bodyClassName)}>{children}</div>

            {footer ? <div className="shrink-0 border-t border-line bg-surface-2/60 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
