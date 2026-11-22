import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BadgeCheck,
  Banknote,
  Bell,
  Bot,
  Coins,
  Eye,
  Globe,
  Hourglass,
  Layers,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  Package,
  Search,
  Tag,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '../common/BrandIcons';
import { useApp } from '../../context/AppContext';
import { useMediaQuery } from '../../lib/hooks';
import { Badge, Button, Card, inputClass } from '../ui';
import { cn } from '../../lib/cn';

/* ------------------------------------------------------------------
   Navigation config (sidebar, top bar, mobile nav share it)
------------------------------------------------------------------- */
export const ADMIN_TABS = [
  { id: 'home', label: 'الرئيسية', title: 'الرئيسية', subtitle: 'ملخص شغل المحل النهارده', icon: LayoutDashboard, group: 'shop' },
  { id: 'inbox', label: 'الرسايل', title: 'الرسايل', subtitle: 'واتساب وفيسبوك وماسنجر وإنستجرام في مكان واحد', icon: MessageSquare, group: 'shop' },
  { id: 'products', label: 'المنتجات', title: 'المنتجات', subtitle: 'أي تعديل هنا بيظهر على الموقع على طول', icon: Package, group: 'shop' },
  { id: 'deals', label: 'الصفقات', title: 'الصفقات واللوطات', subtitle: 'شروات المصانع اللي بتتباع على بعضها', icon: Layers, group: 'shop', desc: 'اللوطات والشروات الكبيرة' },
  { id: 'offers', label: 'العروض', title: 'العروض', subtitle: 'شغّل خصم في ثانية والأسعار تتحدث لوحدها', icon: Tag, group: 'money', desc: 'الخصومات الشغالة على الموقع' },
  { id: 'crm', label: 'العملاء', title: 'العملاء', subtitle: 'كل عميل كلمك، عايز إيه، ووصل لفين', icon: Users, group: 'money' },
  { id: 'erp', label: 'الحسابات', title: 'الحسابات', subtitle: 'المبيعات والأرباح والمخزن لكل فرع', icon: Coins, group: 'money', desc: 'المبيعات والأرباح والمخزن' },
];

export const NAV_GROUPS = [
  { id: 'shop', label: 'شغل المحل' },
  { id: 'money', label: 'البيع والفلوس' },
];

export const getTab = (id) => ADMIN_TABS.find((t) => t.id === id) || ADMIN_TABS[0];

/** True on mouse/trackpad devices. Used to autofocus inputs without popping the phone keyboard. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');

/** One-shot intent so the inbox opens straight on the thread (used by "افتح المحادثة"). */
export const inboxIntent = { openThread: false };

/* ------------------------------------------------------------------
   Channels & customer stages
------------------------------------------------------------------- */
export const CHANNELS = {
  wa: { id: 'wa', label: 'واتساب', icon: WhatsAppIcon, color: '#10B981', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  fb: { id: 'fb', label: 'فيسبوك', icon: FacebookIcon, color: '#1F6FEB', tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  ms: { id: 'ms', label: 'ماسنجر', icon: MessageCircle, color: '#0EA5E9', tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  ig: { id: 'ig', label: 'إنستجرام', icon: InstagramIcon, color: '#E1306C', tone: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300' },
  web: { id: 'web', label: 'الموقع', icon: Globe, color: '#8B5CF6', tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
};
export const getChannel = (id) => CHANNELS[id] || CHANNELS.web;

export const SEGMENTS = [
  { id: 'new', label: 'جديد', long: 'عميل جديد', tone: 'blue', icon: UserPlus, hint: 'لسه أول مرة يكلمك' },
  { id: 'int', label: 'مهتم', long: 'مهتم', tone: 'amber', icon: Eye, hint: 'سأل على قطعة أو حجز' },
  { id: 'wait', label: 'مستني قطعة', long: 'مستني قطعة', tone: 'purple', icon: Hourglass, hint: 'هيشتري أول ما القطعة تنزل' },
  { id: 'buy', label: 'اشترى', long: 'اشترى قبل كده', tone: 'emerald', icon: BadgeCheck, hint: 'عميل اشترى منك' },
];
export const SEGMENT_MAP = Object.fromEntries(SEGMENTS.map((s) => [s.id, s]));

export function SegmentBadge({ seg, size = 'xs', className }) {
  const s = SEGMENT_MAP[seg] || SEGMENTS[0];
  return (
    <Badge tone={s.tone} icon={s.icon} size={size} className={className}>
      {s.label}
    </Badge>
  );
}

/** Small round channel mark (icon + screen-reader label). */
export function ChannelMark({ ch, size = 'sm', className }) {
  const c = getChannel(ch);
  const Icon = c.icon;
  const dims = { xs: 'h-5 w-5', sm: 'h-6 w-6', md: 'h-8 w-8' }[size];
  const icon = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-4 w-4' }[size];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full', c.tone, dims, className)} title={c.label}>
      <Icon className={icon} aria-hidden="true" />
      <span className="sr-only">{c.label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------
   Layout helpers
------------------------------------------------------------------- */
export function Panel({ title, subtitle, actions, children, className, bodyClassName, as = 'section', ...props }) {
  return (
    <Card as={as} className={cn('flex min-w-0 flex-col', className)} {...props}>
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            <h2 className="font-heading text-base font-black text-fg sm:text-lg">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-fg-muted sm:text-sm">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn('flex-1 p-4 sm:p-5', bodyClassName)}>{children}</div>
    </Card>
  );
}

export function SearchField({ value, onChange, placeholder, label, className, size = 'md' }) {
  const id = useId();
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label || placeholder}
      </label>
      <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
      <input
        id={id}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, size === 'sm' ? 'h-10' : 'h-11', 'pl-10 pr-10')}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="امسح البحث"
          className="absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg active:scale-[0.97]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Trash button that asks "متأكد؟" in a small popover before calling onConfirm.
 * placement: 'top' | 'bottom'
 */
export function ConfirmDelete({ onConfirm, itemLabel = 'العنصر ده', placement = 'top', className }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const confirmRef = useRef(null);
  const triggerRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => setOpen(false), 6000);
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => confirmRef.current?.focus({ preventScroll: true }));
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn('relative shrink-0', className)}>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-label={`امسح ${itemLabel}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'text-fg-subtle hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400',
          open && 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
        )}
      >
        <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </Button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="alertdialog"
            aria-label={`تأكيد مسح ${itemLabel}`}
            initial={{ opacity: 0, y: reduce ? 0 : placement === 'top' ? 6 : -6, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute left-0 z-30 w-56 rounded-2xl border border-line bg-surface p-3 text-right shadow-soft-lg',
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            )}
          >
            <p className="font-heading text-sm font-black text-fg">متأكد؟</p>
            <p className="mt-0.5 text-xs text-fg-muted">هيتمسح {itemLabel} من الموقع.</p>
            <div className="mt-3 flex gap-2">
              <Button
                ref={confirmRef}
                variant="danger"
                size="sm"
                className="h-10 flex-1"
                onClick={() => {
                  setOpen(false);
                  onConfirm?.();
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                امسح
              </Button>
              <Button variant="secondary" size="sm" className="h-10 flex-1" onClick={() => setOpen(false)}>
                لا، سيبه
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Product / deal image with an icon fallback when the file is missing. */
export function Thumb({ src, alt = '', icon: Icon = Package, className, iconClassName }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <span className={cn('flex shrink-0 items-center justify-center overflow-hidden bg-surface-2 text-fg-subtle', className)}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <Icon className={cn('h-6 w-6', iconClassName)} aria-hidden="true" />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------
   Activity feed (bell + home timeline)
------------------------------------------------------------------- */
const ACTIVITY_TONES = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  purple: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
};
const ACTIVITY_ICONS = { wa: WhatsAppIcon, bot: Bot, cash: Banknote, box: Package };

export function ActivityIcon({ activity, className }) {
  const Icon = ACTIVITY_ICONS[activity.type] || Bell;
  return (
    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ACTIVITY_TONES[activity.color] || ACTIVITY_TONES.blue, className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

export const isFresh = (activity) => activity.time === 'الآن';

/* ------------------------------------------------------------------
   Charts
------------------------------------------------------------------- */
export function useChartColors() {
  const { theme } = useApp();
  const dark = theme === 'dark';
  return {
    dark,
    grid: dark ? '#1E2A45' : '#EDF0F5',
    axis: dark ? '#7C8BA8' : '#808DA5',
    cursor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(11,21,43,0.05)',
    surface: dark ? '#0D1528' : '#FFFFFF',
    blue: dark ? '#4C8DF6' : '#1F6FEB',
    amber: '#F59E0B',
    emerald: '#10B981',
    violet: '#8B5CF6',
  };
}

/* ------------------------------------------------------------------
   Dates (Cairo, latin digits)
------------------------------------------------------------------- */
const fmt = (opts) => {
  try {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', { timeZone: 'Africa/Cairo', ...opts });
  } catch (e) {
    return new Intl.DateTimeFormat('ar', opts);
  }
};
export const formatDayLong = (d) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(d);
export const formatWeekday = (d) => fmt({ weekday: 'long' }).format(d);
export const formatDayMonth = (d) => fmt({ day: 'numeric', month: 'long' }).format(d);
export const formatMonth = (d) => fmt({ month: 'long' }).format(d);
export const todayIso = () => new Date().toISOString().slice(0, 10);

export const sum = (arr, pick) => arr.reduce((acc, x) => acc + (Number(pick(x)) || 0), 0);

/* ------------------------------------------------------------------
   Offers
------------------------------------------------------------------- */
export const inOfferScope = (offer, product) =>
  offer.scope === 'all' || (offer.scope === 'cat' && offer.target === product.cat) || (offer.scope === 'item' && offer.target === product.code);

/** Same rounding as the store (nearest 50). */
export const discounted = (price, pct) => Math.round((price * (100 - pct)) / 100 / 50) * 50;
