import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Hand, Wand2, X } from 'lucide-react';
import { useTour } from '../../context/TourContext';
import { useMediaQuery } from '../../lib/hooks';
import ProblemIntro from './ProblemIntro';
import TourFinale from './TourFinale';
import { cn } from '../../lib/cn';

const PAD = 8;

function findVisible(id) {
  if (!id) return null;
  const els = document.querySelectorAll(`[data-tour="${id}"]`);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/** Finds the step target, scrolls it into a good spot, and tracks its rect every frame. */
function useTargetRect(targetId, { inModal, noScroll, isPhone, stepKey }) {
  const [rect, setRect] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setRect(null);
    setMissing(false);
    if (!targetId) return undefined;
    let raf;
    let poll;
    let el = null;
    let tries = 0;
    let last = '';

    const track = () => {
      if (!el || !el.isConnected) el = findVisible(targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        const key = `${Math.round(r.top)}|${Math.round(r.left)}|${Math.round(r.width)}|${Math.round(r.height)}`;
        if (key !== last) {
          last = key;
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
      raf = requestAnimationFrame(track);
    };

    const place = (node) => {
      if (noScroll) return;
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (inModal) {
        node.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
        return;
      }
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 150;
      // Phones: keep the target between the sticky header and the docked tour card.
      const areaTop = headerH + 8;
      const areaBottom = isPhone ? vh - 250 : vh - 24;
      const areaH = Math.max(120, areaBottom - areaTop);
      const offset = r.height >= areaH ? areaTop : areaTop + (areaH - r.height) / 2;
      window.scrollTo({ top: Math.max(0, window.scrollY + r.top - offset), behavior: smooth ? 'smooth' : 'auto' });
    };

    poll = setInterval(() => {
      tries += 1;
      const node = findVisible(targetId);
      if (node) {
        clearInterval(poll);
        el = node;
        place(node);
        track();
      } else if (tries > 50) {
        clearInterval(poll);
        setMissing(true);
      }
    }, 100);

    return () => {
      clearInterval(poll);
      cancelAnimationFrame(raf);
    };
  }, [targetId, stepKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { rect, missing };
}

export default function TourOverlay() {
  const tour = useTour();
  const { active, step, index, total, next, prev, stop, tourState } = tour;
  const isPhone = useMediaQuery('(max-width: 639px)');
  const reduce = useReducedMotion();
  const cardRef = useRef(null);
  const [cardH, setCardH] = useState(220);

  const targetId = step && !step.component ? (typeof step.target === 'function' ? step.target(tourState) : step.target) : null;
  const { rect, missing } = useTargetRect(targetId, { inModal: step?.inModal, noScroll: step?.noScroll, isPhone, stepKey: index });

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  });

  const phoneDockTop = Boolean(isPhone && rect && rect.top + rect.height / 2 > window.innerHeight * 0.55);
  const { setDock } = tour;
  useEffect(() => {
    setDock(phoneDockTop ? 'top' : 'bottom');
  }, [phoneDockTop, setDock]);

  // Keyboard: Esc ends, arrows move (RTL: left = forward). Capture phase so open modals don't also react.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        stop();
      } else if (!step?.waitFor && !step?.component) {
        const tag = (e.target?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (e.key === 'ArrowLeft') next();
        if (e.key === 'ArrowRight') prev();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [active, step, next, prev, stop]);

  useEffect(() => {
    if (active && cardRef.current) cardRef.current.focus({ preventScroll: true });
  }, [active, index]);

  if (!active || !step) return null;

  if (step.component === 'intro') return createPortal(<ProblemIntro onStart={next} onSkip={stop} />, document.body);
  if (step.component === 'finale') return createPortal(<TourFinale />, document.body);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const hole = rect
    ? {
        top: Math.max(0, rect.top - PAD),
        left: Math.max(0, rect.left - PAD),
        width: Math.min(vw, rect.width + PAD * 2),
        height: rect.height + PAD * 2,
      }
    : null;

  // Card placement
  let cardStyle = {};
  let dockTop = false;
  if (isPhone) {
    dockTop = phoneDockTop;
  } else if (hole) {
    const w = 380;
    const below = hole.top + hole.height + 14;
    const above = hole.top - 14 - cardH;
    let top;
    if (below + cardH < vh - 12) top = below;
    else if (above > 52) top = above;
    else top = Math.min(vh - cardH - 16, Math.max(56, hole.top + 16));
    const centerX = hole.left + hole.width / 2;
    const left = Math.min(vw - w - 16, Math.max(16, centerX - w / 2));
    cardStyle = { top, left, width: w };
  } else {
    cardStyle = { top: vh / 2 - cardH / 2, left: vw / 2 - 190, width: 380 };
  }

  const blockers = hole
    ? [
        { top: 0, left: 0, width: '100%', height: hole.top },
        { top: hole.top + hole.height, left: 0, width: '100%', bottom: 0 },
        { top: hole.top, left: 0, width: hole.left, height: hole.height },
        { top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height },
      ]
    : [{ inset: 0 }];

  const waiting = Boolean(step.waitFor);

  return createPortal(
    <div className="tour-root" aria-live="polite">
      {/* Click blockers around the spotlight */}
      {blockers.map((b, i) => (
        <div key={i} className="fixed z-[90]" style={b} onClick={(e) => e.stopPropagation()} aria-hidden="true" />
      ))}
      {/* Block the hole too unless the step expects a click there */}
      {hole && !step.interactive ? <div className="fixed z-[90]" style={hole} aria-hidden="true" /> : null}

      {/* Dim with a rounded hole (SVG mask: huge box-shadows fail to paint over composited modals) */}
      <svg className="pointer-events-none fixed inset-0 z-[91] h-full w-full" aria-hidden="true">
        <defs>
          <mask id="tour-hole-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {hole ? (
              <rect
                rx="16"
                fill="black"
                style={{
                  x: hole.left,
                  y: hole.top,
                  width: hole.width,
                  height: hole.height,
                  transition: reduce ? 'none' : 'x 320ms cubic-bezier(.16,1,.3,1), y 320ms cubic-bezier(.16,1,.3,1), width 320ms cubic-bezier(.16,1,.3,1), height 320ms cubic-bezier(.16,1,.3,1)',
                }}
              />
            ) : null}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="#070D1C" fillOpacity="0.7" mask="url(#tour-hole-mask)" />
      </svg>
      {hole ? (
        <motion.div
          className="pointer-events-none fixed z-[92] rounded-2xl"
          initial={false}
          animate={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
          transition={reduce ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{ outline: '3px solid #F59E0B', outlineOffset: '0px' }}
          aria-hidden="true"
        >
          {step.interactive ? <span className="absolute -inset-1 animate-pulse-ring rounded-2xl border-2 border-amber-400" /> : null}
        </motion.div>
      ) : null}

      {/* Step card */}
        <motion.div
          key={step.id}
          ref={cardRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="tour-title"
          tabIndex={-1}
          initial={{ opacity: 0, y: reduce ? 0 : isPhone ? (dockTop ? -16 : 16) : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'fixed z-[95] bg-surface text-fg shadow-soft-lg outline-none',
            isPhone
              ? cn('inset-x-2 rounded-3xl border border-line p-4', dockTop ? 'top-12' : 'bottom-[max(0.5rem,env(safe-area-inset-bottom))]')
              : 'rounded-3xl border border-line p-5'
          )}
          style={isPhone ? undefined : cardStyle}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="num rounded-full bg-amber-500 px-2.5 py-1 font-heading text-[11px] font-black text-ink">
                {index} من {total - 2}
              </span>
              {step.interactive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Hand className="h-3.5 w-3.5" aria-hidden="true" />
                  دورك
                </span>
              ) : null}
            </div>
            <button type="button" onClick={stop} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold text-fg-subtle hover:bg-surface-2 hover:text-fg">
              إنهاء الجولة
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            <motion.div className="h-full rounded-full bg-amber-500" initial={false} animate={{ width: `${(index / (total - 2)) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>

          <h2 id="tour-title" className="font-heading text-lg font-black leading-snug text-fg">
            {step.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{step.body}</p>
          {missing ? <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400">العنصر ده مش ظاهر دلوقتي، كمّل للخطوة اللي بعدها.</p> : null}

          <div className="mt-4 flex items-center gap-2">
            {index > 1 ? (
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 font-heading text-sm font-bold text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                رجوع
              </button>
            ) : null}
            <div className="mr-auto flex items-center gap-2">
              {waiting ? (
                <>
                  <span className="hidden text-xs font-bold text-amber-700 dark:text-amber-400 sm:inline">دوس على الزرار المنوّر</span>
                  <button
                    type="button"
                    onClick={() => (step.autoAction ? step.autoAction() : next())}
                    className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-line px-3.5 font-heading text-sm font-black text-fg transition-colors hover:bg-surface-2"
                  >
                    <Wand2 className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    اعملها بدالي
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-amber-500 px-5 font-heading text-sm font-black text-ink shadow-[0_6px_16px_-8px_rgba(245,158,11,0.8)] transition-[background-color,transform] hover:bg-amber-400 active:scale-[0.97]"
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
    </div>,
    document.body
  );
}
