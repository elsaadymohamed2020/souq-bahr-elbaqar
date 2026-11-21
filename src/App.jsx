import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import DemoBanner from './components/layout/DemoBanner';
import Navbar from './components/layout/Navbar';
import ClientStorefront from './components/client/ClientStorefront';
import AdminDashboard from './components/admin/AdminDashboard';
import Toast from './components/common/Toast';
import Modals from './components/admin/Modals';
import CartDrawer from './components/cart/CartDrawer';
import PaymentModal from './components/cart/PaymentModal';

function AppContent() {
  const { viewMode } = useApp();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-amber-400 selection:text-ink">
      {/* Demo Switcher & Info Banner */}
      <DemoBanner />

      {/* Main Navbar */}
      <Navbar />

      {/* Content View: Client Storefront vs Admin Dashboard */}
      <div className="flex-1">
        {viewMode === 'store' ? <ClientStorefront /> : <AdminDashboard />}
      </div>

      {/* Common Popups, Toasts, Cart & Checkout */}
      <Toast />
      <Modals />
      <CartDrawer />
      <PaymentModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
