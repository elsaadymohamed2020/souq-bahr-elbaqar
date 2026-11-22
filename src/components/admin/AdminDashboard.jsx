import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Ellipsis, ExternalLink, Moon, PanelRightClose, PanelRightOpen, RotateCcw, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Button, Sheet, Switch } from '../ui';
import { cn } from '../../lib/cn';
import AdminTopBar, { LogoTile } from './AdminTopBar';
import AdminHome from './AdminHome';
import AdminInbox from './AdminInbox';
import AdminProducts from './AdminProducts';
import AdminDeals from './AdminDeals';
import AdminOffers from './AdminOffers';
import AdminCRM from './AdminCRM';
import AdminERP from './AdminERP';
import { ADMIN_TABS, NAV_GROUPS, getTab } from './adminShared';

const SIDEBAR_KEY = 'bb_admin_sidebar';
const MOBILE_PRIMARY = ['home', 'inbox', 'products', 'crm'];
const MOBILE_MORE = ['deals', 'offers', 'erp'];

const PAGES = {
  home: AdminHome,
  inbox: AdminInbox,
  products: AdminProducts,
  deals: AdminDeals,
  offers: AdminOffers,
  crm: AdminCRM,
  erp: AdminERP,
};

const EASE = [0.16, 1, 0.3, 1];

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'collapsed';
  } catch (e) {
    return false;
  }
}

/* ------------------------------------------------------------------
   Desktop sidebar
------------------------------------------------------------------- */
function SidebarItem({ tab, active, collapsed, badge, onClick }) {
  const Icon = tab.icon;
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? tab.label : undefined}
      data-tour={tab.id === 'inbox' ? 'admin-nav-inbox' : undefined}
      className={cn(
        'group relative flex h-11 w-full items-center gap-3 rounded-xl px-3 font-heading text-sm font-bold transition-[color,background-color,transform] duration-150 active:scale-[0.97]',
        active ? 'text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
        collapsed && 'justify-center px-0'
      )}
    >
      {active ? (
        <motion.span
          layoutId="admin-sidebar-active"
          className="absolute inset-0 rounded-xl bg-surface-2 ring-1 ring-line"
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
          aria-hidden="true"
        />
      ) : null}
      <span className="relative flex">
        <Icon
          className={cn('h-5 w-5 transition-colors', active ? 'text-amber-600 dark:text-amber-400' : 'text-fg-subtle group-hover:text-fg')}
          aria-hidden="true"
        />
        {collapsed && badge ? (
          <span className="num absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-ink ring-2 ring-surface">
            {badge}
          </span>
        ) : null}
      </span>
      <span className={cn('relative flex-1 truncate text-right', collapsed && 'sr-only')}>{tab.label}</span>
      {!collapsed && badge ? (
        <span className="num relative rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-black leading-none text-ink">{badge}</span>
      ) : null}
      {badge ? <span className="sr-only">، {badge} محادثات مش مقروءة</span> : null}
    </button>
  );
}

function Sidebar({ collapsed, onToggle }) {
  const { adminTab, setAdminTab, setViewMode, unreadCount } = useApp();
  return (
    <aside
      aria-label="قائمة الإدارة"
      className={cn(
        'sticky top-10 z-30 hidden h-[calc(100vh_-_2.5rem)] shrink-0 flex-col border-l border-line bg-surface transition-[width] duration-200 ease-out lg:flex',
        collapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className={cn('flex h-16 shrink-0 items-center gap-3 border-b border-line', collapsed ? 'justify-center px-2' : 'px-4')}>
        <LogoTile />
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-black text-fg">سوق بحر البقر الكبير</p>
            <p className="text-[11px] font-semibold text-fg-subtle">لوحة الإدارة</p>
          </div>
        ) : null}
      </div>

      <nav aria-label="أقسام الإدارة" className="no-scrollbar flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className={cn('mb-1.5 px-3 text-[11px] font-bold text-fg-subtle', collapsed && 'sr-only')}>{group.label}</p>
            <ul className="space-y-0.5">
              {ADMIN_TABS.filter((t) => t.group === group.id).map((tab) => (
                <li key={tab.id}>
                  <SidebarItem
                    tab={tab}
                    collapsed={collapsed}
                    active={adminTab === tab.id}
                    badge={tab.id === 'inbox' && unreadCount ? unreadCount : 0}
                    onClick={() => setAdminTab(tab.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line p-3">
        {collapsed ? (
          <Button variant="ghost" size="icon" block aria-label="معاينة المتجر" title="معاينة المتجر" onClick={() => setViewMode('store')}>
            <Store className="h-5 w-5" aria-hidden="true" />
          </Button>
        ) : (
          <div className="rounded-2xl bg-ink p-4 text-white ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <p className="font-heading text-sm font-black">معاينة المتجر</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">شوف تعديلاتك زي ما الزبون شايفها بالظبط.</p>
            <Button variant="primary" size="sm" block className="mt-3 h-10" onClick={() => setViewMode('store')}>
              افتح المتجر
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}

        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
            <Avatar name="الحاج إبراهيم" label="إ" size="sm" tone={1} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-xs font-black text-fg">الحاج إبراهيم</p>
              <p className="truncate text-[11px] text-fg-subtle">صاحب المحل</p>
            </div>
          </div>
        ) : null}

        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          block
          onClick={onToggle}
          aria-label={collapsed ? 'كبّر القائمة' : 'صغّر القائمة'}
          aria-expanded={!collapsed}
          title={collapsed ? 'كبّر القائمة' : undefined}
          className={cn('h-10', !collapsed && 'justify-start')}
        >
          {collapsed ? <PanelRightOpen className="h-5 w-5" aria-hidden="true" /> : <PanelRightClose className="h-4 w-4" aria-hidden="true" />}
          {!collapsed ? <span>صغّر القائمة</span> : null}
        </Button>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------
   Mobile bottom nav + "المزيد" sheet
------------------------------------------------------------------- */
function MobileNavButton({ icon: Icon, label, active, badge, onClick, tourId, expanded }) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active && expanded === undefined ? 'page' : undefined}
      aria-expanded={expanded}
      data-tour={tourId}
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-1 font-heading text-[11px] font-bold transition-[color,transform] duration-150 active:scale-[0.95]',
        active ? 'text-fg' : 'text-fg-subtle hover:text-fg'
      )}
    >
      <span className="relative flex h-7 w-12 items-center justify-center">
        {active ? (
          <motion.span
            layoutId="admin-mobile-active"
            className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-500/15"
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
            aria-hidden="true"
          />
        ) : null}
        <Icon className={cn('relative h-5 w-5', active && 'text-amber-700 dark:text-amber-300')} aria-hidden="true" />
        {badge ? (
          <span className="num absolute -top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black leading-none text-ink ring-2 ring-surface">
            {badge}
          </span>
        ) : null}
      </span>
      <span>{label}</span>
      {badge ? <span className="sr-only">، {badge} مش مقروءة</span> : null}
    </button>
  );
}

function MobileNav({ onOpenMore, moreOpen }) {
  const { adminTab, setAdminTab, unreadCount } = useApp();
  const inMore = MOBILE_MORE.includes(adminTab);
  return (
    <nav aria-label="تنقل الإدارة" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {MOBILE_PRIMARY.map((id) => {
          const tab = getTab(id);
          return (
            <li key={id}>
              <MobileNavButton
                icon={tab.icon}
                label={tab.label}
                active={adminTab === id && !moreOpen}
                badge={id === 'inbox' && unreadCount ? unreadCount : 0}
                tourId={id === 'inbox' ? 'admin-nav-inbox' : undefined}
                onClick={() => setAdminTab(id)}
              />
            </li>
          );
        })}
        <li>
          <MobileNavButton icon={Ellipsis} label="المزيد" active={inMore || moreOpen} expanded={moreOpen} onClick={onOpenMore} />
        </li>
      </ul>
    </nav>
  );
}

function MoreSheet({ isOpen, onClose }) {
  const { adminTab, setAdminTab, setViewMode, theme, toggleTheme, resetDemo } = useApp();
  const go = (id) => {
    setAdminTab(id);
    onClose();
  };
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="المزيد" subtitle="باقي أقسام لوحة الإدارة">
      <div className="space-y-3 p-3 pb-5">
        <ul className="space-y-1">
          {MOBILE_MORE.map((id) => {
            const tab = getTab(id);
            const Icon = tab.icon;
            const active = adminTab === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-[background-color,transform] duration-150 active:scale-[0.98]',
                    active ? 'bg-surface-2' : 'hover:bg-surface-2'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      active ? 'bg-amber-500 text-ink' : 'bg-surface-2 text-fg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-sm font-black text-fg">{tab.title}</span>
                    <span className="block truncate text-xs text-fg-muted">{tab.desc}</span>
                  </span>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="h-px bg-line" />

        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => {
                onClose();
                setViewMode('store');
              }}
              className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-3 text-right transition-[background-color,transform] duration-150 hover:bg-surface-2 active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-amber-400 dark:bg-white/10">
                <Store className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex-1 font-heading text-sm font-black text-fg">معاينة المتجر</span>
              <ExternalLink className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
            </button>
          </li>
          <li className="flex min-h-[56px] items-center gap-3 rounded-2xl px-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg-muted">
              <Moon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex-1 font-heading text-sm font-black text-fg">الوضع الليلي</span>
            <Switch checked={theme === 'dark'} onChange={toggleTheme} label="الوضع الليلي" />
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onClose();
                setAdminTab('home');
                resetDemo();
              }}
              className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-3 text-right transition-[background-color,transform] duration-150 hover:bg-surface-2 active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg-muted">
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-sm font-black text-fg">إعادة ضبط الديمو</span>
                <span className="block text-xs text-fg-muted">كل البيانات ترجع زي أول مرة</span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------
   Shell
------------------------------------------------------------------- */
export default function AdminDashboard() {
  const { adminTab } = useApp();
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded');
    } catch (e) {
      // storage may be blocked; the toggle still works for this session
    }
  }, [collapsed]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [adminTab]);

  const Page = PAGES[adminTab] || AdminHome;

  return (
    <div className="relative bg-canvas lg:flex lg:items-start">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex min-h-[calc(100vh_-_2.5rem)] min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main
          id="admin-main"
          className="min-w-0 flex-1 px-4 pb-[calc(88px_+_env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6"
        >
          <div className="mx-auto w-full max-w-[1440px]">
              <motion.div
                key={adminTab}
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE } }}
                exit={{ opacity: 0, y: reduce ? 0 : -4, transition: { duration: 0.12 } }}
              >
                <Page />
              </motion.div>
          </div>
        </main>
      </div>

      <MobileNav moreOpen={moreOpen} onOpenMore={() => setMoreOpen(true)} />
      <MoreSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
