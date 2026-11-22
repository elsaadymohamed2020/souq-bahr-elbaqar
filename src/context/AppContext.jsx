import React, { createContext, useContext, useState, useEffect } from 'react';
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
};

function getStored(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error('Error reading localStorage for', key, e);
    return fallback;
  }
}

export function AppProvider({ children }) {
  // Navigation & View State
  const [viewMode, setViewMode] = useState('store'); // 'store' | 'admin'
  const [adminTab, setAdminTab] = useState('home'); // 'home' | 'inbox' | 'products' | 'offers' | 'crm' | 'erp'
  
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

  // Active chat in admin inbox
  const [activeConvId, setActiveConvId] = useState('c1');

  // Modals & Popups
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [waitingCustomerAlert, setWaitingCustomerAlert] = useState(null);

  // Bulk Deals & Lots State
  const [deals, setDeals] = useState(() => getStored(STORAGE_KEYS.DEALS, DEFAULT_DEALS));
  const [selectedDealForDetail, setSelectedDealForDetail] = useState(null);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);

  // Shopping Cart & Payments State
  const [cart, setCart] = useState(() => getStored(STORAGE_KEYS.CART, []));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Store Hours (Africa/Cairo timezone 9:00 AM - 5:00 PM)
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    const checkOpenStatus = () => {
      try {
        const hour = Number(
          new Intl.DateTimeFormat('en-GB', {
            hour: 'numeric',
            hourCycle: 'h23',
            timeZone: 'Africa/Cairo',
          }).format(new Date())
        );
        setIsOpenNow(hour >= 9 && hour < 17);
      } catch (err) {
        setIsOpenNow(true);
      }
    };
    checkOpenStatus();
    const timer = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
  }, [deals]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  // Confetti trigger
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#1F6FEB', '#10B981', '#6366F1'],
      });
    } catch (e) {
      // ignore
    }
  };

  // Helper date formatted
  const getTodayIso = () => new Date().toISOString().slice(0, 10);

  // Offers & Pricing logic
  const getOfferForProduct = (product) => {
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

  const formatPrice = (num) => {
    return Number(num || 0).toLocaleString('en-US');
  };

  // WhatsApp prefilled message builder
  const getWhatsAppBookingLink = (product) => {
    const finalPrice = getFinalPrice(product);
    const text = `السلام عليكم يا حاج، عايز أحجز القطعة ${product.code} (${product.name}) بسعر ${formatPrice(finalPrice)} جنيه، فرع ${product.branch}. هل لسه متاحة؟`;
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  const getGeneralWhatsAppLink = () => {
    const text = 'السلام عليكم، عندي استفسار بخصوص المعروض في سوق بحر البقر الكبير';
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  // Product Actions
  const addProduct = (newProduct) => {
    const nums = products.map((p) => Number(p.code?.split('-')[1]) || 0);
    const nextCode = `BB-${Math.max(400, ...nums) + 1}`;
    
    const created = {
      ...newProduct,
      code: nextCode,
      status: 'avail',
      isNew: true,
      price: Number(newProduct.price),
      cost: Number(newProduct.cost) || Math.round(Number(newProduct.price) * 0.7),
    };

    setProducts((prev) => [created, ...prev]);

    // Add activity
    setActivities((prev) => [
      {
        id: Date.now(),
        type: 'box',
        title: `تم تنزيل ${created.name} على الموقع`,
        time: 'الآن',
        branch: created.branch,
        color: 'blue',
      },
      ...prev,
    ]);

    showToast(`تم نشر القطعة ${nextCode} بنجاح على الموقع!`);
    triggerConfetti();

    // Killer demo feature: check if any waiting CRM customers match this keyword
    const matched = customers.filter(
      (c) => c.kw && created.name.toLowerCase().includes(c.kw.toLowerCase())
    );

    if (matched.length > 0) {
      setWaitingCustomerAlert({
        product: created,
        matchedCustomers: matched,
      });
    }
  };

  const updateProductStatus = (code, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.code === code ? { ...p, status: newStatus } : p))
    );
    const label = newStatus === 'avail' ? 'متاح' : newStatus === 'held' ? 'محجوز' : 'اتباع';
    showToast(`تم تحديث حالة القطعة ${code} إلى "${label}" على الموقع`);
  };

  const deleteProduct = (code) => {
    setProducts((prev) => prev.filter((p) => p.code !== code));
    showToast(`تم حذف المنتج ${code} من المعروض`);
  };

  // Offer Actions
  const addOffer = (offerData) => {
    const newOffer = {
      id: 'o' + Date.now(),
      ...offerData,
      pct: Number(offerData.pct),
      active: true,
    };
    setOffers((prev) => [newOffer, ...prev]);
    showToast(`تم تفعيل العرض بنجاح بنسبة ${newOffer.pct}%`);
    triggerConfetti();
  };

  const toggleOffer = (id) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updated = { ...o, active: !o.active };
          showToast(updated.active ? 'تم تشغيل العرض وتحديث الأسعار' : 'تم إيقاف العرض مؤقتاً');
          return updated;
        }
        return o;
      })
    );
  };

  const deleteOffer = (id) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    showToast('تم حذف العرض');
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
      cost: cost,
      pay: saleData.payMethod || 'كاش',
      d: 'اليوم',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Mark product as sold
    if (product) {
      updateProductStatus(product.code, 'sold');
    }

    // Add activity
    setActivities((prev) => [
      {
        id: Date.now(),
        type: 'cash',
        title: `تم تسجيل بيع ${newInvoice.item} · فاتورة #${nextInvoiceNum}`,
        time: 'الآن',
        branch: newInvoice.br,
        color: 'amber',
      },
      ...prev,
    ]);

    showToast(`تم إصدار فاتورة #${nextInvoiceNum} وتغيير حالة القطعة إلى "اتباع"!`);
    triggerConfetti();
  };

  // Inbox & Chat Actions
  const sendMessage = (convoId, text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convoId) {
          return {
            ...c,
            unread: false,
            time: 'الآن',
            msgs: [...c.msgs, { f: 'me', t: text.trim(), tm: timeStr }],
          };
        }
        return c;
      })
    );

    showToast('تم إرسال الرد للعميل');
  };

  const markConversationRead = (convoId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convoId ? { ...c, unread: false } : c))
    );
  };

  const updateConversationMeta = (convoId, field, value) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convoId ? { ...c, [field]: value } : c))
    );
  };

  // Reset Demo to initial state
  const resetDemo = () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setProducts(DEFAULT_PRODUCTS);
    setOffers(DEFAULT_OFFERS);
    setDeals(DEFAULT_DEALS);
    setInvoices(DEFAULT_INVOICES);
    setCustomers(DEFAULT_CUSTOMERS);
    setConversations(DEFAULT_CONVERSATIONS);
    setActivities(DEFAULT_ACTIVITIES);
    setCart([]);
    setLastCompletedOrder(null);
    setSelectedDealForDetail(null);
    showToast('تمت استعادة كل بيانات الديمو للوضع الأصلي!');
  };

  // Deals & Bulk Lots Actions
  const addDeal = (newDeal) => {
    const nums = deals.map((d) => Number(d.code?.split('-')[1]) || 0);
    const nextCode = `DEAL-${Math.max(800, ...nums) + 1}`;
    const created = {
      ...newDeal,
      code: nextCode,
      status: 'avail',
      totalPrice: Number(newDeal.totalPrice),
      estimatedRetail: Number(newDeal.estimatedRetail) || Math.round(Number(newDeal.totalPrice) * 1.3),
      deposit: Number(newDeal.deposit) || Math.round(Number(newDeal.totalPrice) * 0.1),
      items: newDeal.items || [],
      img: newDeal.img || '/images/products/motor.jpg',
    };
    setDeals((prev) => [created, ...prev]);

    setActivities((prev) => [
      {
        id: Date.now(),
        type: 'box',
        title: `تم إدراج صفقة جديدة: ${created.title} (شروة كـ Total: ${formatPrice(created.totalPrice)} ج)`,
        time: 'الآن',
        branch: created.branch,
        color: 'purple',
      },
      ...prev,
    ]);

    showToast(`تم نشر الصفقة ${nextCode} بنجاح!`);
    triggerConfetti();
  };

  const updateDealStatus = (code, newStatus) => {
    setDeals((prev) =>
      prev.map((d) => (d.code === code ? { ...d, status: newStatus } : d))
    );
    const label = newStatus === 'avail' ? 'متاح للمعاينة والتفاوض' : newStatus === 'held' ? 'جاري المعاينة' : 'تم بيع الصفقة';
    showToast(`تم تحديث حالة الصفقة ${code} إلى "${label}"`);

    if (newStatus === 'sold') {
      const deal = deals.find((d) => d.code === code);
      if (deal) {
        setActivities((prev) => [
          {
            id: Date.now(),
            type: 'cash',
            title: `تم بيع صفقة بالكامل #${code} بقيمة ${formatPrice(deal.totalPrice)} ج!`,
            time: 'الآن',
            branch: deal.branch,
            color: 'emerald',
          },
          ...prev,
        ]);
        triggerConfetti();
      }
    }
  };

  const deleteDeal = (code) => {
    setDeals((prev) => prev.filter((d) => d.code !== code));
    showToast(`تم حذف الصفقة ${code}`);
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

  const bookDealDeposit = (deal) => {
    const depositAmount = deal.deposit || 50000;
    const depositProduct = {
      code: `DEP-${deal.code}`,
      name: `عربون تثبيت وحجز: ${deal.title}`,
      price: depositAmount,
      cost: 0,
      branch: deal.branch,
      status: 'avail',
      img: deal.img,
    };
    addToCart(depositProduct);
    setIsCartOpen(true);
    showToast(`تمت إضافة عربون الصفقة (${formatPrice(depositAmount)} ج) إلى السلة! 🛒`);
  };

  // Shopping Cart & Calculation Logic
  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.code === item.code);
      if (!product) return null;
      const finalPrice = getFinalPrice(product);
      return {
        product,
        code: item.code,
        quantity: item.quantity || 1,
        finalPrice,
        subtotal: finalPrice * (item.quantity || 1),
      };
    })
    .filter(Boolean);

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const addToCart = (product, quantity = 1) => {
    if (product.status === 'sold') {
      showToast('عذراً، هذه القطعة تم بيعها وغير متاحة حالياً', 'error');
      return;
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.code === product.code);
      if (exists) {
        return prev.map((item) =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { code: product.code, quantity }];
    });
    showToast(`تمت إضافة "${product.name}" إلى سلة المشتريات! 🛒`);
  };

  const removeFromCart = (productCode) => {
    setCart((prev) => prev.filter((item) => item.code !== productCode));
    showToast('تم حذف المنتج من السلة');
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

  const clearCart = () => {
    setCart([]);
  };

  const getWhatsAppCartBookingLink = (customerInfo = {}) => {
    if (!cartItems.length) return getGeneralWhatsAppLink();
    const itemsText = cartItems
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.product.name} (كود: ${item.product.code}) - كمية: ${item.quantity} - السعر: ${formatPrice(item.subtotal)} ج`
      )
      .join('\n');
    const text = `السلام عليكم يا حاج، عايز أطلب المنتجات دي من الموقع:\n\n${itemsText}\n\nالإجمالي المطلوب: ${formatPrice(cartTotal)} جنيه مصري.\nالاسم: ${customerInfo.name || 'عميل المتجر الإلكتروني'}\nرقم الموبايل: ${customerInfo.phone || ''}\nطريقة الاستلام: ${customerInfo.deliveryMethod || 'استلام من الفرع'}\nالعنوان/المدينة: ${customerInfo.address || 'بدون'}\nملاحظات: ${customerInfo.notes || 'لا يوجد'}\nهل المنتجات جاهزة للشحن أو الاستلام؟`;
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  const processPayment = ({
    customerName,
    phone,
    deliveryMethod,
    address,
    paymentMethod,
    notes,
    installmentMonths,
    transferRef,
  }) => {
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

    // Mark products as sold in storefront
    const purchasedCodes = cartItems.map((ci) => ci.product.code);
    setProducts((prev) =>
      prev.map((p) =>
        purchasedCodes.includes(p.code) ? { ...p, status: 'sold' } : p
      )
    );

    // Record Invoices to ERP
    setInvoices((prev) => [...newInvoices, ...prev]);

    // Update or add customer to CRM
    if (customerName || phone) {
      setCustomers((prev) => {
        const existing = prev.find((c) => c.phone && c.phone === phone);
        if (existing) {
          return prev.map((c) =>
            c.phone === phone
              ? {
                  ...c,
                  deals: (c.deals || 0) + cartItems.length,
                  spent: (c.spent || 0) + cartTotal,
                  stage: 'won',
                  lastContact: 'اليوم (سداد أونلاين)',
                }
              : c
          );
        }
        return [
          {
            id: 'cust-' + Date.now(),
            name: customerName || 'عميل المتجر الإلكتروني',
            phone: phone || '010XXXXXXXX',
            br: cartItems[0]?.product?.branch || 'الصالحية',
            stage: 'won',
            deals: cartItems.length,
            spent: cartTotal,
            kw: cartItems.map((ci) => ci.product.name).join(', '),
            lastContact: 'اليوم (سداد أونلاين)',
          },
          ...prev,
        ];
      });
    }

    // Add activity to timeline
    setActivities((prev) => [
      {
        id: Date.now(),
        type: 'cash',
        title: `تم سداد طلبية جديدة #${orderId} بقيمة ${formatPrice(cartTotal)} ج (${paymentMethod})`,
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
    showToast(`تم تأكيد الدفع وإصدار الفواتير للطلب #${orderId} بنجاح! 🎉`, 'success');

    return completedOrder;
  };

  return (
    <AppContext.Provider
      value={{
        // View modes
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,

        // Data
        products,
        offers,
        deals,
        invoices,
        customers,
        conversations,
        activities,
        categories: CATEGORIES,
        branches: BRANCHES,
        officialNumbers: OFFICIAL_NUMBERS,
        baseFinancials: BASE_FINANCIALS,

        // Active items
        activeConvId,
        setActiveConvId,

        // Modals
        isAddProductOpen,
        setIsAddProductOpen,
        isAddOfferOpen,
        setIsAddOfferOpen,
        isRecordSaleOpen,
        setIsRecordSaleOpen,
        selectedCustomer,
        setSelectedCustomer,
        waitingCustomerAlert,
        setWaitingCustomerAlert,
        selectedDealForDetail,
        setSelectedDealForDetail,
        isAddDealOpen,
        setIsAddDealOpen,

        // Cart & Checkout
        cart,
        cartItems,
        cartCount,
        cartTotal,
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
        toastMessage,
        showToast,
        triggerConfetti,

        // Helpers
        isOpenNow,
        getOfferForProduct,
        getFinalPrice,
        formatPrice,
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
