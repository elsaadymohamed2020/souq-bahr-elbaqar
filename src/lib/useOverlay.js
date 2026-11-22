import { useEffect, useRef } from 'react';

// A tiny stack so only the top-most overlay reacts to Escape,
// and body scroll stays locked while any overlay is open.
const stack = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useOverlay(isOpen, onClose, containerRef, { initialFocus = true } = {}) {
  const idRef = useRef(Symbol('overlay'));
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    const id = idRef.current;
    const previouslyFocused = document.activeElement;
    stack.push(id);
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const root = containerRef?.current;
      if (!root || !initialFocus) return;
      const auto = root.querySelector('[data-autofocus]');
      const first = auto || root.querySelector(FOCUSABLE);
      (first || root).focus?.({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key === 'Tab') {
        const root = containerRef?.current;
        if (!root) return;
        const items = Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      const idx = stack.indexOf(id);
      if (idx > -1) stack.splice(idx, 1);
      if (!stack.length) document.body.style.overflow = '';
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
}
