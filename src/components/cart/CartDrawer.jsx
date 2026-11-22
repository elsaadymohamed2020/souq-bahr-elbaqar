import React, { forwardRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, BadgeCheck, MapPin, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Badge, Button, EmptyState, Sheet, StatusBadge } from '../ui';
import { scrollToId } from '../../lib/hooks';
import { cn } from '../../lib/cn';
import { Pieces, Thumb } from './CheckoutParts';
import { cartOriginalTotal, isDepositCode } from './checkoutUtils';

const EASE = [0.16, 1, 0.3, 1];

function QtyStepper({ value, name, onDec, onInc }) {
  const btn =
    'flex h-10 w-10 items-center justify-center rounded-lg text-fg transition-[background-color,transform] duration-150 hover:bg-surface active:scale-90 disabled:pointer-events-none disabled:opacity-35';
  return (
    <div role="group" aria-label={`كمية ${name}`} className="flex shrink-0 items-center rounded-xl border border-line bg-surface-2 p-0.5">
      <button type="button" onClick={onDec} disabled={value <= 1} aria-label="قلّل الكمية" className={btn}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="num w-7 text-center font-heading text-sm font-black text-fg" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={onInc} aria-label="زوّد الكمية" className={btn}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const CartItemRow = forwardRef(function CartItemRow({ item, onOpen }, ref) {
  const { formatPrice, updateCartQuantity, removeFromCart } = useApp();
  const reduce = useReducedMotion();
  const { product, code, quantity, finalPrice, subtotal } = item;
  const deposit = isDepositCode(code);
  const original = Number(product.price) || finalPrice;
  const saved = original - finalPrice;
  const sold = product.status === 'sold';

  const thumb = (
    <Thumb
      product={product}
      className="h-full w-full"
      imgClassName={cn('transition-transform duration-300 ease-out', !deposit && 'group-hover/thumb:scale-105', sold && 'grayscale-[70%]')}
    />
  );

  return (
    <motion.li
      ref={ref}
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 56, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ duration: 0.28, ease: EASE }}
      className="rounded-card border border-line bg-surface p-3 shadow-soft-sm"
    >
      <div className="flex gap-3">
        {deposit ? (
          <span className="aspect-[4/3] w-[92px] shrink-0 self-start overflow-hidden rounded-xl sm:w-28">{thumb}</span>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(code)}
            aria-label={`شوف تفاصيل ${product.name}`}
            className="group/thumb aspect-[4/3] w-[92px] shrink-0 self-start overflow-hidden rounded-xl sm:w-28"
          >
            {thumb}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <h3 className="line-clamp-2 min-w-0 flex-1 font-heading text-[13px] font-bold leading-snug text-fg sm:text-sm">
              {deposit ? (
                product.name
              ) : (
                <button type="button" onClick={() => onOpen(code)} className="rounded text-right transition-colors hover:text-brand-blue dark:hover:text-blue-400">
                  {product.name}
                </button>
              )}
            </h3>
            <button
              type="button"
              onClick={() => removeFromCart(code)}
              aria-label={`شيل ${product.name} من السلة`}
              title="شيل من السلة"
              className="-ml-1.5 -mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-fg-subtle transition-[background-color,color,transform] duration-150 hover:bg-red-50 hover:text-red-600 active:scale-90 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-fg-subtle">
            {deposit ? (
              <Badge tone="amber" size="xs">
                عربون حجز
              </Badge>
            ) : (
              <span className="num rounded-md bg-surface-2 px-1.5 py-0.5 font-bold text-fg-muted" dir="ltr">
                {code}
              </span>
            )}
            {product.branch ? (
              <span className="inline-flex min-w-0 items-center gap-0.5 font-semibold">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                فرع {product.branch}
              </span>
            ) : null}
            {product.status && product.status !== 'avail' ? <StatusBadge status={product.status} size="xs" /> : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="num font-heading text-base font-black text-fg">
              {formatPrice(finalPrice)} <span className="text-[11px] font-bold text-fg-muted">ج</span>
            </span>
            {saved > 0 ? (
              <span className="num text-xs text-fg-subtle line-through">
                <span className="sr-only">بدل </span>
                {formatPrice(original)}
              </span>
            ) : null}
          </div>
          {quantity > 1 ? (
            <p className="num mt-0.5 text-[11px] font-semibold text-fg-muted">
              الإجمالي {formatPrice(subtotal)} ج
            </p>
          ) : saved > 0 ? (
            <p className="num mt-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">وفّرت {formatPrice(saved)} ج</p>
          ) : null}
        </div>
        <QtyStepper value={quantity} name={product.name} onDec={() => updateCartQuantity(code, -1)} onInc={() => updateCartQuantity(code, 1)} />
      </div>
    </motion.li>
  );
});

function Suggestions({ items, onOpen }) {
  const { formatPrice, addToCart } = useApp();
  return (
    <section aria-labelledby="cart-suggest-title" className="pt-1">
      <h3 id="cart-suggest-title" className="mb-2.5 font-heading text-sm font-black text-fg">
        ممكن يعجبك كمان
      </h3>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {items.map(({ product: p, final, pct }, i) => (
          <li key={p.code} className={cn('flex flex-col overflow-hidden rounded-xl border border-line bg-surface', i === 2 && 'hidden sm:flex')}>
            <button type="button" onClick={() => onOpen(p.code)} aria-label={`شوف تفاصيل ${p.name}`} className="group/sg relative block aspect-[4/3] w-full overflow-hidden">
              <Thumb product={p} className="h-full w-full" imgClassName="transition-transform duration-300 ease-out group-hover/sg:scale-105" />
              {pct ? (
                <span className="num absolute bottom-1.5 right-1.5 rounded-md bg-amber-500 px-1.5 py-0.5 font-heading text-[10px] font-black text-ink">-{pct}%</span>
              ) : null}
            </button>
            <div className="flex flex-1 flex-col p-2">
              <p className="line-clamp-2 min-h-[2.6em] text-[11px] font-bold leading-snug text-fg">{p.name}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                <span className="num font-heading text-sm font-black text-fg">
                  {formatPrice(final)} <span className="text-[10px] font-bold text-fg-muted">ج</span>
                </span>
                {final < p.price ? <span className="num text-[10px] text-fg-subtle line-through">{formatPrice(p.price)}</span> : null}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 h-10 w-full"
                onClick={() => addToCart(p, 1, { silent: true })}
                aria-label={`أضف ${p.name} للسلة`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                أضف
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    cartItems,
    cartCount,
    cartTotal,
    formatPrice,
    clearCart,
    addToCart,
    getWhatsAppCartBookingLink,
    openQuickView,
    products,
    getFinalPrice,
    getOfferForProduct,
    viewMode,
    setViewMode,
    showToast,
  } = useApp();
  const reduce = useReducedMotion();

  const close = () => setIsCartOpen(false);
  const hasItems = cartItems.length > 0;
  const savings = Math.max(0, cartOriginalTotal(cartItems) - cartTotal);
  const soldCount = cartItems.filter((i) => i.product.status === 'sold').length;

  // A few available pieces not in the cart: same category first, then the biggest discount.
  let suggestions = [];
  if (isCartOpen) {
    const inCart = new Set(cartItems.map((i) => i.code));
    const cats = new Set(cartItems.map((i) => i.product.cat).filter(Boolean));
    suggestions = products
      .filter((p) => p.status === 'avail' && !inCart.has(p.code))
      .map((p) => {
        const final = getFinalPrice(p);
        return { product: p, final, pct: getOfferForProduct(p)?.pct || 0, score: (cats.has(p.cat) ? 2 : 0) + (final < p.price ? 1 : 0), saved: p.price - final };
      })
      .sort((a, b) => b.score - a.score || b.saved - a.saved)
      .slice(0, 3);
  }

  const openProduct = (code) => {
    close();
    openQuickView(code);
  };

  const goCheckout = () => {
    close();
    setIsCheckoutOpen(true);
  };

  const browse = () => {
    close();
    const switching = viewMode !== 'store';
    if (switching) setViewMode('store');
    setTimeout(() => scrollToId('items'), switching ? 420 : 80);
  };

  const handleClear = () => {
    const snapshot = cartItems.map(({ product, quantity }) => ({ product, quantity }));
    clearCart();
    showToast('السلة اتفضت', 'info', {
      action: {
        label: 'رجّعها',
        onClick: () => snapshot.forEach(({ product, quantity }) => addToCart(product, quantity, { silent: true })),
      },
    });
  };

  const footer = hasItems ? (
    <div className="space-y-2.5 pt-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-fg-muted">
            المجموع (<Pieces n={cartCount} />)
          </p>
          {savings > 0 ? (
            <p className="num mt-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">وفّرت {formatPrice(savings)} ج من العروض</p>
          ) : null}
        </div>
        <p className="num shrink-0 font-heading text-2xl font-black leading-none text-fg">
          {formatPrice(cartTotal)} <span className="text-xs font-bold text-fg-muted">ج</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-fg-subtle">
          <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">الشحن بيتحسب حسب المحافظة</span>
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="-my-2 -ml-2 inline-flex h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-fg-subtle transition-colors hover:bg-surface-2 hover:text-red-600 dark:hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          فضّي السلة
        </button>
      </div>

      {soldCount > 0 ? (
        <p role="alert" className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          فيه قطع اتباعت، شيلها من السلة عشان تكمّل
        </p>
      ) : null}

      <Button size="lg" block onClick={goCheckout} disabled={soldCount > 0} className="text-base">
        كمّل الشراء
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </Button>
      <Button variant="whatsapp" size="md" block href={getWhatsAppCartBookingLink()} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon className="h-[18px] w-[18px]" aria-hidden="true" />
        احجز السلة كلها على واتساب
      </Button>
    </div>
  ) : null;

  return (
    <Sheet
      isOpen={isCartOpen}
      onClose={close}
      title="سلة التسوق"
      subtitle={
        hasItems ? (
          <>
            <Pieces n={cartCount} /> في السلة
          </>
        ) : (
          'لسه مفيش حاجة في السلة'
        )
      }
      side="start"
      width="sm:max-w-[440px]"
      footer={footer}
    >
      <div className="space-y-4 px-4 py-4 sm:px-5">
        {hasItems ? (
          <>
            <div className="flex items-center justify-center gap-3 rounded-xl bg-surface-2 px-3 py-2 text-[11px] font-bold text-fg-muted">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                عاين قبل ما تدفع
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-brand-blue dark:text-blue-400" aria-hidden="true" />
                أرقام رسمية بس
              </span>
            </div>

            <ul className="relative flex flex-col gap-3" aria-label="القطع اللي في السلة">
              <AnimatePresence mode={reduce ? 'sync' : 'popLayout'} initial={false}>
                {cartItems.map((item) => (
                  <CartItemRow key={item.code} item={item} onOpen={openProduct} />
                ))}
              </AnimatePresence>
            </ul>
          </>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="السلة فاضية"
            description="شوف المعروض وضيف اللي يعجبك. تقدر تعاين أي قطعة في الفرع قبل ما تدفع."
            action={
              <Button size="md" onClick={browse}>
                تصفح المعروض
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
            }
            className="py-10"
          />
        )}

        {suggestions.length ? <Suggestions items={suggestions} onOpen={openProduct} /> : null}
      </div>
    </Sheet>
  );
}
