import React from 'react';
import { useApp } from '../../context/AppContext';
import { WhatsAppIcon } from '../common/BrandIcons';

/** Desktop only. On phones the bottom tab bar carries WhatsApp. */
export default function WhatsAppFloatingBtn() {
  const { getGeneralWhatsAppLink } = useApp();

  return (
    <aside aria-label="محادثة واتساب سريعة" className="fixed bottom-6 left-6 z-40 hidden lg:block">
      <a
        href={getGeneralWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-14 items-center gap-2.5 rounded-full bg-emerald-600 pl-5 pr-4 font-heading text-sm font-black text-white shadow-soft-lg ring-4 ring-white transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-emerald-500 active:scale-[0.97] dark:ring-surface"
      >
        <span className="relative flex">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-white/50" aria-hidden="true" />
          <WhatsAppIcon className="relative h-6 w-6" aria-hidden="true" />
        </span>
        كلمنا واتساب
      </a>
    </aside>
  );
}
