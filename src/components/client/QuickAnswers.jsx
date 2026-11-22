import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Bot, CheckCircle2, MapPin, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { scrollToId } from '../../lib/hooks';
import { Button } from '../ui';
import { cn } from '../../lib/cn';

/**
 * The three questions that flood his reel comments, answered by the site itself.
 * Picking one plays a short chat, then offers the action.
 */
export default function QuickAnswers() {
  const { products, getFinalPrice, formatPrice, flashPrices, updateCatalogFilters } = useApp();
  const reduce = useReducedMotion();
  const fridge = products.find((p) => p.code === 'BB-101') || products[0];

  const QUESTIONS = [
    {
      id: 'price',
      icon: Tag,
      chip: 'بكام؟',
      ask: 'التلاجة بكام يا حاج؟',
      answer: fridge
        ? `كل قطعة سعرها مكتوب عليها. ${fridge.name.split(' ').slice(0, 3).join(' ')} مثلاً بـ ${formatPrice(getFinalPrice(fridge))} ج، ومن غير فصال.`
        : 'كل قطعة سعرها مكتوب عليها، ومن غير فصال.',
      cta: 'وريني الأسعار',
      run: () => {
        scrollToId('items');
        setTimeout(flashPrices, 500);
      },
    },
    {
      id: 'where',
      icon: MapPin,
      chip: 'فين المكان؟',
      ask: 'المكان فين بالظبط؟ الصالحية القديمة ولا الجديدة؟',
      answer: 'عندنا فرعين: بحر البقر جنب المسجد الكبير، والصالحية الجديدة. دوس "وديني" والخريطة توصلك لحد الباب.',
      cta: 'وديني',
      run: () => scrollToId('branches'),
    },
    {
      id: 'avail',
      icon: CheckCircle2,
      chip: 'لسه موجود؟',
      ask: 'الغسالة لسه موجودة ولا اتباعت؟',
      answer: 'كل قطعة مكتوب عليها حالتها: متاح، محجوز، أو اتباع. وبتتحدث أول ما تتباع في المحل.',
      cta: 'وريني المتاح بس',
      run: () => {
        updateCatalogFilters({ status: 'avail' });
        scrollToId('items');
      },
    },
  ];

  const [activeId, setActiveId] = useState('price');
  const [typing, setTyping] = useState(false);
  const active = QUESTIONS.find((q) => q.id === activeId);

  useEffect(() => {
    if (reduce) return undefined;
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 900);
    return () => clearTimeout(t);
  }, [activeId, reduce]);

  return (
    <section aria-labelledby="qa-title" className="mx-auto mt-8 max-w-7xl px-3 sm:mt-10 sm:px-6" data-tour="quick-answers">
      <div className="grid items-stretch gap-4 overflow-hidden rounded-3xl border border-line bg-surface p-4 sm:p-6 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col justify-center gap-4 lg:col-span-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Bot className="h-3.5 w-3.5" aria-hidden="true" />
              الموقع بيرد لوحده، 24 ساعة
            </span>
            <h2 id="qa-title" className="font-heading text-2xl font-black leading-tight text-fg sm:text-3xl">
              عندك سؤال؟ الإجابة هنا قبل ما تكتبه
            </h2>
            <p className="max-w-[46ch] text-sm leading-relaxed text-fg-muted">
              أكتر 3 أسئلة في تعليقات الريلز. اختار سؤال وشوف الموقع بيرد إزاي.
            </p>
          </div>
          <div role="tablist" aria-label="الأسئلة المتكررة" className="flex flex-wrap gap-2">
            {QUESTIONS.map((q) => {
              const Icon = q.icon;
              const on = q.id === activeId;
              return (
                <button
                  key={q.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveId(q.id)}
                  className={cn(
                    'inline-flex h-12 items-center gap-2 rounded-2xl border-2 px-4 font-heading text-base font-black transition-[background-color,border-color,color,transform] active:scale-[0.97]',
                    on ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink' : 'border-line bg-surface text-fg hover:border-line-strong'
                  )}
                >
                  <Icon className={cn('h-5 w-5', on ? 'text-amber-400 dark:text-amber-600' : 'text-fg-subtle')} aria-hidden="true" />
                  {q.chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat preview */}
        <div className="lg:col-span-7">
          <div className="flex h-full min-h-[230px] flex-col rounded-2xl bg-surface-2 p-3 sm:p-4" role="tabpanel" aria-live="polite">
            <div className="mb-3 flex items-center gap-2 border-b border-line pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-heading text-sm font-black text-amber-400">ب</span>
              <span className="leading-tight">
                <span className="block font-heading text-sm font-black text-fg">سوق بحر البقر</span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  بيرد فوراً
                </span>
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-end gap-2">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2"
                >
                  <div className="max-w-[85%] self-start rounded-2xl rounded-tr-md bg-surface px-3.5 py-2.5 text-sm text-fg shadow-soft-sm">{active.ask}</div>
                  {typing ? (
                    <div className="flex w-16 items-center justify-center gap-1 self-end rounded-2xl rounded-tl-md bg-emerald-600 px-3 py-3" aria-label="بيكتب">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-white"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-[88%] self-end rounded-2xl rounded-tl-md bg-emerald-600 px-3.5 py-2.5 text-sm leading-relaxed text-white"
                    >
                      {active.answer}
                    </motion.div>
                  )}
                </motion.div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="md" variant="dark" onClick={active.run}>
                {active.cta}
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
