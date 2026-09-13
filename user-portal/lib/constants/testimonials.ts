import { Testimonial, OnboardingStep, FaqItem } from "@/types";
import { UserPlus, ShieldCheck, FileCheck, CheckCircle2, IndianRupee, Rocket } from "lucide-react";

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "priya-venkataraman",
    initials: "PV",
    name: "Priya Venkataraman",
    role: "Senior Software Engineer · Bengaluru",
    quote:
      "Switched to RZE Bank after struggling with my old bank's app for 3 years. The difference is night and day — instant IMPS, smart spending insights, and the FD rates are genuinely competitive. My salary account and investments are all in one place now.",
  },
  {
    id: "arjun-mehta",
    initials: "AM",
    name: "Arjun Mehta",
    role: "Chartered Accountant · Mumbai",
    quote:
      "As a CA, I manage finances for multiple clients. RZE Bank's statement download, categorization, and tax-summary features save me hours every month. The business loan approval process was completed in 48 hours — genuinely impressive.",
  },
  {
    id: "deepa-krishnaswamy",
    initials: "DK",
    name: "Deepa Krishnaswamy",
    role: "Entrepreneur · Chennai",
    quote:
      "I was nervous about digital banking but RZE Bank's UX is so intuitive that I figured everything out without calling support. The Gold SIP and Mutual Fund features helped me start investing for the first time at 38. Highly recommend.",
  },
];

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { step: "01", title: "Enter Your Email", description: "Just your email & password to get started", icon: UserPlus },
  { step: "02", title: "Email Verification", description: "Click the link we send to confirm it's you", icon: ShieldCheck },
  { step: "03", title: "KYC Completion", description: "Add your name, Aadhaar & PAN details", icon: FileCheck },
  { step: "04", title: "Account Created", description: "Your account is ready in minutes", icon: CheckCircle2 },
  { step: "05", title: "Deposit Money", description: "Fund your account via UPI or NEFT", icon: IndianRupee },
  { step: "06", title: "Start Banking", description: "Access all features instantly", icon: Rocket },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "open-account",
    question: "How do I open a savings account with RZE Bank?",
    answer:
      'Opening an account takes less than 5 minutes. Click "Open Account", complete your KYC with Aadhaar OTP and PAN verification, and your account is activated instantly. No branch visit required.',
  },
  {
    id: "minimum-balance",
    question: "What is the minimum balance requirement for a savings account?",
    answer:
      "RZE Bank savings accounts have zero minimum balance requirements, so you never have to worry about maintenance charges regardless of your account balance.",
  },
  {
    id: "security",
    question: "How secure are my funds and personal data?",
    answer:
      "Your funds are insured up to ₹5,00,000 by DICGC, and all data is protected with 256-bit AES encryption, real-time fraud monitoring, and biometric authentication.",
  },
  {
    id: "transfer-limits",
    question: "What are the transfer limits for IMPS and UPI?",
    answer:
      "UPI transactions support up to ₹1,00,000 per transaction, while IMPS supports up to ₹5,00,000 per transaction, both available 24×7 including holidays.",
  },
  {
    id: "loan-disbursal",
    question: "How long does a personal loan disbursal take?",
    answer:
      "Personal loans are approved within 2 hours for eligible customers, with same-day disbursal directly to your RZE Bank account once approved.",
  },
  {
    id: "mutual-funds",
    question: "Can I invest in Mutual Funds directly through RZE Bank?",
    answer:
      "Yes, you can invest in 5,000+ curated mutual funds across equity, debt, and hybrid categories directly through the RZE Bank app, starting with a SIP of just ₹500/month.",
  },
];
