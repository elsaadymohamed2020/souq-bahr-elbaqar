import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  CornerDownLeft,
  History,
  Layers,
  LayoutDashboard,
  Search,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { useApp, DEFAULT_FILTERS } from '../../context/AppContext';
import { useOverlay } from '../../lib/useOverlay';
import { matchesQuery } from '../../lib/text';
import { scrollToId } from '../../lib/hooks';
import { iconFor } from './icons';
import { StatusBadge, Kbd } from '../ui';
import { cn } from '../../lib/cn';

const RECENT_KEY = 'bb_recent_search';
const POPULAR = ['تلاجة', 'غسالة', 'موتور', 'مكينة لحام', 'كمبروسر', 'لوط مطبخ'];
const ADMIN_PAGES = [
  { id: 'home', label: 'الرئيسية والأرقام' },
  { id: 'inbox', label: 'الرسايل الموحدة' },
  { id: 'products', label: 'المنتجات والمعروض' },
  { id: 'deals', label: 'الصفقات واللوطات' },
  { id: 'offers', label: 'العروض والخصومات' },
  { id: 'crm', label: 'العملاء' },
  { id: 'erp', label: 'الحسابات والمخزن' },
];

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveRecent(q) {
  try {
    const next = [q, ...readRecent().filter((x) => x !== q)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function SearchOverlay() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    deals,
    customers,
    categoryPresets,
    viewMode,
    setViewMode,
    setAdminTab,
    setSelectedCustomer,
    setSelectedDealForDetail,
    openQuickView,
    setCatalogFilters,
    applyCategoryPreset,
    getFinalPrice,
    formatPrice,
    recentlyViewed,
  } = useApp();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState([]);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const reduce = useReducedMotion();
  const close = () => setIsSearchOpen(false);
  useOverlay(isSearchOpen, close, panelRef, { initialFocus: false });

  useEffect(() => {
    if (isSearchOpen) {
      setQ('');
      setActive(0);
      setRecent(readRecent());
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isSearchOpen]);

  const groups = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    const out = [];
    const presets = categoryPresets.filter((p) => p.id !== 'all' && matchesQuery(p.label, query)).slice(0, 3);
    if (presets.length) out.push({ id: 'cats', title: 'أقسام', items: presets.map((p) => ({ kind: 'preset', key: `p-${p.id}`, data: p })) });
    // Name and code matches first, then matches that only hit the description
    const prods = products
      .filter((p) => matchesQuery(`${p.name} ${p.code} ${p.branch} ${p.condition || ''}`, query))
      .sort((a, b) => Number(!matchesQuery(`${a.name} ${a.code}`, query)) - Number(!matchesQuery(`${b.name} ${b.code}`, query)))
      .slice(0, 6);
    if (prods.length) out.push({ id: 'prods', title: 'منتجات', items: prods.map((p) => ({ kind: 'product', key: p.code, data: p })) });
    const ds = deals.filter((d) => matchesQuery(`${d.title} ${d.code} ${d.category} ${d.desc || ''}`, query)).slice(0, 3);
    if (ds.length) out.push({ id: 'deals', title: 'صفقات ولوطات', items: ds.map((d) => ({ kind: 'deal', key: d.code, data: d })) });
    if (viewMode === 'admin') {
      const pages = ADMIN_PAGES.filter((p) => matchesQuery(p.label, query)).slice(0, 3);
      if (pages.length) out.push({ id: 'pages', title: 'صفحات اللوحة', items: pages.map((p) => ({ kind: 'page', key: `a-${p.id}`, data: p })) });
      const cs = customers.filter((c) => matchesQuery(`${c.name} ${c.phone || ''} ${c.want || ''} ${c.gov || ''}`, query)).slice(0, 4);
      if (cs.length) out.push({ id: 'cust', title: 'عملاء', items: cs.map((c) => ({ kind: 'customer', key: c.id, data: c })) });
    }
    return out;
  }, [q, products, deals, customers, categoryPresets, viewMode]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const goStore = (fn) => {
    if (viewMode !== 'store') setViewMode('store');
    close();
    setTimeout(fn, viewMode !== 'store' ? 120 : 40);
  };

  const searchCatalog = (text) => {
    const query = text.trim();
    if (!query) return;
    saveRecent(query);
    goStore(() => {
      setCatalogFilters({ ...DEFAULT_FILTERS, q: query, preset: 'search' });
      scrollToId('items');
    });
  };

  const choose = (item) => {
    if (!item) {
      searchCatalog(q);
      return;
    }
    if (q.trim()) saveRecent(q.trim());
    if (item.kind === 'product') goStore(() => openQuickView(item.data.code));
    else if (item.kind === 'deal') {
      close();
      setSelectedDealForDetail(item.data);
    } else if (item.kind === 'preset')
      goStore(() => {
        if (item.data.section) scrollToId(item.data.section);
        else {
          applyCategoryPreset(item.data.id);
          scrollToId('items');
        }
      });
    else if (item.kind === 'page') {
      setAdminTab(item.data.id);
      close();
    } else if (item.kind === 'customer') {
      close();
      setSelectedCustomer(item.data);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(flat[active]);
    }
  };

  const recentProducts = recentlyViewed.map((c) => products.find((p) => p.code === c)).filter(Boolean).slice(0, 4);
  let idx = -1;

  return createPortal(
    <AnimatePresence>
      {isSearchOpen ? (
        <div className="fixed inset-0 z-[80] flex justify-center sm:items-start sm:px-4 sm:pt-[9vh]" role="presentation">
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="البحث في المعروض"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14 } }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full w-full flex-col overflow-hidden bg-surface shadow-soft-lg sm:h-auto sm:max-h-[78vh] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-line"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-3 sm:px-4">
              <button type="button" onClick={close} aria-label="رجوع" className="flex h-10 w-10 items-center justify-center rounded-xl text-fg-muted hover:bg-surface-2 sm:hidden">
                <ArrowRight className="h-5 w-5" />
              </button>
              <Search className="hidden h-5 w-5 shrink-0 text-amber-600 sm:block" aria-hidden="true" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                type="search"
                enterKeyHint="search"
                placeholder={viewMode === 'admin' ? 'دوّر على قطعة، صفقة، عميل، أو صفحة...' : 'دوّر على تلاجة، موتور، مكينة لحام...'}
                aria-label="اكتب كلمة البحث"
                aria-controls="search-results"
                aria-activedescendant={flat[active] ? `sr-${flat[active].key}` : undefined}
                className="h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-fg placeholder:font-normal placeholder:text-fg-subtle focus:outline-none"
              />
              {q ? (
                <button type="button" onClick={() => setQ('')} aria-label="امسح" className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-subtle hover:bg-surface-2 hover:text-fg">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <span className="hidden sm:block">
                <Kbd>Esc</Kbd>
              </span>
            </div>

            <div ref={listRef} id="search-results" role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
              {!q.trim() ? (
                <div className="space-y-5 p-2">
                  {recent.length ? (
                    <section>
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-fg-subtle">
                        <History className="h-3.5 w-3.5" aria-hidden="true" /> دورت عليها قبل كده
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button key={r} type="button" onClick={() => setQ(r)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-semibold text-fg hover:bg-surface-2">
                            <Clock3 className="h-3.5 w-3.5 text-fg-subtle" aria-hidden="true" />
                            {r}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-fg-subtle">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> الناس بتدور على
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR.map((r) => (
                        <button key={r} type="button" onClick={() => setQ(r)} className="h-9 rounded-full bg-surface-2 px-3.5 text-sm font-bold text-fg transition-colors hover:bg-amber-500/15">
                          {r}
                        </button>
                      ))}
                    </div>
                  </section>
                  {recentProducts.length ? (
                    <section>
                      <h3 className="mb-2 text-xs font-bold text-fg-subtle">شفتها قريب</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {recentProducts.map((p) => (
                          <button key={p.code} type="button" onClick={() => choose({ kind: 'product', data: p })} className="rounded-2xl border border-line p-2 text-right transition-colors hover:border-line-strong hover:bg-surface-2">
                            {p.img ? <img src={p.img} alt="" width="160" height="120" className="aspect-[4/3] w-full rounded-xl object-cover" /> : null}
                            <span className="mt-1.5 line-clamp-1 block text-xs font-bold text-fg">{p.name}</span>
                            <span className="num text-xs font-black text-fg-muted">{formatPrice(getFinalPrice(p))} ج</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : flat.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="font-heading text-base font-black text-fg">مفيش نتايج لـ "{q}"</p>
                  <p className="mt-1 text-sm text-fg-muted">جرّب كلمة تانية، أو ابعت لنا على الواتساب ونقولك لو هتوصل قريب.</p>
                </div>
              ) : (
                groups.map((g) => (
                  <div key={g.id} className="mb-2">
                    <h3 className="px-3 pb-1 pt-2 text-[11px] font-bold text-fg-subtle">{g.title}</h3>
                    <ul>
                      {g.items.map((item) => {
                        idx += 1;
                        const my = idx;
                        const isActive = my === active;
                        return (
                          <li key={item.key}>
                            <button
                              type="button"
                              id={`sr-${item.key}`}
                              role="option"
                              aria-selected={isActive}
                              data-idx={my}
                              onMouseMove={() => setActive(my)}
                              onClick={() => choose(item)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-colors',
                                isActive ? 'bg-surface-2' : 'hover:bg-surface-2'
                              )}
                            >
                              <ResultIcon item={item} />
                              <ResultBody item={item} getFinalPrice={getFinalPrice} formatPrice={formatPrice} />
                              {isActive ? <CornerDownLeft className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" /> : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {q.trim() ? (
              <div className="shrink-0 border-t border-line px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:p-3">
                <button
                  type="button"
                  onClick={() => searchCatalog(q)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink font-heading text-sm font-black text-white transition-colors hover:bg-ink-700 dark:bg-white dark:text-ink"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  اعرض كل النتايج لـ "{q.trim()}"
                </button>
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

function ResultIcon({ item }) {
  if (item.kind === 'product' || item.kind === 'deal') {
    const img = item.data.img;
    if (img) return <img src={img} alt="" width="48" height="48" className="h-12 w-12 shrink-0 rounded-xl object-cover" />;
  }
  let Icon = Layers;
  if (item.kind === 'preset') Icon = iconFor(item.data.icon);
  if (item.kind === 'page') Icon = LayoutDashboard;
  if (item.kind === 'customer') Icon = User;
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg-muted">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

function ResultBody({ item, getFinalPrice, formatPrice }) {
  const d = item.data;
  if (item.kind === 'product') {
    const final = getFinalPrice(d);
    return (
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 block text-sm font-bold text-fg">{d.name}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
          <span className="num font-heading font-black text-fg">{formatPrice(final)} ج</span>
          {final < d.price ? <span className="num text-fg-subtle line-through">{formatPrice(d.price)}</span> : null}
          <span>فرع {d.branch}</span>
          <StatusBadge status={d.status} size="xs" />
        </span>
      </span>
    );
  }
  if (item.kind === 'deal') {
    return (
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 block text-sm font-bold text-fg">{d.title}</span>
        <span className="num mt-0.5 block text-xs text-fg-muted">Total بـ {formatPrice(d.totalPrice)} ج · {d.code}</span>
      </span>
    );
  }
  if (item.kind === 'customer') {
    return (
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-fg">{d.name}</span>
        <span className="line-clamp-1 block text-xs text-fg-muted">{d.want}</span>
      </span>
    );
  }
  return <span className="min-w-0 flex-1 text-sm font-bold text-fg">{d.label}</span>;
}
