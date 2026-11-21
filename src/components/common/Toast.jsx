import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 bg-ink text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 max-w-[92vw] sm:max-w-md">
        <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </span>
        <p className="text-sm font-medium leading-relaxed">{toastMessage.message}</p>
      </div>
    </div>
  );
}
