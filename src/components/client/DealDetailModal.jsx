import React, { useEffect, useState } from 'react';
import { Boxes, ClipboardList, Gavel, HandCoins, MapPin, Scale, ShieldCheck, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Button, Input, StatusBadge } from '../ui';

const DEAL_LABELS = { avail: 'متاحة للمعاينة', held: 'جاري المعاينة', sold: 'اتباعت' };

export default function DealDetailModal() {
  const { selectedDealForDetail: deal, setSelectedDealForDetail, formatPrice, getWhatsAppDealLink, getGeneralWhatsAppLink, bookDealDeposit } = useApp();
  const [bid, setBid] = useState('');
  const [showBid, setShowBid] = useState(false);

  useEffect(() => {
    setBid('');
    setShowBid(false);
  }, [deal?.code]);

  const close = () => setSelectedDealForDetail(null);
  if (!deal) return <Modal isOpen={false} onClose={close} />;

  const savePct = deal.estimatedRetail ? Math.round(((deal.estimatedRetail - deal.totalPrice) / deal.estimatedRetail) * 100) : 0;
  const isSold = deal.status === 'sold';
  const bidNum = Number(String(bid).replace(/[^\d]/g, ''));
  const bidLink = getGeneralWhatsAppLink(
    `السلام عليكم يا حاج، بخصوص الصفقة (${deal.code}: ${deal.title}) المعروضة بـ ${formatPrice(deal.totalPrice)} ج. أنا عايز أقدم عرض سعر ${formatPrice(bidNum)} جنيه للشروة كاملة. ممكن نتكلم؟`
  );

  return (
    <Modal
      isOpen={Boolean(deal)}
      onClose={close}
      title={deal.title}
      subtitle={`${deal.code} · ${deal.category} · فرع ${deal.branch}`}
      icon={ClipboardList}
      maxWidth="sm:max-w-3xl"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button variant="whatsapp" size="lg" className="flex-1" href={isSold ? undefined : getWhatsAppDealLink(deal, 'inspect')} target="_blank" rel="noopener noreferrer" disabled={isSold}>
            <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
            احجز معاينة
          </Button>
          {deal.status === 'avail' ? (
            <Button variant="primary" size="lg" className="flex-1" onClick={() => bookDealDeposit(deal)}>
              <HandCoins className="h-5 w-5" aria-hidden="true" />
              عربون {formatPrice(deal.deposit)} ج
            </Button>
          ) : null}
          {!isSold ? (
            <Button variant="secondary" size="lg" onClick={() => setShowBid((v) => !v)} aria-expanded={showBid}>
              <Gavel className="h-5 w-5" aria-hidden="true" />
              قدّم عرض
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="relative h-48 overflow-hidden rounded-2xl sm:h-64">
          <img src={deal.img} alt={deal.title} width="900" height="500" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-3 right-3 left-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <StatusBadge status={deal.status} labels={DEAL_LABELS} />
              <p className="num mt-2 font-heading text-3xl font-black text-white">
                {formatPrice(deal.totalPrice)} <span className="text-base text-slate-200">ج Total</span>
              </p>
            </div>
            {savePct > 0 ? (
              <span className="num rounded-xl bg-emerald-500 px-3 py-1.5 font-heading text-sm font-black text-white">وفّر {savePct}% عن القطاعي</span>
            ) : null}
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { icon: Scale, label: 'الوزن', value: deal.weight },
            { icon: Boxes, label: 'العدد', value: deal.itemsCount },
            { icon: MapPin, label: 'الفرع', value: deal.branch },
            { icon: HandCoins, label: 'العربون', value: `${formatPrice(deal.deposit)} ج` },
          ].map((s) => (
            <li key={s.label} className="rounded-2xl bg-surface-2 p-3">
              <s.icon className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <span className="mt-1.5 block text-[11px] text-fg-subtle">{s.label}</span>
              <span className="line-clamp-2 block text-sm font-bold text-fg">{s.value}</span>
            </li>
          ))}
        </ul>

        {deal.desc ? <p className="text-sm leading-relaxed text-fg-muted">{deal.desc}</p> : null}

        {deal.items?.length ? (
          <div>
            <h4 className="mb-2 font-heading text-base font-black text-fg">كشف المحتويات ({deal.items.length} بند)</h4>
            <div className="overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-right text-sm">
                <thead className="bg-surface-2 text-xs text-fg-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-bold">البند</th>
                    <th scope="col" className="px-3 py-2.5 font-bold">الكمية</th>
                    <th scope="col" className="hidden px-3 py-2.5 font-bold sm:table-cell">المواصفات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {deal.items.map((it) => (
                    <tr key={it.name} className="align-top">
                      <td className="px-3 py-2.5 font-semibold text-fg">
                        {it.name}
                        <span className="mt-0.5 block text-xs font-normal text-fg-muted sm:hidden">{it.spec}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-bold text-amber-700 dark:text-amber-400">{it.qty}</td>
                      <td className="hidden px-3 py-2.5 text-xs text-fg-muted sm:table-cell">{it.spec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-line p-4">
          <h4 className="mb-2 flex items-center gap-2 font-heading text-sm font-black text-fg">
            <Truck className="h-4 w-4 text-brand-blue" aria-hidden="true" />
            المعاينة والتسليم
          </h4>
          <ul className="space-y-2 text-sm text-fg-muted">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              {deal.location}
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              المعاينة يومياً من 9 الصبح لـ 5 المغرب، وتقدر تجرب المواتير بالكهرباء قبل التحميل.
            </li>
            <li className="flex gap-2">
              <Scale className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              لوطات الحديد بتتوزن على ميزان بسكول معتمد قدامك. البيع شروة واحدة، مفيش تجزئة.
            </li>
          </ul>
        </div>

        {showBid ? (
          <form
            className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10"
            onSubmit={(e) => {
              e.preventDefault();
              if (bidNum > 0) window.open(bidLink, '_blank', 'noopener');
            }}
          >
            <label htmlFor="deal-bid" className="block font-heading text-sm font-black text-fg">
              عرضك للشروة كاملة كام؟
            </label>
            <div className="flex gap-2">
              <Input id="deal-bid" inputMode="numeric" placeholder={`مثلاً ${formatPrice(Math.round(deal.totalPrice * 0.92))}`} value={bid} onChange={(e) => setBid(e.target.value)} />
              <Button type="submit" variant="whatsapp" disabled={!bidNum}>
                ابعت العرض
              </Button>
            </div>
            <p className="text-xs text-fg-muted">العرض بيوصل للحاج على الواتساب برقم الصفقة، والرد بيكون منه شخصياً.</p>
          </form>
        ) : null}
      </div>
    </Modal>
  );
}
