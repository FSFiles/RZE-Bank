import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat-widget";

import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { PaymentsSection } from "@/components/sections/payments-section";
import { CardsSection } from "@/components/sections/cards-section";
import { MarketTickerSection } from "@/components/sections/market-ticker-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { TradingChartSection } from "@/components/sections/trading-chart-section";
import { LoansSection } from "@/components/sections/loans-section";
import { InvestmentsSection } from "@/components/sections/investments-section";
import { FixedDepositSection } from "@/components/sections/fixed-deposit-section";
import { EmiCalculatorSection } from "@/components/sections/emi-calculator-section";
import { MobileAppSection } from "@/components/sections/mobile-app-section";
import { NewsSection } from "@/components/sections/news-section";
import { SecuritySection } from "@/components/sections/security-section";
import { CertificationsSection } from "@/components/sections/certifications-section";
import { FraudAlertSection } from "@/components/sections/fraud-alert-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { OnboardingSection } from "@/components/sections/onboarding-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaSection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <HeroSection />
        <ServicesSection />
        <PaymentsSection />
        <CardsSection />
        <MarketTickerSection />
        <WhyUsSection />
        <TradingChartSection />
        <LoansSection />
        <InvestmentsSection />
        {/* Added per request: General & Senior Citizen Fixed Deposit cards */}
        <FixedDepositSection />
        <EmiCalculatorSection />
        <MobileAppSection />
        <NewsSection />
        <SecuritySection />
        <CertificationsSection />
        <FraudAlertSection />
        <TestimonialsSection />
        <OnboardingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
