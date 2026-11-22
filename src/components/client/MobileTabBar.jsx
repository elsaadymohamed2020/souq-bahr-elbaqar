import React from 'react';
import { Home, LayoutGrid, Layers, Moon, ShoppingCart, Sun, MapPin, Truck, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useActiveSection, scrollToId } from '../../lib/hooks';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Sheet } from '../ui';
import { iconFor } from './icons';
import { cn } from '../../lib/cn';

const SECTIONS = ['top', 'items', 'deals', 'shipping', 'branches'];

/** App-style bottom bar for phones (the demo is recorded on a phone). */
export default function MobileTabBar() {
  const { cartCount, setIsCartOpen, getGeneralWhatsAppLink, setIsCategorySheetOpen } = useApp();
  const active = useActiveSection(SECTIONS);

  const Item = ({ icon: Icon, label, onClick, isActive, badge, tour }) => (
    <button
      type="button"
      onClick={onClick}
      data-tour={tour}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 font-heading text-[10px] font-bold transition-colors active:scale-[0.96]',
        isActive ? 'text-fg' : 'text-fg-subtle'
      )}
    >
      <span className="relative">
        <Icon className={cn('h-[22px] w-[22px]', isActive && 'text-amber-600 dark:text-amber-400')} aria-hidden="true" />
        {badge ? (
          <span className="num absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-ink">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
      {isActive ? <span className="absolute top-0 h-0.5 w-8 rounded-full bg-amber-500" aria-hidden="true" /> : null}
    </button>
  );

  return (
    <>
      <nav
        aria-label="التنقل السريع"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
      >
        <div className="flex h-16 items-stretch">
          <Item icon={Home} label="الرئيسية" isActive={active === 'top'} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <Item icon={LayoutGrid} label="الأقسام" isActive={active === 'items'} onClick={() => setIsCategorySheetOpen(true)} />
          <Item icon={Layers} label="الصفقات" isActive={active === 'deals'} onClick={() => scrollToId('deals')} />
          <Item icon={ShoppingCart} label="السلة" badge={cartCount || null} onClick={() => setIsCartOpen(true)} tour="mobile-cart" />
          <a
            href={getGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 font-heading text-[10px] font-bold text-emerald-700 active:scale-[0.96] dark:text-emerald-400"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
              <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            واتساب
          </a>
        </div>
      </nav>
      <CategorySheet />
    </>
  );
}

function CategorySheet() {
  const { isCategorySheetOpen, setIsCategorySheetOpen, categoryPresets, applyCategoryPreset, theme, toggleTheme } = useApp();
  const close = () => setIsCategorySheetOpen(false);
  const go = (fn) => {
    close();
    setTimeout(fn, 220);
  };
  return (
    <Sheet isOpen={isCategorySheetOpen} onClose={close} title="تسوق بالقسم" subtitle="اختار القسم واحنا نجيبلك المعروض كله">
      <div className="grid grid-cols-3 gap-2 p-4">
        {categoryPresets.map((p) => {
          const Icon = iconFor(p.icon);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                go(() => {
                  if (p.section) scrollToId(p.section);
                  else {
                    applyCategoryPreset(p.id);
                    scrollToId('items');
                  }
                })
              }
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 text-center font-heading text-xs font-bold transition-colors active:scale-[0.97]',
                p.accent ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300' : 'border-line bg-surface text-fg hover:bg-surface-2'
              )}
            >
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', p.accent ? 'bg-amber-500 text-ink' : 'bg-surface-2 text-fg')}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-1 border-t border-line p-4">
        {[
          { icon: Truck, label: 'احسب الشحن لحد بيتك', id: 'shipping' },
          { icon: MapPin, label: 'الفروع والخريطة', id: 'branches' },
          { icon: ShieldCheck, label: 'اتأكد من الرقم اللي كلمك', id: 'trust' },
        ].map((l) => (
          <button key={l.id} type="button" onClick={() => go(() => scrollToId(l.id))} className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-fg hover:bg-surface-2">
            <l.icon className="h-5 w-5 text-fg-muted" aria-hidden="true" />
            {l.label}
          </button>
        ))}
        <button type="button" onClick={toggleTheme} className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-fg hover:bg-surface-2">
          {theme === 'dark' ? <Sun className="h-5 w-5 text-fg-muted" aria-hidden="true" /> : <Moon className="h-5 w-5 text-fg-muted" aria-hidden="true" />}
          {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}
        </button>
      </div>
    </Sheet>
  );
}
