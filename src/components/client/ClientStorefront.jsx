import React from 'react';
import HeroBanner, { ValueStrip } from './HeroBanner';
import QuickAnswers from './QuickAnswers';
import { CategoryBento, DealsBlock, NewArrivals, RecentlyViewed } from './StoreRails';
import ProductCatalog from './ProductCatalog';
import BulkDealsSection from './BulkDealsSection';
import ShippingEstimator from './ShippingEstimator';
import BranchesSection from './BranchesSection';
import TrustSection from './TrustSection';
import Footer from './Footer';
import WhatsAppFloatingBtn from './WhatsAppFloatingBtn';
import MobileTabBar from './MobileTabBar';

/**
 * Single-page store laid out like a big marketplace:
 * banner slider, value strip, quick answers, deal of the day, departments,
 * new arrivals, full catalog with filters, lots band, shipping, branches, trust.
 */
export default function ClientStorefront() {
  return (
    <main className="min-h-screen bg-canvas">
      <HeroBanner />
      <ValueStrip />
      <QuickAnswers />
      <DealsBlock />
      <CategoryBento />
      <NewArrivals />
      <ProductCatalog />
      <RecentlyViewed />
      <BulkDealsSection />
      <ShippingEstimator />
      <BranchesSection />
      <TrustSection />
      <Footer />
      <WhatsAppFloatingBtn />
      <MobileTabBar />
    </main>
  );
}
