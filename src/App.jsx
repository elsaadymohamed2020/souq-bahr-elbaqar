import React, { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TourProvider } from './context/TourContext';
import DemoBanner from './components/layout/DemoBanner';
import Navbar from './components/layout/Navbar';
import ClientStorefront from './components/client/ClientStorefront';
import Toast from './components/common/Toast';
import Modals from './components/admin/Modals';
import CartDrawer from './components/cart/CartDrawer';
import PaymentModal from './components/cart/PaymentModal';
import DealDetailModal from './components/client/DealDetailModal';
import ProductQuickView from './components/client/ProductQuickView';
import SearchOverlay from './components/client/SearchOverlay';
import TourOverlay from './components/tour/TourOverlay';
import TourLauncher from './components/tour/TourLauncher';

// The admin (charts and all) loads only when someone opens it, so the store opens faster on phones.
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

function AdminFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6" aria-busy="true" aria-label="جاري تحميل لوحة التحكم">
      <div className="skeleton h-16 w-full" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
      <div className="skeleton h-72 w-full" />
    </div>
  );
}

function AppContent() {
  const { viewMode } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [viewMode]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-fg">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:right-3 focus:top-12 focus:z-[90] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        اتخطى للمحتوى
      </a>
      <DemoBanner />
      {viewMode === 'store' ? <Navbar /> : null}

      <div id="main-content" className="flex-1">
        {viewMode === 'store' ? (
          <ClientStorefront />
        ) : (
          <Suspense fallback={<AdminFallback />}>
            <AdminDashboard />
          </Suspense>
        )}
      </div>

      {/* Overlays shared by both views */}
      <ProductQuickView />
      <DealDetailModal />
      <SearchOverlay />
      <Modals />
      <CartDrawer />
      <PaymentModal />
      <Toast />
      <TourLauncher />
      <TourOverlay />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TourProvider>
        <AppContent />
      </TourProvider>
    </AppProvider>
  );
}
