import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Heart, MapPin, Moon, Phone, Search, ShieldCheck, ShoppingCart, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useScrollDirection, scrollToId } from '../../lib/hooks';
import { iconFor } from '../client/icons';
import { Kbd } from '../ui';
import { cn } from '../../lib/cn';

function LogoMark({ className }) {
  return (
    <span
      className={cn(
        'relative flex shrink-0 select-none items-center justify-center rounded-2xl bg-ink font-heading font-black text-amber-400 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.35)] dark:bg-ink-800',
        className
      )}
      aria-hidden="true"
    >
      ب
      <span className="absolute bottom-1.5 h-[3px] w-5 rounded-full bg-amber-400" />
    </span>
  );
}

const BRANCH_OPTIONS = [
  { id: 'all', label: 'كل الفروع' },
  { id: 'بحر البقر', label: 'بحر البقر' },
  { id: 'الصالحية', label: 'الصالحية الجديدة' },
];

function BranchPicker() {
  const { catalogFilters, updateCatalogFilters } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const current = BRANCH_OPTIONS.find((b) => b.id === catalogFilters.branch) || BRANCH_OPTIONS[0];
  return (
    <div ref={ref} className="relative hidden xl:block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-xl px-2.5 text-right transition-colors hover:bg-surface-2"
      >
        <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span className="leading-tight">
          <span className="block text-[10px] font-semibold text-fg-subtle">بتتسوق من</span>
          <span className="flex items-center gap-1 font-heading text-xs font-black text-fg">
            {current.label}
            <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" aria-hidden="true" />
          </span>
        </span>
      </button>
      {open ? (
        <ul role="listbox" aria-label="اختار الفرع" className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-line bg-surface p-1.5 shadow-soft-lg">
          {BRANCH_OPTIONS.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                role="option"
                aria-selected={b.id === current.id}
                onClick={() => {
                  updateCatalogFilters({ branch: b.id });
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-fg transition-colors hover:bg-surface-2"
              >
                {b.label}
                {b.id === current.id ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SearchTrigger({ className, compact }) {
  const { setIsSearchOpen, catalogFilters } = useApp();
  return (
    <button
      type="button"
      data-tour="store-search"
      onClick={() => setIsSearchOpen(true)}
      className={cn(
        'group flex h-11 w-full min-w-0 items-center gap-2.5 rounded-xl border-2 border-amber-500 bg-surface pr-3 text-right text-sm transition-[box-shadow] hover:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]',
        className
      )}
    >
      <Search className="h-[18px] w-[18px] shrink-0 text-fg-subtle" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-fg-subtle">
        {catalogFilters.q ? <span className="text-fg">{catalogFilters.q}</span> : compact ? 'دوّر على تلاجة، موتور، لوط...' : 'دوّر على أي حاجة: تلاجة، غسالة، موتور مية، مكينة لحام...'}
      </span>
      <span className="hidden shrink-0 items-center gap-1 pl-2 lg:flex" aria-hidden="true">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </span>
      <span className="flex h-full shrink-0 items-center rounded-l-[9px] bg-amber-500 px-3.5 text-ink transition-colors group-hover:bg-amber-400">
        <Search className="h-[18px] w-[18px]" aria-hidden="true" />
        <span className="sr-only">بحث</span>
      </span>
    </button>
  );
}

function CartButton() {
  const { cartCount, cartTotal, setIsCartOpen, formatPrice, cartBump } = useApp();
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      aria-label={`عربة التسوق، فيها ${cartCount} قطعة`}
      data-tour="store-cart"
      className="relative flex h-11 shrink-0 items-center gap-2 rounded-xl px-2 transition-colors hover:bg-surface-2 active:scale-[0.97]"
    >
      <motion.span
        key={cartBump}
        initial={reduce || !cartBump ? false : { scale: 1 }}
        animate={reduce || !cartBump ? undefined : { scale: [1, 1.22, 1] }}
        transition={{ duration: 0.45 }}
        className="relative flex"
      >
        <ShoppingCart className="h-6 w-6 text-fg" aria-hidden="true" />
        <span
          className={cn(
            'num absolute -right-2 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 font-heading text-[11px] font-black',
            cartCount ? 'bg-amber-500 text-ink' : 'bg-surface-3 text-fg-muted'
          )}
        >
          {cartCount}
        </span>
      </motion.span>
      <span className="hidden flex-col text-right leading-tight sm:flex">
        <span className="text-[10px] font-semibold text-fg-subtle">السلة</span>
        <span className="num font-heading text-xs font-black text-fg">{cartCount ? `${formatPrice(cartTotal)} ج` : 'فاضية'}</span>
      </span>
    </button>
  );
}

function CategoryStrip({ hidden }) {
  const { categoryPresets, catalogFilters, applyCategoryPreset } = useApp();
  const onPick = (preset) => {
    if (preset.section) {
      scrollToId(preset.section);
      return;
    }
    applyCategoryPreset(preset.id);
    scrollToId('items');
  };
  return (
    <nav
      aria-label="الأقسام"
      data-tour="store-categories"
      className={cn(
        'pointer-events-auto relative z-0 border-b border-line bg-surface/95 backdrop-blur transition-transform duration-300 ease-out dark:bg-surface/90',
        hidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="no-scrollbar mx-auto flex h-12 max-w-7xl items-center gap-1 overflow-x-auto px-3 sm:px-6">
        {categoryPresets.map((p) => {
          const Icon = iconFor(p.icon);
          const active = !p.section && catalogFilters.preset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p)}
              aria-pressed={p.section ? undefined : active}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 font-heading text-[13px] font-bold transition-colors',
                p.accent
                  ? 'bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 dark:text-amber-300'
                  : active
                  ? 'bg-ink text-white dark:bg-white dark:text-ink'
                  : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {p.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function Navbar() {
  const { theme, toggleTheme, wishlist, setIsSearchOpen, isOpenNow, setCatalogFilters } = useApp();
  const { dir, atTop } = useScrollDirection(10);
  const hideStrip = dir === 'down' && !atTop;

  // Global search shortcut: Ctrl/Cmd + K or "/"
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIsSearchOpen]);

  return (
    <header className="pointer-events-none sticky top-10 z-40">
      <div className="pointer-events-auto relative z-10 border-b border-line bg-surface shadow-soft-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
          {/* Logo */}
          <a href="#top" className="flex shrink-0 items-center gap-2.5 rounded-2xl" aria-label="سوق بحر البقر الكبير، الصفحة الرئيسية" onClick={() => window.scrollTo({ top: 0 })}>
            <LogoMark className="h-10 w-10 text-xl sm:h-11 sm:w-11 sm:text-2xl" />
            <span className="hidden leading-tight md:block">
              <span className="flex items-center gap-1.5">
                <span className="font-heading text-[17px] font-black text-fg">سوق بحر البقر الكبير</span>
                <ShieldCheck className="h-4 w-4 text-brand-blue" aria-label="الموقع الرسمي" />
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-fg-muted">
                <span className={cn('h-1.5 w-1.5 rounded-full', isOpenNow ? 'bg-emerald-500' : 'bg-red-500')} aria-hidden="true" />
                {isOpenNow ? 'مفتوح دلوقتي لحد 5 المغرب' : 'مقفول دلوقتي، بنفتح 9 الصبح'}
              </span>
            </span>
          </a>

          {/* Search */}
          <div className="min-w-0 flex-1 md:mx-2 lg:mx-4">
            <SearchTrigger className="md:hidden" compact />
            <SearchTrigger className="hidden md:flex" />
          </div>

          <BranchPicker />

          <a
            href="tel:01034052401"
            className="hidden h-11 shrink-0 items-center gap-2 rounded-xl px-2.5 transition-colors hover:bg-surface-2 lg:flex"
          >
            <Phone className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold text-fg-subtle">اتصل بينا</span>
              <span className="num block font-heading text-xs font-black text-fg" dir="ltr">
                010 3405 2401
              </span>
            </span>
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg sm:flex"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setCatalogFilters((prev) => ({ ...prev, wishlistOnly: true, preset: 'wishlist' }));
              scrollToId('items');
            }}
            aria-label={`المفضلة (${wishlist.length})`}
            className="relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg sm:flex"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            {wishlist.length ? (
              <span className="num absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            ) : null}
          </button>

          <CartButton />
        </div>
      </div>
      <CategoryStrip hidden={hideStrip} />
    </header>
  );
}
