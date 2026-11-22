import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, CircleOff, Hourglass, Megaphone, PauseCircle, PlayCircle, Plus, Tag, Timer, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Countdown, EmptyState, Switch } from '../ui';
import { WhatsAppIcon } from '../common/BrandIcons';
import { cn } from '../../lib/cn';
import { ConfirmDelete, Thumb, discounted, inOfferScope, todayIso } from './adminShared';

const PREVIEW_LIMIT = 4;
const BROADCAST_REACH = 1240;

function OfferCard({ offer }) {
  const { products, categories, toggleOffer, deleteOffer, formatPrice } = useApp();
  const reduce = useReducedMotion();
  const expired = offer.ends < todayIso();
  const live = offer.active && !expired;
  const affected = products.filter((p) => p.status !== 'sold' && inOfferScope(offer, p));

  const scopeLabel =
    offer.scope === 'all'
      ? 'على كل المعروض'
      : offer.scope === 'cat'
      ? `على قسم ${categories.find((c) => c.id === offer.target)?.name || offer.target}`
      : `على قطعة ${products.find((p) => p.code === offer.target)?.name || offer.target}`;

  const status = expired
    ? { label: 'العرض خلص', tone: 'neutral', icon: CircleOff }
    : offer.active
    ? { label: 'شغال على الموقع', tone: 'emerald', icon: PlayCircle }
    : { label: 'متوقف', tone: 'neutral', icon: PauseCircle };

  return (
    <motion.article
      layout={reduce ? false : 'position'}
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduce ? 1 : 0.98, transition: { duration: 0.15 } }}
      className={cn(
        'flex min-w-0 flex-col rounded-card border bg-surface transition-[border-color,box-shadow] duration-200',
        live ? 'border-amber-300 shadow-soft dark:border-amber-500/40' : 'border-line'
      )}
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div
          className={cn(
            'flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl transition-colors',
            live ? 'bg-amber-500 text-ink shadow-glow-amber' : 'bg-surface-2 text-fg-subtle'
          )}
        >
          <span className="num font-heading text-[28px] font-black leading-none" dir="ltr">
            -{offer.pct}%
          </span>
          <span className="mt-1 text-[10px] font-bold">خصم</span>
        </div>

        <div className="min-w-0 flex-1">
          <Badge tone={status.tone} icon={status.icon} size="xs">
            {status.label}
          </Badge>
          <h3 className="mt-1.5 font-heading text-base font-black leading-snug text-fg">{offer.title || `خصم ${offer.pct}%`}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-fg-muted">{scopeLabel}</p>
          {offer.desc ? <p className="mt-1 line-clamp-2 text-xs text-fg-subtle">{offer.desc}</p> : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Switch checked={offer.active} onChange={() => toggleOffer(offer.id)} label={`تشغيل ${offer.title || 'العرض'}`} />
          <ConfirmDelete itemLabel="العرض ده" placement="bottom" onConfirm={() => deleteOffer(offer.id)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-muted">
          <Timer className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
          {expired ? 'انتهى' : 'فاضل على نهاية العرض'}
        </span>
        <Countdown ends={offer.ends} variant="boxes" tone="dark" />
      </div>

      <div className="flex-1 border-t border-line px-4 py-3 sm:px-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-fg">الأسعار على الموقع</p>
          <span className="num text-[11px] font-bold text-fg-subtle">{affected.length} قطعة</span>
        </div>
        {affected.length ? (
          <>
            <div className="mb-1 flex items-center gap-3 px-1 text-[10px] font-bold text-fg-subtle" aria-hidden="true">
              <span className="flex-1">القطعة</span>
              <span className="w-16 text-left">قبل</span>
              <span className="w-20 text-left">بعد</span>
            </div>
            <ul className="divide-y divide-line">
              {affected.slice(0, PREVIEW_LIMIT).map((p) => (
                <li key={p.code} className="flex items-center gap-3 px-1 py-2">
                  <Thumb src={p.img} className="h-9 w-9 rounded-lg" iconClassName="h-4 w-4" />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-fg">{p.name}</span>
                  <s className="num w-16 text-left text-xs text-fg-subtle">
                    <span className="sr-only">قبل </span>
                    {formatPrice(p.price)}
                  </s>
                  <span className={cn('num w-20 text-left font-heading text-sm font-black', live ? 'text-amber-700 dark:text-amber-400' : 'text-fg-muted')}>
                    <span className="sr-only">بعد </span>
                    {formatPrice(discounted(p.price, offer.pct))} ج
                  </span>
                </li>
              ))}
            </ul>
            {affected.length > PREVIEW_LIMIT ? (
              <p className="num mt-1 px-1 text-[11px] font-semibold text-fg-subtle">و{affected.length - PREVIEW_LIMIT} قطع كمان</p>
            ) : null}
            {!live ? <p className="mt-2 px-1 text-[11px] text-fg-subtle">الأسعار دي هتظهر للزبون أول ما تشغّل العرض.</p> : null}
          </>
        ) : (
          <p className="rounded-xl bg-surface-2 px-3 py-2.5 text-xs text-fg-muted">مفيش قطع متاحة داخلة في العرض ده دلوقتي.</p>
        )}
      </div>
    </motion.article>
  );
}

function Broadcast() {
  const { showToast, formatPrice, offers } = useApp();
  const [state, setState] = useState('idle');
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const liveCount = offers.filter((o) => o.active && o.ends >= todayIso()).length;

  const send = () => {
    if (state !== 'idle') return;
    setState('sending');
    timer.current = setTimeout(() => {
      setState('sent');
      showToast(`الرسالة اتبعتت لـ ${formatPrice(BROADCAST_REACH)} عميل على الواتساب (تجربة)`);
      timer.current = setTimeout(() => setState('idle'), 2600);
    }, 1100);
  };

  return (
    <section className="relative overflow-hidden rounded-card bg-emerald-700 p-5 text-white sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <WhatsAppIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-black">ابعت العروض لعملائك على الواتساب</h2>
            <p className="mt-1 max-w-xl text-sm text-emerald-50/90">
              رسالة واحدة توصل لكل اللي كلموك قبل كده، فيها العروض الشغالة ولينك كل قطعة.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-50">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="num">{formatPrice(BROADCAST_REACH)}</span> عميل
              <span aria-hidden="true">·</span>
              <span className="num">{liveCount}</span> عرض شغال
            </p>
          </div>
        </div>
        <Button
          onClick={send}
          loading={state === 'sending'}
          disabled={!liveCount}
          size="lg"
          className="shrink-0 bg-white text-emerald-800 shadow-none hover:bg-emerald-50 active:bg-emerald-100"
        >
            <motion.span key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2">
              {state === 'sent' ? <Check className="h-5 w-5" aria-hidden="true" /> : state === 'idle' ? <Megaphone className="h-5 w-5" aria-hidden="true" /> : null}
              {state === 'sending' ? 'بيتبعت...' : state === 'sent' ? 'اتبعتت' : 'ابعت للعملاء (تجربة)'}
            </motion.span>
        </Button>
      </div>
    </section>
  );
}

export default function AdminOffers() {
  const { offers, products, setIsAddOfferOpen, getOfferForProduct } = useApp();
  const today = todayIso();
  const liveCount = offers.filter((o) => o.active && o.ends >= today).length;
  const discountedCount = products.filter((p) => p.status !== 'sold' && getOfferForProduct(p)).length;

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={liveCount ? 'amber' : 'neutral'} icon={Tag}>
            <span className="num">{liveCount}</span> عرض شغال
          </Badge>
          <Badge tone="neutral" icon={Hourglass}>
            <span className="num">{discountedCount}</span> قطعة عليها خصم دلوقتي
          </Badge>
        </div>
        <Button variant="primary" onClick={() => setIsAddOfferOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          عرض جديد
        </Button>
      </div>

      {offers.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <AnimatePresence initial={false}>
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title="مفيش عروض لسه"
          description="اعمل خصم على قسم أو قطعة، والأسعار تتغير على الموقع لوحدها."
          action={
            <Button variant="primary" onClick={() => setIsAddOfferOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              عرض جديد
            </Button>
          }
        />
      )}

      <Broadcast />
    </div>
  );
}
