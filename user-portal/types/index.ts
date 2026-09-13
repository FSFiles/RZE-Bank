import { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface PaymentMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export interface BankCard {
  id: string;
  badge: string;
  badgeTone: "popular" | "free" | "enterprise" | "travel" | "students";
  title: string;
  network: "VISA" | "MC" | "RUPAY";
  cardName: string;
  benefits: string[];
  cta: string;
}

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}

export interface WhyUsItem {
  id: string;
  value: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface LoanProduct {
  id: string;
  name: string;
  rate: string;
  rateNote?: string;
  emiFrom?: string;
  maxAmount: string;
  tenure: string;
  processingFee: string;
  approvalTime: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  risk: "Very Low Risk" | "Low Risk" | "Low-Medium Risk" | "Medium Risk" | "High Risk";
  badge?: string;
  expectedReturn: string;
  minInvestment: string;
  duration: string;
  category: string;
  suitableFor: string;
  cta: string;
  icon: LucideIcon;
}

export interface FixedDepositProduct {
  id: string;
  name: string;
  interestRate: string;
  description: string;
  benefits: string[];
  icon: LucideIcon;
  highlight?: boolean;
}

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
}

export interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Certification {
  id: string;
  title: string;
  status: string;
  entity: string;
  description: string;
  code: string;
  icon: LucideIcon;
}

export interface Testimonial {
  id: string;
  initials: string;
  name: string;
  role: string;
  quote: string;
}

export interface OnboardingStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
