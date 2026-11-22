import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Horizontal product rail (RTL aware): scroll-snap, swipe on touch,
 * arrow buttons on pointer devices. In RTL, "next" moves toward the left.
 */
export default function Rail({ children, className, itemClassName = 'w-[46%] sm:w-[32%] md:w-[24%] lg:w-[19%]', ariaLabel, dark }) {
  const ref = useRef(null);
  const [state, setState] = useState({ prev: false, next: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL browsers report 0 .. -max
    setState({ prev: pos > 4, next: pos < max - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return undefined;
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
    };
  }, [measure, children]);

  const go = (dir) => {
    const el = ref.current;
    if (!el) return;
    // dir: 1 = next (to the left in RTL), -1 = previous
    el.scrollBy({ left: -dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const arrow = cn(
    'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-soft transition-[opacity,transform] duration-150 hover:scale-105 active:scale-95 md:flex',
    dark ? 'border-white/15 bg-ink-800 text-white' : 'border-line bg-surface text-fg'
  );

  return (
    <div className={cn('group/rail relative', className)}>
      <ul
        ref={ref}
        aria-label={ariaLabel}
        className="no-scrollbar snap-rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-4 sm:px-6"
      >
        {React.Children.map(children, (child) =>
          child ? <li className={cn('shrink-0', itemClassName)}>{child}</li> : null
        )}
      </ul>
      {state.prev ? (
        <button type="button" aria-label="السابق" onClick={() => go(-1)} className={cn(arrow, '-right-3')}>
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : null}
      {state.next ? (
        <button type="button" aria-label="التالي" onClick={() => go(1)} className={cn(arrow, '-left-3')}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
