import React from 'react';
import HeroSection from './HeroSection';
import QuickAnswers from './QuickAnswers';
import PromotionsTicker from './PromotionsTicker';
import ProductCatalog from './ProductCatalog';
import BranchesSection from './BranchesSection';
import TrustSection from './TrustSection';
import Footer from './Footer';
import WhatsAppFloatingBtn from './WhatsAppFloatingBtn';

export default function ClientStorefront() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <HeroSection />
      <QuickAnswers />
      <PromotionsTicker />
      <ProductCatalog />
      <BranchesSection />
      <TrustSection />
      <Footer />
      <WhatsAppFloatingBtn />
    </main>
  );
}
