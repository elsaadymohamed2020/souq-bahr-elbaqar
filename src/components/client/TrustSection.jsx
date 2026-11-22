import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BadgeCheck, Copy, Phone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Button } from '../ui';

function normalizePhone(v) {
  // Accept Arabic-Indic digits typed on Arabic keyboards
  let d = String(v || '')
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[^\d]/g, '');
  if (d.startsWith('0020')) d = '0' + d.slice(4);
  else if (d.startsWith('20') && d.length === 12) d = '0' + d.slice(2);
  else if (d.length === 10 && d.startsWith('1')) d = '0' + d;
  return d;
}

/** Interactive anti-scam check: answers his "احذروا نصابة" post directly. */
export default function TrustSection() {
  const { officialNumbers, showToast, getGeneralWhatsAppLink } = useApp();
  const reduce = useReducedMotion();
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null); // { ok, match, number }

  const check = (raw = value) => {
    const n = normalizePhone(raw);
    if (n.length < 10) {
      setResult({ invalid: true });
      return;
    }
    const match = officialNumbers.find((o) => o.number === n);
    setResult({ ok: Boolean(match), match, number: n });
  };

  const tryNumber = (n) => {
    setValue(n);
    check(n);
  };

  const copy = async (n) => {
    try {
      await navigator.clipboard.writeText(n);
      showToast('الرقم اتنسخ', 'info');
    } catch {
      showToast(n, 'info');
    }
  };

  return (
    <section id="trust" aria-labelledby="trust-title" className="mx-auto mt-14 max-w-7xl px-3 sm:mt-20 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Verify tool */}
        <div className="rounded-3xl bg-ink p-5 text-white sm:p-8 lg:col-span-7" data-tour="verify-number">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            احذر من الصفحات والأرقام المزيفة
          </span>
          <h2 id="trust-title" className="mt-3 font-heading text-2xl font-black leading-tight sm:text-3xl">
            حد كلمك باسم السوق؟ اتأكد من الرقم في ثانية
          </h2>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-slate-300">
            فيه ناس بتبعت أسعار باسمنا وبتطلب تحويل. اكتب الرقم اللي كلمك، ونقولك هو من أرقامنا الرسمية ولا لأ.
          </p>

          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
          >
            <label htmlFor="verify-number-input" className="sr-only">
              الرقم اللي كلمك
            </label>
            <input
              id="verify-number-input"
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setResult(null);
              }}
              placeholder="01X XXXX XXXX"
              className="num h-14 flex-1 rounded-2xl border-2 border-white/15 bg-white/5 px-4 text-center font-heading text-xl font-black tracking-wider text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none sm:text-right"
            />
            <Button type="submit" size="xl" className="sm:w-auto">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              اتأكد
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>جرّب:</span>
            <button type="button" onClick={() => tryNumber('010 3405 2401')} className="num rounded-full border border-white/15 px-3 py-1.5 font-bold text-slate-200 hover:bg-white/10" dir="ltr">
              010 3405 2401
            </button>
            <button type="button" onClick={() => tryNumber('011 2233 4455')} className="num rounded-full border border-white/15 px-3 py-1.5 font-bold text-slate-200 hover:bg-white/10" dir="ltr">
              011 2233 4455
            </button>
          </div>

          <div aria-live="polite" className="mt-5 min-h-[96px]">
              {result ? (
                <motion.div
                  key={result.invalid ? 'invalid' : result.ok ? 'ok' : 'bad'}
                  initial={{ opacity: 0, y: reduce ? 0 : 8, scale: reduce ? 1 : 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={
                    result.invalid
                      ? 'rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200'
                      : result.ok
                      ? 'flex items-start gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-4'
                      : 'flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-500/15 p-4'
                  }
                >
                  {result.invalid ? (
                    'اكتب الرقم كامل، 11 رقم، وبعدين دوس اتأكد.'
                  ) : result.ok ? (
                    <>
                      <BadgeCheck className="h-7 w-7 shrink-0 text-emerald-300" aria-hidden="true" />
                      <div>
                        <p className="font-heading text-lg font-black text-emerald-200">رقم رسمي، اطمن</p>
                        <p className="mt-0.5 text-sm text-emerald-100/90">ده {result.match.label}. اتعامل عادي، والحجز بيتأكد بكود القطعة.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-7 w-7 shrink-0 text-red-300" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-heading text-lg font-black text-red-200">الرقم ده مش بتاعنا. متحولش أي فلوس</p>
                        <p className="mt-0.5 text-sm text-red-100/90">إحنا مبنطلبش تحويل قبل المعاينة. ابعتلنا صورة الرسالة على رقمنا الرسمي وإحنا نتصرف.</p>
                        <Button
                          variant="whatsapp"
                          size="sm"
                          className="mt-3"
                          href={getGeneralWhatsAppLink(`السلام عليكم، الرقم ده ${result.number} كلمني باسم سوق بحر البقر وطلب فلوس. هو تبعكم؟`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                          بلّغ عن الرقم
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-400">النتيجة هتظهر هنا.</p>
              )}
          </div>
        </div>

        {/* Official numbers */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="rounded-3xl border border-line bg-surface p-5">
            <h3 className="flex items-center gap-2 font-heading text-lg font-black text-fg">
              <ShieldCheck className="h-5 w-5 text-brand-blue" aria-hidden="true" />
              أرقامنا الرسمية بس
            </h3>
            <p className="mt-1 text-sm text-fg-muted">أي رقم غير دول مش تبعنا.</p>
            <ul className="mt-4 space-y-2">
              {officialNumbers.map((o) => (
                <li key={o.number} className="flex items-center justify-between gap-2 rounded-2xl bg-surface-2 p-3">
                  <span className="min-w-0">
                    <span className="num block font-heading text-lg font-black text-fg" dir="ltr">
                      {o.display}
                    </span>
                    <span className="line-clamp-1 block text-xs text-fg-muted">{o.label}</span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => copy(o.number)} aria-label={`انسخ الرقم ${o.display}`} className="flex h-10 w-10 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg">
                      <Copy className="h-4 w-4" />
                    </button>
                    <a href={`tel:${o.number}`} aria-label={`اتصل بـ ${o.display}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition-colors hover:bg-ink-700 dark:bg-white dark:text-ink">
                      <Phone className="h-4 w-4" />
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid gap-2 rounded-3xl border border-line bg-surface p-5 text-sm text-fg">
            {['مبنطلبش تحويل أو عربون قبل ما تشوف القطعة', 'السعر الرسمي هو اللي على الموقع بس', 'الحجز بيتأكد بكود القطعة من الرقم الرسمي'].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
