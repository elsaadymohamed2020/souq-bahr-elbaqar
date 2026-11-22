import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_OFFERS,
  DEFAULT_DEALS,
  DEFAULT_CONVERSATIONS,
  DEFAULT_CUSTOMERS,
  DEFAULT_INVOICES,
  DEFAULT_ACTIVITIES,
  BASE_FINANCIALS,
  CATEGORIES,
  BRANCHES,
  OFFICIAL_NUMBERS,
  SHIPPING_ZONES,
  ITEM_SIZES,
  CATEGORY_PRESETS,
} from '../data/initialData';

const AppContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'bb_products',
  OFFERS: 'bb_offers',
  DEALS: 'bb_deals',
  INVOICES: 'bb_invoices',
  CUSTOMERS: 'bb_customers',
  CONVERSATIONS: 'bb_conversations',
  ACTIVITIES: 'bb_activities',
  CART: 'bb_cart',
  WISHLIST: 'bb_wishlist',
  RECENT: 'bb_recent',
};

const THEME_KEY = 'bb_theme';

export const DEFAULT_FILTERS = {
  preset: 'all',
  cat: 'all',
  q: '',
  branch: 'all',
  status: 'all', // 'all' | 'avail'
  onlyDiscount: false,
  maxPrice: null,
  wishlistOnly: false,
  sort: 'featured', // featured | newest | price-asc | price-desc | discount
};

export const STORE_HOURS = { open: 9, close: 17 };

function getStored(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage may be unavailable (private mode); the demo still works in memory
  }
}

const codeNum = (code) => Number(String(code || '').split('-')[1]) || 0;

export function AppProvider({ children }) {
  // Navigation & View State
  const [viewMode, setViewMode] = useState('store'); // 'store' | 'admin'
  const [adminTab, setAdminTab] = useState('home'); // home | inbox | products | deals | offers | crm | erp

  // Theme
  const [theme, setTheme] = useState(() => getStored(THEME_KEY, 'light'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setStored(THEME_KEY, theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Data States (persisted to localStorage)
  const [products, setProducts] = useState(() => {
    const stored = getStored(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    return stored.map((p) => {
      const def = DEFAULT_PRODUCTS.find((d) => d.code === p.code);
      return def?.img ? { ...p, img: def.img } : p;
    });
  });
  const [offers, setOffers] = useState(() => getStored(STORAGE_KEYS.OFFERS, DEFAULT_OFFERS));
  const [invoices, setInvoices] = useState(() => getStored(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES));
  const [customers, setCustomers] = useState(() => getStored(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS));
  const [conversations, setConversations] = useState(() => getStored(STORAGE_KEYS.CONVERSATIONS, DEFAULT_CONVERSATIONS));
  const [activities, setActivities] = useState(() => getStored(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES));
  const [wishlist, setWishlist] = useState(() => getStored(STORAGE_KEYS.WISHLIST, []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => getStored(STORAGE_KEYS.RECENT, []));

  // Active chat in admin inbox
  const [activeConvId, setActiveConvId] = useState('c1');

  // Modals & Popups
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [addProductPrefill, setAddProductPrefill] = useState(null);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [waitingCustomerAlert, setWaitingCustomerAlert] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [quickViewCode, setQuickViewCode] = useState(null);

  // Storefront catalog filters (shared by header search, category strip, quick answers, catalog)
  const [catalogFilters, setCatalogFilters] = useState(DEFAULT_FILTERS);
  const [priceHighlight, setPriceHighlight] = useState(0);

  // Bulk Deals & Lots State
  const [deals, setDeals] = useState(() => {
    const stored = getStored(STORAGE_KEYS.DEALS, DEFAULT_DEALS);
    return stored.map((d) => {
      const def = DEFAULT_DEALS.find((item) => item.code === d.code);
      return def?.img ? { ...d, img: def.img } : d;
    });
  });
  const [selectedDealForDetail, setSelectedDealForDetail] = useState(null);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);

  // Shopping Cart & Payments State
  const [cart, setCart] = useState(() => getStored(STORAGE_KEYS.CART, []));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);
  const [cartBump, setCartBump] = useState(0);

  // Toasts (stack of up to 3)
  const [toasts, setToasts] = useState([]);

  // Store Hours (Africa/Cairo timezone 9:00 AM - 5:00 PM)
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    const checkOpenStatus = () => {
      try {
        const hour = Number(
          new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Africa/Cairo' }).format(new Date())
        );
        setIsOpenNow(hour >= STORE_HOURS.open && hour < STORE_HOURS.close);
      } catch (err) {
        setIsOpenNow(true);
      }
    };
    checkOpenStatus();
    const timer = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  // Persist
  useEffect(() => setStored(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => setStored(STORAGE_KEYS.OFFERS, offers), [offers]);
  useEffect(() => setStored(STORAGE_KEYS.INVOICES, invoices), [invoices]);
  useEffect(() => setStored(STORAGE_KEYS.CUSTOMERS, customers), [customers]);
  useEffect(() => setStored(STORAGE_KEYS.CONVERSATIONS, conversations), [conversations]);
  useEffect(() => setStored(STORAGE_KEYS.ACTIVITIES, activities), [activities]);
  useEffect(() => setStored(STORAGE_KEYS.CART, cart), [cart]);
  useEffect(() => setStored(STORAGE_KEYS.DEALS, deals), [deals]);
  useEffect(() => setStored(STORAGE_KEYS.WISHLIST, wishlist), [wishlist]);
  useEffect(() => setStored(STORAGE_KEYS.RECENT, recentlyViewed), [recentlyViewed]);

  // ---------------------------------------------------------------
  // App events (used by the guided tour to wait for real actions)
  // ---------------------------------------------------------------
  const listenersRef = useRef(new Set());
  const onAppEvent = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);
  const emitAppEvent = useCallback((type, payload) => {
    listenersRef.current.forEach((fn) => {
      try {
        fn(type, payload);
      } catch (e) {
        // a listener failing must never break the app
      }
    });
  }, []);

  // Toast helpers
  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const showToast = useCallback((message, type = 'success', opts = {}) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type, action: opts.action }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), opts.duration || (opts.action ? 5200 : 3600));
    return id;
  }, []);

  // Confetti trigger
  const triggerConfetti = () => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#1F6FEB', '#10B981', '#0B152B'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // ignore
    }
  };

  const getTodayIso = () => new Date().toISOString().slice(0, 10);

  // Offers & Pricing logic
  const getOfferForProduct = (product) => {
    if (!product) return null;
    const today = getTodayIso();
    const liveOffers = offers.filter(
      (o) =>
        o.active &&
        o.ends >= today &&
        (o.scope === 'all' ||
          (o.scope === 'cat' && o.target === product.cat) ||
          (o.scope === 'item' && o.target === product.code))
    );
    if (!liveOffers.length) return null;
    return liveOffers.reduce((best, curr) => (curr.pct > best.pct ? curr : best));
  };

  const getFinalPrice = (product) => {
    const offer = getOfferForProduct(product);
    if (!offer) return product.price;
    return Math.round((product.price * (100 - offer.pct)) / 100 / 50) * 50;
  };

  const formatPrice = (num) => Number(num || 0).toLocaleString('en-US');

  const getActiveOfferEnd = () => {
    const today = getTodayIso();
    const live = offers.filter((o) => o.active && o.ends >= today).sort((a, b) => (a.ends > b.ends ? 1 : -1));
    return live[0]?.ends || null;
  };

  // WhatsApp prefilled message builder
  const getWhatsAppBookingLink = (product) => {
    const finalPrice = getFinalPrice(product);
    const text = `السلام عليكم يا حاج، عايز أحجز القطعة ${product.code} (${product.name}) بسعر ${formatPrice(finalPrice)} جنيه، فرع ${product.branch}. هل لسه متاحة؟`;
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  const getGeneralWhatsAppLink = (customText) => {
    const text = customText || 'السلام عليكم، عندي استفسار بخصوص المعروض في سوق بحر البقر الكبير';
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  // Catalog filter helpers
  const updateCatalogFilters = (patch) => setCatalogFilters((prev) => ({ ...prev, ...patch }));
  const resetCatalogFilters = () => setCatalogFilters((prev) => ({ ...DEFAULT_FILTERS, branch: prev.branch }));
  const applyCategoryPreset = (presetId) => {
    const preset = CATEGORY_PRESETS.find((p) => p.id === presetId);
    if (!preset || !preset.filters) return;
    setCatalogFilters((prev) => ({ ...DEFAULT_FILTERS, branch: prev.branch, sort: prev.sort, ...preset.filters, preset: preset.id }));
  };
  const flashPrices = () => setPriceHighlight((n) => n + 1);

  // Quick view & recently viewed
  const openQuickView = (code) => {
    setQuickViewCode(code);
    setRecentlyViewed((prev) => [code, ...prev.filter((c) => c !== code)].slice(0, 10));
    emitAppEvent('product:viewed', { code });
  };
  const closeQuickView = () => setQuickViewCode(null);
  const quickViewProduct = quickViewCode ? products.find((p) => p.code === quickViewCode) || null : null;

  // Wishlist
  const toggleWishlist = (code) => {
    setWishlist((prev) => {
      const has = prev.includes(code);
      showToast(has ? 'اتشالت من المفضلة' : 'اتحفظت في المفضلة', 'info');
      return has ? prev.filter((c) => c !== code) : [code, ...prev];
    });
  };

  // Product Actions
  const openAddProduct = (prefill = null) => {
    setAddProductPrefill(prefill);
    setIsAddProductOpen(true);
  };

  const addProduct = (newProduct) => {
    const nums = products.map((p) => codeNum(p.code));
    const nextCode = `BB-${Math.max(400, ...nums) + 1}`;

    const created = {
      ...newProduct,
      code: nextCode,
      status: 'avail',
      isNew: true,
      addedAt: Date.now(),
      price: Number(newProduct.price),
      cost: Number(newProduct.cost) || Math.round(Number(newProduct.price) * 0.7),
    };

    setProducts((prev) => [created, ...prev]);

    setActivities((prev) => [
      { id: Date.now(), type: 'box', title: `اتنزل ${created.name} على الموقع`, time: 'الآن', branch: created.branch, color: 'blue' },
      ...prev,
    ]);

    showToast(`القطعة ${nextCode} نزلت على الموقع`);
    triggerConfetti();

    // Killer demo feature: check if any waiting CRM customers match this keyword
    const matched = customers.filter((c) => c.kw && created.name.toLowerCase().includes(c.kw.toLowerCase()));

    if (matched.length > 0) {
      setWaitingCustomerAlert({ product: created, matchedCustomers: matched });
    }
    emitAppEvent('product:added', { product: created, matched });
    return created;
  };

  const updateProductStatus = (code, newStatus, { silent } = {}) => {
    setProducts((prev) => prev.map((p) => (p.code === code ? { ...p, status: newStatus } : p)));
    const label = newStatus === 'avail' ? 'متاح' : newStatus === 'held' ? 'محجوز' : 'اتباع';
    if (!silent) showToast(`القطعة ${code} بقت "${label}" على الموقع`);
    emitAppEvent('product:status', { code, status: newStatus });
  };

  const deleteProduct = (code) => {
    const removed = products.find((p) => p.code === code);
    const index = products.findIndex((p) => p.code === code);
    setProducts((prev) => prev.filter((p) => p.code !== code));
    showToast(`اتمسح ${code} من المعروض`, 'info', {
      action: removed
        ? {
            label: 'تراجع',
            onClick: () =>
              setProducts((prev) => {
                if (prev.some((p) => p.code === code)) return prev;
                const next = [...prev];
                next.splice(Math.max(0, index), 0, removed);
                return next;
              }),
          }
        : undefined,
    });
  };

  // Offer Actions
  const addOffer = (offerData) => {
    const newOffer = { id: 'o' + Date.now(), ...offerData, pct: Number(offerData.pct), active: true };
    setOffers((prev) => [newOffer, ...prev]);
    showToast(`العرض اشتغل بخصم ${newOffer.pct}%`);
    triggerConfetti();
  };

  const toggleOffer = (id) => {
    const target = offers.find((o) => o.id === id);
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o)));
    if (target) showToast(!target.active ? 'العرض اشتغل والأسعار اتحدثت على الموقع' : 'العرض اتوقف مؤقتاً', target.active ? 'info' : 'success');
  };

  const deleteOffer = (id) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    showToast('العرض اتمسح', 'info');
  };

  // Invoices & Sales Actions
  const recordSale = (saleData) => {
    const product = products.find((p) => p.code === saleData.productCode);
    const salePrice = Number(saleData.price) || (product ? getFinalPrice(product) : 0);
    const cost = product ? product.cost : Math.round(salePrice * 0.7);
    const nextInvoiceNum = Math.max(1041, ...invoices.map((i) => i.n)) + 1;

    const newInvoice = {
      n: nextInvoiceNum,
      item: product ? product.name : saleData.itemName,
      cust: saleData.custName || 'عميل',
      br: product ? product.branch : 'الصالحية',
      price: salePrice,
      cost,
      pay: saleData.payMethod || 'كاش',
      d: 'اليوم',
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    if (product) updateProductStatus(product.code, 'sold', { silent: true });

    setActivities((prev) => [
      { id: Date.now(), type: 'cash', title: `اتسجل بيع ${newInvoice.item} · فاتورة #${nextInvoiceNum}`, time: 'الآن', branch: newInvoice.br, color: 'amber' },
      ...prev,
    ]);

    showToast(`فاتورة #${nextInvoiceNum} اتعملت، والقطعة بقت "اتباع" على الموقع`);
    triggerConfetti();
  };

  // Inbox & Chat Actions
  const sendMessage = (convoId, text, from = 'me') => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convoId
          ? { ...c, unread: from === 'c' ? c.id !== activeConvId : false, time: 'الآن', msgs: [...c.msgs, { f: from, t: text.trim(), tm: timeStr }] }
          : c
      )
    );
  };

  const markConversationRead = (convoId) => {
    setConversations((prev) => prev.map((c) => (c.id === convoId ? { ...c, unread: false } : c)));
  };

  const updateConversationMeta = (convoId, field, value) => {
    setConversations((prev) => prev.map((c) => (c.id === convoId ? { ...c, [field]: value } : c)));
  };

  // CRM
  const updateCustomerSegment = (id, seg) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, seg } : c)));
    setSelectedCustomer((prev) => (prev && prev.id === id ? { ...prev, seg } : prev));
    showToast('اتنقل العميل للمرحلة الجديدة');
  };

  const notifyWaitingCustomers = (alert) => {
    const data = alert || waitingCustomerAlert;
    if (!data) return;
    const ids = data.matchedCustomers.map((c) => c.id);
    setCustomers((prev) =>
      prev.map((c) =>
        ids.includes(c.id)
          ? { ...c, last: 'الآن', tl: [[`اتبعتله واتساب إن ${data.product.name} وصل (${data.product.code})`, 'الآن'], ...(c.tl || [])] }
          : c
      )
    );
    setActivities((prev) => [
      {
        id: Date.now(),
        type: 'wa',
        title: `اتبعت واتساب لـ ${data.matchedCustomers.map((c) => c.name).join(' و ')} إن ${data.product.name} وصل`,
        time: 'الآن',
        branch: data.product.branch,
        color: 'emerald',
      },
      ...prev,
    ]);
    setWaitingCustomerAlert(null);
    showToast(`الرسالة وصلت لـ ${data.matchedCustomers[0]?.name || 'العميل'} على الواتساب`);
    emitAppEvent('customer:notified', data);
  };

  // Reset Demo to initial state
  const resetDemo = ({ silent } = {}) => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        // ignore
      }
    });
    setProducts(DEFAULT_PRODUCTS);
    setOffers(DEFAULT_OFFERS);
    setDeals(DEFAULT_DEALS);
    setInvoices(DEFAULT_INVOICES);
    setCustomers(DEFAULT_CUSTOMERS);
    setConversations(DEFAULT_CONVERSATIONS);
    setActivities(DEFAULT_ACTIVITIES);
    setCart([]);
    setWishlist([]);
    setRecentlyViewed([]);
    setCatalogFilters(DEFAULT_FILTERS);
    setLastCompletedOrder(null);
    setSelectedDealForDetail(null);
    setWaitingCustomerAlert(null);
    setQuickViewCode(null);
    setActiveConvId('c1');
    if (!silent) showToast('الديمو رجع لأوله، كل البيانات زي ما كانت');
  };

  // Deals & Bulk Lots Actions
  const addDeal = (newDeal) => {
    const nums = deals.map((d) => codeNum(d.code));
    const nextCode = `DEAL-${Math.max(800, ...nums) + 1}`;
    const created = {
      ...newDeal,
      code: nextCode,
      status: 'avail',
      totalPrice: Number(newDeal.totalPrice),
      estimatedRetail: Number(newDeal.estimatedRetail) || Math.round(Number(newDeal.totalPrice) * 1.3),
      deposit: Number(newDeal.deposit) || Math.round(Number(newDeal.totalPrice) * 0.1),
      items: newDeal.items || [],
      img: newDeal.img || '/images/deals/factory-lot.jpg',
    };
    setDeals((prev) => [created, ...prev]);
    setActivities((prev) => [
      { id: Date.now(), type: 'box', title: `صفقة جديدة: ${created.title} (Total بـ ${formatPrice(created.totalPrice)} ج)`, time: 'الآن', branch: created.branch, color: 'purple' },
      ...prev,
    ]);
    showToast(`الصفقة ${nextCode} نزلت على الموقع`);
    triggerConfetti();
  };

  const updateDealStatus = (code, newStatus) => {
    setDeals((prev) => prev.map((d) => (d.code === code ? { ...d, status: newStatus } : d)));
    const label = newStatus === 'avail' ? 'متاحة للمعاينة' : newStatus === 'held' ? 'جاري المعاينة' : 'اتباعت';
    showToast(`الصفقة ${code} بقت "${label}"`);

    if (newStatus === 'sold') {
      const deal = deals.find((d) => d.code === code);
      if (deal) {
        setActivities((prev) => [
          { id: Date.now(), type: 'cash', title: `صفقة #${code} اتباعت بالكامل بـ ${formatPrice(deal.totalPrice)} ج`, time: 'الآن', branch: deal.branch, color: 'emerald' },
          ...prev,
        ]);
        triggerConfetti();
      }
    }
  };

  const deleteDeal = (code) => {
    setDeals((prev) => prev.filter((d) => d.code !== code));
    showToast(`الصفقة ${code} اتمسحت`, 'info');
  };

  const getWhatsAppDealLink = (deal, messageType = 'inquire') => {
    let text = '';
    if (messageType === 'inspect') {
      text = `السلام عليكم يا حاج، أنا مهتم بالصفقة (${deal.code}: ${deal.title}) المعروضة على بعضها بسعر ${formatPrice(deal.totalPrice)} جنيه. عايز أحجز موعد للمعاينة على الطبيعة في ${deal.location} وتجربة وفحص المحتويات.`;
    } else if (messageType === 'offer') {
      text = `السلام عليكم يا حاج، بخصوص الصفقة (${deal.code}: ${deal.title}) إجمالي ${formatPrice(deal.totalPrice)} ج، عايز أقدم عرض سعر أو أتفاوض على الشروة بالكامل.`;
    } else {
      text = `السلام عليكم يا حاج، بخصوص اللوط (${deal.code}: ${deal.title}) المعروض بـ ${formatPrice(deal.totalPrice)} جنيه، هل الصفقة لسه متاحة ولا حد بيعاين فيها؟`;
    }
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  // Shopping Cart & Calculation Logic
  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.code === item.code) || item.snapshot;
      if (!product) return null;
      const finalPrice = getFinalPrice(product);
      const quantity = item.quantity || 1;
      return { product, code: item.code, quantity, finalPrice, subtotal: finalPrice * quantity };
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const addToCart = (product, quantity = 1, { openDrawer = false, silent = false } = {}) => {
    if (product.status === 'sold') {
      showToast('القطعة دي اتباعت ومش متاحة دلوقتي', 'error');
      return;
    }
    const known = products.some((p) => p.code === product.code);
    setCart((prev) => {
      const exists = prev.find((item) => item.code === product.code);
      if (exists) {
        return prev.map((item) => (item.code === product.code ? { ...item, quantity: item.quantity + quantity } : item));
      }
      const snapshot = known
        ? undefined
        : { code: product.code, name: product.name, price: product.price, img: product.img, branch: product.branch, cost: product.cost || 0, status: 'avail' };
      return [...prev, { code: product.code, quantity, snapshot }];
    });
    setCartBump((n) => n + 1);
    emitAppEvent('cart:added', { code: product.code });
    if (openDrawer) {
      setIsCartOpen(true);
    } else if (!silent) {
      showToast(`"${product.name}" اتضافت للسلة`, 'success', { action: { label: 'عرض السلة', onClick: () => setIsCartOpen(true) } });
    }
  };

  const bookDealDeposit = (deal) => {
    const depositAmount = deal.deposit || 50000;
    const depositProduct = {
      code: `DEP-${deal.code}`,
      name: `عربون حجز: ${deal.title}`,
      price: depositAmount,
      cost: 0,
      branch: deal.branch,
      status: 'avail',
      img: deal.img,
    };
    addToCart(depositProduct, 1, { openDrawer: true });
    setSelectedDealForDetail(null);
    showToast(`عربون الصفقة (${formatPrice(depositAmount)} ج) اتضاف للسلة`);
  };

  const removeFromCart = (productCode) => {
    setCart((prev) => prev.filter((item) => item.code !== productCode));
    showToast('اتشالت من السلة', 'info');
  };

  const updateCartQuantity = (productCode, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.code === productCode) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const getWhatsAppCartBookingLink = (customerInfo = {}) => {
    if (!cartItems.length) return getGeneralWhatsAppLink();
    const itemsText = cartItems
      .map((item, idx) => `${idx + 1}. ${item.product.name} (كود: ${item.product.code}) - كمية: ${item.quantity} - السعر: ${formatPrice(item.subtotal)} ج`)
      .join('\n');
    const text = `السلام عليكم يا حاج، عايز أطلب المنتجات دي من الموقع:\n\n${itemsText}\n\nالإجمالي المطلوب: ${formatPrice(cartTotal)} جنيه مصري.\nالاسم: ${customerInfo.name || 'عميل المتجر الإلكتروني'}\nرقم الموبايل: ${customerInfo.phone || ''}\nطريقة الاستلام: ${customerInfo.deliveryMethod || 'استلام من الفرع'}\nالعنوان/المدينة: ${customerInfo.address || 'بدون'}\nملاحظات: ${customerInfo.notes || 'لا يوجد'}\nهل المنتجات جاهزة للشحن أو الاستلام؟`;
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  const processPayment = ({ customerName, phone, deliveryMethod, address, paymentMethod, notes, installmentMonths, transferRef }) => {
    if (!cartItems.length) return null;

    const orderId = 'BB-ORD-' + Math.floor(100000 + Math.random() * 900000);
    let startInvoiceNum = Math.max(1041, ...invoices.map((i) => i.n));

    const newInvoices = cartItems.map((item) => {
      startInvoiceNum += 1;
      const itemCost = item.product.cost || Math.round(item.finalPrice * 0.7);
      return {
        n: startInvoiceNum,
        item: `${item.product.name} (${item.quantity > 1 ? item.quantity + ' قطع' : 'قطعة واحدة'})`,
        cust: customerName || 'عميل المتجر الإلكتروني',
        br: item.product.branch || 'الصالحية',
        price: item.subtotal,
        cost: itemCost * item.quantity,
        pay: paymentMethod || 'دفع إلكتروني',
        d: 'اليوم',
      };
    });

    const purchasedCodes = cartItems.map((ci) => ci.product.code);
    setProducts((prev) => prev.map((p) => (purchasedCodes.includes(p.code) ? { ...p, status: 'sold' } : p)));
    setInvoices((prev) => [...newInvoices, ...prev]);

    if (customerName || phone) {
      const itemNames = cartItems.map((ci) => ci.product.name).join('، ');
      setCustomers((prev) => {
        const existing = prev.find((c) => c.phone && c.phone === phone);
        if (existing) {
          return prev.map((c) =>
            c.phone === phone
              ? { ...c, seg: 'buy', spent: (c.spent || 0) + cartTotal, last: 'الآن', tl: [[`دفع أونلاين: ${itemNames}`, 'الآن'], ...(c.tl || [])] }
              : c
          );
        }
        return [
          {
            id: 'cust-' + Date.now(),
            name: customerName || 'عميل المتجر الإلكتروني',
            avatar: (customerName || 'ع').trim().charAt(0),
            gov: address || `استلام من فرع ${cartItems[0]?.product?.branch || 'الصالحية'}`,
            ch: 'web',
            seg: 'buy',
            spent: cartTotal,
            want: itemNames,
            last: 'الآن',
            phone: phone || '',
            tl: [[`دفع أونلاين: ${itemNames}`, 'الآن']],
          },
          ...prev,
        ];
      });
    }

    setActivities((prev) => [
      {
        id: Date.now(),
        type: 'cash',
        title: `طلب جديد #${orderId} اتدفع بـ ${formatPrice(cartTotal)} ج (${paymentMethod})`,
        time: 'الآن',
        branch: cartItems[0]?.product?.branch || 'الصالحية',
        color: 'emerald',
      },
      ...prev,
    ]);

    const completedOrder = {
      orderId,
      items: [...cartItems],
      total: cartTotal,
      paymentMethod,
      customerName,
      phone,
      deliveryMethod,
      address,
      notes,
      date: new Date().toLocaleDateString('ar-EG'),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      invoices: newInvoices.map((inv) => inv.n),
      transferRef,
      installmentMonths,
    };

    setLastCompletedOrder(completedOrder);
    setCart([]);
    triggerConfetti();
    showToast(`الدفع اتأكد والفواتير اتعملت للطلب #${orderId}`);
    emitAppEvent('order:paid', completedOrder);
    return completedOrder;
  };

  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <AppContext.Provider
      value={{
        // View modes
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        theme,
        setTheme,
        toggleTheme,

        // Data
        products,
        offers,
        deals,
        invoices,
        customers,
        conversations,
        activities,
        unreadCount,
        categories: CATEGORIES,
        branches: BRANCHES,
        officialNumbers: OFFICIAL_NUMBERS,
        baseFinancials: BASE_FINANCIALS,
        shippingZones: SHIPPING_ZONES,
        itemSizes: ITEM_SIZES,
        categoryPresets: CATEGORY_PRESETS,
        storeHours: STORE_HOURS,

        // Active items
        activeConvId,
        setActiveConvId,

        // Modals
        isAddProductOpen,
        setIsAddProductOpen,
        addProductPrefill,
        setAddProductPrefill,
        openAddProduct,
        isAddOfferOpen,
        setIsAddOfferOpen,
        isRecordSaleOpen,
        setIsRecordSaleOpen,
        selectedCustomer,
        setSelectedCustomer,
        waitingCustomerAlert,
        setWaitingCustomerAlert,
        notifyWaitingCustomers,
        selectedDealForDetail,
        setSelectedDealForDetail,
        isAddDealOpen,
        setIsAddDealOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCategorySheetOpen,
        setIsCategorySheetOpen,

        // Storefront browsing
        catalogFilters,
        setCatalogFilters,
        updateCatalogFilters,
        resetCatalogFilters,
        applyCategoryPreset,
        priceHighlight,
        flashPrices,
        quickViewProduct,
        quickViewCode,
        openQuickView,
        closeQuickView,
        recentlyViewed,
        wishlist,
        toggleWishlist,

        // Cart & Checkout
        cart,
        cartItems,
        cartCount,
        cartTotal,
        cartBump,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        lastCompletedOrder,
        setLastCompletedOrder,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getWhatsAppCartBookingLink,
        processPayment,

        // Toast & Confetti
        toasts,
        toastMessage: toasts[toasts.length - 1] || null,
        showToast,
        dismissToast,
        triggerConfetti,

        // Events
        onAppEvent,
        emitAppEvent,

        // Helpers
        isOpenNow,
        getOfferForProduct,
        getFinalPrice,
        formatPrice,
        getActiveOfferEnd,
        getWhatsAppBookingLink,
        getGeneralWhatsAppLink,

        // Actions
        addProduct,
        updateProductStatus,
        deleteProduct,
        addOffer,
        toggleOffer,
        deleteOffer,
        addDeal,
        updateDealStatus,
        deleteDeal,
        getWhatsAppDealLink,
        bookDealDeposit,
        recordSale,
        sendMessage,
        markConversationRead,
        updateConversationMeta,
        updateCustomerSegment,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
