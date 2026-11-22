import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Heart, MapPin, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppIcon } from '../common/BrandIcons';
import { StatusBadge, Button } from '../ui';
import { iconFor } from './icons';
import { cn } from '../../lib/cn';

/**
 * Marketplace product card. Photo first, one action color.
 * variant: 'grid' (catalog) | 'rail' (horizontal rows)
 */
export default function ProductCard({ product, variant = 'grid', className, eager = false }) {
  const {
    getOfferForProduct,
    getFinalPrice,
    formatPrice,
    addToCart,
    cart,
    setIsCartOpen,
    getWhatsAppBookingLink,
    openQuickView,
    wishlist,
    toggleWishlist,
    priceHighlight,
  } = useApp();
  const reduce = useReducedMotion();

  const offer = getOfferForProduct(product);
  const finalPrice = getFinalPrice(product);
  const saved = product.price - finalPrice;
  const inCart = cart.some((c) => c.code === product.code);
  const isSold = product.status === 'sold';
  const liked = wishlist.includes(product.code);
  const Icon = iconFor(product.icon);
  const open = () => openQuickView(product.code);

  return (
    <article
      data-tour={`product-${product.code}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-[box-shadow,transform,border-color] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift',
        className
      )}
    >
      {/* Photo */}
      <button type="button" onClick={open} className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-2 text-right" aria-label={`شوف تفاصيل ${product.name}`}>
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            width="400"
            height="300"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]',
              isSold && 'grayscale-[70%] opacity-75'
            )}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-fg-subtle">
            <Icon className="h-14 w-14" aria-hidden="true" />
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 flex flex-col items-start gap-1.5">
          <StatusBadge status={product.status} size="xs" className="shadow-sm backdrop-blur" />
        </span>
        <span className="absolute bottom-2.5 right-2.5 flex gap-1.5">
          {offer && !isSold ? (
            <span className="num rounded-lg bg-amber-500 px-2 py-1 font-heading text-xs font-black text-ink shadow-sm">-{offer.pct}%</span>
          ) : null}
          {product.isNew ? <span className="rounded-lg bg-ink px-2 py-1 font-heading text-[11px] font-black text-white shadow-sm">جديد</span> : null}
        </span>
        {isSold ? (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink/80 py-1.5 text-center font-heading text-sm font-black text-white">
            اتباعت، تابعنا للجديد
          </span>
        ) : null}
      </button>

      {/* Wishlist (outside the photo button so buttons never nest) */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.code)}
        aria-pressed={liked}
        aria-label={liked ? 'شيلها من المفضلة' : 'احفظها في المفضلة'}
        className="absolute left-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-transform active:scale-90"
      >
        <Heart className={cn('h-[18px] w-[18px] transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-ink')} aria-hidden="true" />
      </button>

      {/* Body */}
      <div className={cn('flex flex-1 flex-col', variant === 'rail' ? 'p-3' : 'p-3 sm:p-4')}>
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-fg-subtle">
          <span className="num rounded-md bg-surface-2 px-1.5 py-0.5 font-bold text-fg-muted" dir="ltr">
            {product.code}
          </span>
          <span className="inline-flex min-w-0 items-center gap-0.5 truncate font-semibold">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            {product.branch}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[2.6em] font-heading text-[13px] font-bold leading-snug text-fg sm:text-sm">
          <button type="button" onClick={open} className="text-right hover:text-brand-blue dark:hover:text-blue-400">
            {product.name}
          </button>
        </h3>

        {variant === 'grid' && product.condition ? (
          <p className="mt-1 line-clamp-1 text-xs text-fg-muted">{product.condition}</p>
        ) : null}

        <div className="mt-auto pt-2.5">
          <motion.div
            key={priceHighlight}
            initial={priceHighlight && !reduce ? { backgroundColor: 'rgba(245,158,11,0.35)' } : false}
            animate={{ backgroundColor: 'rgba(245,158,11,0)' }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="-mx-1 flex flex-wrap items-baseline gap-x-2 rounded-lg px-1"
          >
            <span className={cn('num font-heading font-black text-fg', variant === 'rail' ? 'text-base' : 'text-lg sm:text-xl')}>
              {formatPrice(finalPrice)}
              <span className="mr-0.5 text-[11px] font-bold text-fg-muted">ج</span>
            </span>
            {saved > 0 ? <span className="num text-xs text-fg-subtle line-through">{formatPrice(product.price)}</span> : null}
          </motion.div>
          <div className="mt-0.5 min-h-[18px] text-[11px] font-bold">
            {saved > 0 && !isSold ? (
              <span className="num text-emerald-700 dark:text-emerald-400">هتوفر {formatPrice(saved)} ج</span>
            ) : product.status === 'avail' ? (
              <span className="text-fg-subtle">قطعة واحدة بس</span>
            ) : product.status === 'held' ? (
              <span className="text-amber-700 dark:text-amber-400">محجوزة لحد ما يعاين</span>
            ) : null}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            {inCart ? (
              <Button variant="soft" size="sm" className="flex-1" onClick={() => setIsCartOpen(true)}>
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                في السلة
              </Button>
            ) : (
              <Button variant={isSold ? 'soft' : 'primary'} size="sm" className="flex-1" disabled={isSold} onClick={() => addToCart(product)}>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {isSold ? 'اتباعت' : 'أضف للسلة'}
              </Button>
            )}
            <Button
              href={isSold ? undefined : getWhatsAppBookingLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              size="icon"
              className={cn('h-9 w-9', isSold && 'pointer-events-none opacity-40')}
              aria-label={`احجز ${product.name} على واتساب`}
              title="احجز على واتساب"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
