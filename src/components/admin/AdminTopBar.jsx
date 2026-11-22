import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bell, BellOff, Moon, Search, Store, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, Kbd } from '../ui';
import { cn } from '../../lib/cn';
import { ActivityIcon, getTab, isFresh } from './adminShared';

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '');

export function LogoTile({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-heading text-lg font-black text-amber-400 shadow-soft-sm ring-1 ring-white/10',
        className
      )}
    >
      ب
    </span>
  );
}

function NotificationBell() {
  const { activities, setAdminTab } = useApp();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => new Set());
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  const fresh = activities.filter(isFresh);
  const unseen = fresh.filter((a) => !seen.has(a.id)).length;

  useEffect(() => {
    if (!open) return;
    setSeen((prev) => {
      const next = new Set(prev);
      activities.filter(isFresh).forEach((a) => next.add(a.id));
      return next;
    });
  }, [open, activities]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="sm:relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        aria-label={unseen ? `الإشعارات، ${unseen} جديد` : 'الإشعارات'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className={cn('relative', open && 'bg-surface-2 text-fg')}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unseen ? (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black leading-none text-ink ring-2 ring-surface">
            <span className="num">{unseen}</span>
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="الإشعارات"
            initial={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface text-right shadow-soft-lg sm:inset-x-auto sm:left-0 sm:w-[380px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 className="font-heading text-sm font-black text-fg">الإشعارات</h2>
              <span className="num text-xs font-bold text-fg-subtle">{fresh.length ? `${fresh.length} جديد` : 'مفيش جديد'}</span>
            </div>
            {activities.length ? (
              <ul className="max-h-[min(60vh,420px)] divide-y divide-line overflow-y-auto overscroll-contain">
                {activities.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                    <ActivityIcon activity={a} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug text-fg">{a.title}</p>
                      <p className="mt-0.5 text-xs text-fg-subtle">
                        {a.time} · {a.branch}
                      </p>
                    </div>
                    {isFresh(a) ? (
                      <span className="mt-1.5 inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                        جديد
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <BellOff className="h-6 w-6 text-fg-subtle" aria-hidden="true" />
                <p className="text-sm font-bold text-fg">مفيش إشعارات لسه</p>
              </div>
            )}
            <div className="border-t border-line p-2">
              <Button
                variant="ghost"
                size="sm"
                block
                className="h-10"
                onClick={() => {
                  setOpen(false);
                  setAdminTab('home');
                }}
              >
                شوف كل النشاط في الرئيسية
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useApp();
  const reduce = useReducedMotion();
  const dark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="الوضع الليلي"
      aria-pressed={dark}
      title={dark ? 'رجّع الوضع النهاري' : 'شغّل الوضع الليلي'}
      className={className}
    >
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: reduce ? 0 : -70 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: reduce ? 0 : 70 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
        </motion.span>
    </Button>
  );
}

export default function AdminTopBar() {
  const { adminTab, setIsSearchOpen, setViewMode } = useApp();
  const reduce = useReducedMotion();
  const tab = getTab(adminTab);
  const mac = isMac();

  // Ctrl/Cmd + K opens the global search while the admin is on screen
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        if (e.defaultPrevented) return;
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIsSearchOpen]);

  return (
    <header className="glass-header sticky top-10 z-40 border-b border-line">
      <div className="flex h-16 items-center gap-1.5 px-4 sm:gap-2 sm:px-6 lg:px-8">
        <LogoTile className="h-9 w-9 text-base lg:hidden" />
        <div className="min-w-0 flex-1 ps-1 lg:ps-0">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: reduce ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -4 }}
              transition={{ duration: 0.16 }}
            >
              <h1 className="truncate font-heading text-base font-black leading-tight text-fg sm:text-lg">{tab.title}</h1>
              <p className="hidden truncate text-xs text-fg-muted sm:block">{tab.subtitle}</p>
            </motion.div>
        </div>

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="بحث"
          aria-keyshortcuts={mac ? 'Meta+K' : 'Control+K'}
          className="hidden h-10 w-60 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 text-sm text-fg-subtle transition-[border-color,color,transform] duration-150 hover:border-line-strong hover:text-fg active:scale-[0.98] md:flex xl:w-80"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate text-right">دوّر على قطعة أو عميل</span>
          <span className="flex items-center gap-0.5" dir="ltr" aria-hidden="true">
            <Kbd>{mac ? 'Cmd' : 'Ctrl'}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="بحث" onClick={() => setIsSearchOpen(true)}>
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>

        <NotificationBell />
        <ThemeToggle />

        <Button variant="dark" size="sm" className="hidden h-10 md:inline-flex" onClick={() => setViewMode('store')}>
          <Store className="h-4 w-4" aria-hidden="true" />
          معاينة المتجر
        </Button>
      </div>
    </header>
  );
}
