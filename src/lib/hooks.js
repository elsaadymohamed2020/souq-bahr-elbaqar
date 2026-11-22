import { useEffect, useRef, useState } from 'react';

/** Subscribe to a CSS media query. */
export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsMobile = () => useMediaQuery('(max-width: 639px)');

/** 'up' | 'down', with a small threshold so tiny scrolls do not flicker. */
export function useScrollDirection(threshold = 8) {
  const [dir, setDir] = useState('up');
  const [atTop, setAtTop] = useState(true);
  const last = useRef(0);
  useEffect(() => {
    last.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setAtTop(y < 24);
        if (Math.abs(y - last.current) > threshold) {
          setDir(y > last.current ? 'down' : 'up');
          last.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return { dir, atTop };
}

/** Which section id is currently in view. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/** Current time in Cairo, refreshed every 30s. Returns { hour, minute, minutesOfDay }. */
export function useCairoClock() {
  const read = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
        timeZone: 'Africa/Cairo',
      }).formatToParts(new Date());
      const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0);
      const minute = Number(parts.find((p) => p.type === 'minute')?.value || 0);
      return { hour, minute, minutesOfDay: hour * 60 + minute };
    } catch {
      const d = new Date();
      return { hour: d.getHours(), minute: d.getMinutes(), minutesOfDay: d.getHours() * 60 + d.getMinutes() };
    }
  };
  const [now, setNow] = useState(read);
  useEffect(() => {
    const t = setInterval(() => setNow(read()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** Scroll to an element id, accounting for the sticky header. */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
