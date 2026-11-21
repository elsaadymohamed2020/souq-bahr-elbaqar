import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloatingBtn() {
  const { getGeneralWhatsAppLink } = useApp();

  return (
    <aside aria-label="محادثة واتساب سريعة" className="fixed bottom-6 left-6 z-40">
      <a
        href={getGeneralWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا على واتساب"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-sm shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 active:scale-95 border-2 border-white"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline">كلمنا واتساب</span>
      </a>
    </aside>
  );
}
