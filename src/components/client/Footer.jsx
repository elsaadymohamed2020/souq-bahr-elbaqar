import React from 'react';
import { ArrowUp, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { scrollToId } from '../../lib/hooks';
import { FacebookIcon, WhatsAppIcon } from '../common/BrandIcons';
import { PITCH, devWhatsAppLink } from '../../config/pitch';

export default function Footer() {
  const { branches, officialNumbers, categoryPresets, applyCategoryPreset, getGeneralWhatsAppLink } = useApp();
  const shop = categoryPresets.filter((p) => !p.section && p.id !== 'all').slice(0, 6);

  return (
    <footer className="mt-16 border-t border-line bg-surface pb-24 sm:mt-24 lg:pb-0">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex h-12 w-full items-center justify-center gap-2 bg-ink-800 font-heading text-sm font-bold text-white transition-colors hover:bg-ink-700"
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
        ارجع لفوق
      </button>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink font-heading text-2xl font-black text-amber-400" aria-hidden="true">
              ب
            </span>
            <span className="font-heading text-lg font-black text-fg">سوق بحر البقر الكبير</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
            أجهزة منزلية فرز أول، ومعدات صناعية أوروبية مستوردة، وموبيليا وأبواب خشب. فرعين في الشرقية، والسعر مكتوب على كل قطعة.
          </p>
          <div className="flex gap-2">
            <a
              href="https://www.facebook.com/profile.php?id=61583010391071"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="صفحتنا على فيسبوك"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-[#1877F2] transition-colors hover:bg-surface-3"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a
              href={getGeneralWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="كلمنا واتساب"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-emerald-600 transition-colors hover:bg-surface-3"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <nav aria-label="تسوق" className="lg:col-span-2">
          <h3 className="mb-3 font-heading text-sm font-black text-fg">تسوق</h3>
          <ul className="space-y-2 text-sm">
            {shop.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    applyCategoryPreset(p.id);
                    scrollToId('items');
                  }}
                  className="text-fg-muted transition-colors hover:text-fg"
                >
                  {p.label}
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => scrollToId('deals')} className="text-fg-muted transition-colors hover:text-fg">
                لوطات وشروات
              </button>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h3 className="mb-3 font-heading text-sm font-black text-fg">الفروع</h3>
          <ul className="space-y-3 text-sm">
            {branches.map((b) => (
              <li key={b.id}>
                <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="group flex gap-2 text-fg-muted transition-colors hover:text-fg">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>
                    <span className="block font-bold text-fg">{b.name}</span>
                    <span className="line-clamp-2">{b.address}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="mb-3 font-heading text-sm font-black text-fg">مساعدة وتواصل</h3>
          <ul className="space-y-2 text-sm">
            {officialNumbers.map((o) => (
              <li key={o.number}>
                <a href={`tel:${o.number}`} className="flex items-center gap-2 text-fg-muted transition-colors hover:text-fg">
                  <Phone className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                  <span className="num font-bold" dir="ltr">
                    {o.display}
                  </span>
                </a>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => scrollToId('shipping')} className="text-fg-muted transition-colors hover:text-fg">
                أسعار الشحن للمحافظات
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToId('trust')} className="text-fg-muted transition-colors hover:text-fg">
                اتأكد من رقم كلمك
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>سوق بحر البقر الكبير. كل الحقوق محفوظة.</span>
          <span>نموذج تجريبي مقترح، الأسعار والبيانات للتوضيح.</span>
        </div>
      </div>

      {/* Developer credit */}
      <div className="bg-ink text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-4 text-center text-xs sm:justify-between sm:px-6">
          <span>
            تصميم وتنفيذ: <b className="font-heading text-sm font-black text-white">{PITCH.devName}</b>
          </span>
          <a
            href={devWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 font-heading text-sm font-black text-white transition-colors hover:bg-white/15"
            aria-label={`كلم ${PITCH.devName} على واتساب`}
          >
            <WhatsAppIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span className="num" dir="ltr">
              {PITCH.devPhoneDisplay}
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
