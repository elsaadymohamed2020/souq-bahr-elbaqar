import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, MessageCircleOff, ThumbsUp } from 'lucide-react';
import { PITCH } from '../../config/pitch';
import { useOverlay } from '../../lib/useOverlay';

// Representative comments, written like the ones found on the page's reels (names are placeholders).
const COMMENTS = [
  { who: 'محمد ع.', text: 'المكان فين؟' },
  { who: 'أم يوسف', text: 'التلاجة بكام؟' },
  { who: 'كريم', text: 'متاح شحن للعاشر من رمضان؟' },
  { who: 'سيد', text: 'المكان فين يا جماعة؟ الصالحية القديمة ولا الجديدة؟' },
  { who: 'أحمد من المعادي', text: 'الشاشة 43 بكام؟' },
  { who: 'حسن', text: 'موتور مية 12 حصان موجود؟' },
  { who: 'عمرو', text: 'فيه ديب فريزر؟' },
  { who: 'إسلام من البحيرة', text: 'النقل لعندنا هيبقى غالي، صرفت نظر' },
];

/** Tour opener: the problem, in his own comment section. */
export default function ProblemIntro({ onStart, onSkip }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(reduce ? COMMENTS.length : 0);
  useOverlay(true, onSkip, ref, { initialFocus: false });

  useEffect(() => {
    if (reduce) return undefined;
    if (shown >= COMMENTS.length) return undefined;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 350 : 380);
    return () => clearTimeout(t);
  }, [shown, reduce]);

  const done = shown >= COMMENTS.length;

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="intro-title" className="fixed inset-0 z-[96] overflow-y-auto bg-ink text-white">
      <div className="mx-auto grid min-h-full max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2 lg:gap-14">
        {/* Comments */}
        <div className="order-2 lg:order-1">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-200">تعليقات زي اللي على ريلز الصفحة</span>
              <span className="num">232 تعليق</span>
            </div>
            <ul className="space-y-2.5" aria-label="تعليقات من غير رد">
              {COMMENTS.slice(0, shown).map((c, i) => (
                <motion.li
                  key={c.text}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 font-heading text-xs font-black text-slate-200" aria-hidden="true">
                    {c.who.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="inline-block rounded-2xl rounded-tr-md bg-white/10 px-3 py-2">
                      <span className="block text-[11px] font-bold text-slate-300">{c.who}</span>
                      <span className="text-sm text-white">{c.text}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 px-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" aria-hidden="true" /> {(i * 7) % 23 + 2}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-red-300">
                        <MessageCircleOff className="h-3 w-3" aria-hidden="true" /> من غير رد
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Message */}
        <div className="order-1 space-y-5 lg:order-2">
          <span className="inline-flex rounded-full bg-amber-500 px-3 py-1 font-heading text-xs font-black text-ink">جولة سريعة، دقيقتين</span>
          <h1 id="intro-title" className="font-heading text-3xl font-black leading-[1.2] sm:text-5xl">
            يا {PITCH.ownerCall}،<br />
            <span className="text-amber-400">كل سؤال من دول زبون عايز يشتري</span>
          </h1>
          <div className="space-y-2 text-base leading-relaxed text-slate-300 sm:text-lg">
            <p>
              ريل "تعال الصالحية حالك يتصلح" لوحده عليه <b className="num text-white">232</b> تعليق. في أول <b className="num text-white">36</b> بس،{' '}
              <b className="num text-white">10</b> بيسألوا "المكان فين؟"، والرد ظاهر على <b className="num text-white">3</b> بس.
            </p>
            <p>والباقي "بكام؟" و"فيه شحن؟" و"لسه موجود؟".</p>
          </div>
          <motion.p
            initial={false}
            animate={{ opacity: done ? 1 : 0.35 }}
            className="font-heading text-xl font-black text-white sm:text-2xl"
          >
            طب لو كل ده بيترد لوحده؟
          </motion.p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStart}
              autoFocus
              className="inline-flex h-14 items-center gap-2 rounded-2xl bg-amber-500 px-6 font-heading text-base font-black text-ink shadow-glow-amber transition-[background-color,transform] hover:bg-amber-400 active:scale-[0.97]"
            >
              وريني إزاي
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={onSkip} className="h-14 rounded-2xl px-4 font-heading text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
              تخطي الجولة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
