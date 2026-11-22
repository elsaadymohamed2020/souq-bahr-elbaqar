import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useOverlay } from '../../lib/useOverlay';
import { useMediaQuery } from '../../lib/hooks';
import { cn } from '../../lib/cn';

/**
 * Bottom sheet on phones, side drawer on larger screens.
 * side: 'start' (right in RTL) | 'end' (left in RTL)
 */
export default function Sheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  side = 'start',
  width = 'sm:max-w-md',
  mobileHeight = 'max-h-[88vh]',
  bodyClassName,
  hideHeader,
  labelledBy,
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const isPhone = useMediaQuery('(max-width: 639px)');
  const dragControls = useDragControls();
  const startDrag = (e) => {
    if (isPhone && !reduce) dragControls.start(e);
  };
  useOverlay(isOpen, onClose, ref);

  const fromX = side === 'start' ? '100%' : '-100%';
  const variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1 } }
    : isPhone
    ? { hidden: { y: '100%' }, shown: { y: 0 } }
    : { hidden: { x: fromX }, shown: { x: 0 } };

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex" role="presentation">
          <motion.div
            className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
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
            aria-label={labelledBy ? undefined : title}
            aria-labelledby={labelledBy}
            tabIndex={-1}
            variants={variants}
            initial="hidden"
            animate="shown"
            exit="hidden"
            transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.32 }}
            drag={isPhone && !reduce ? 'y' : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className={cn(
              'relative flex w-full flex-col bg-surface shadow-soft-lg outline-none',
              'mt-auto rounded-t-3xl sm:mt-0 sm:h-full sm:rounded-none',
              mobileHeight,
              'sm:max-h-none',
              width,
              side === 'start' ? 'sm:ml-auto' : 'sm:mr-auto'
            )}
          >
            {isPhone ? (
              <div className="flex shrink-0 touch-none justify-center pb-1 pt-2.5" onPointerDown={startDrag} aria-hidden="true">
                <span className="h-1.5 w-12 rounded-full bg-line-strong" />
              </div>
            ) : null}
            {!hideHeader ? (
              <div className="flex shrink-0 touch-none items-start justify-between gap-3 border-b border-line px-5 py-4 sm:touch-auto" onPointerDown={startDrag}>
                <div className="min-w-0">
                  <h2 className="font-heading text-lg font-black text-fg">{title}</h2>
                  {subtitle ? <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null}
            <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain', bodyClassName)}>{children}</div>
            {footer ? <div className="shrink-0 border-t border-line bg-surface px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
