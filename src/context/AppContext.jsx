import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_OFFERS,
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
  INVOICES: 'bb_invoices',
  CUSTOMERS: 'bb_customers',
  CONVERSATIONS: 'bb_conversations',
  ACTIVITIES: 'bb_activities',
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
    setInvoices(DEFAULT_INVOICES);
    setCustomers(DEFAULT_CUSTOMERS);
    setConversations(DEFAULT_CONVERSATIONS);
    setActivities(DEFAULT_ACTIVITIES);
    showToast('تمت استعادة كل بيانات الديمو للوضع الأصلي!');
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
