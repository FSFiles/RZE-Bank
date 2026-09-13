import { SecurityFeature } from "@/types";
import { Lock, Brain, KeyRound, Fingerprint, BellRing, BadgeCheck } from "lucide-react";

export const SECURITY_FEATURES: SecurityFeature[] = [
  {
    id: "aes-encryption",
    title: "256-bit AES Encryption",
    description:
      "Every data packet transmitted between you and RZE Bank is encrypted with military-grade AES-256 encryption — the same standard used by global financial institutions.",
    icon: Lock,
  },
  {
    id: "ai-fraud",
    title: "AI Fraud Protection",
    description:
      "Our machine learning models analyze 200+ behavioral signals in real-time to detect and block fraudulent transactions before they reach your account.",
    icon: Brain,
  },
  {
    id: "otp-2fa",
    title: "OTP & 2FA Security",
    description:
      "Every sensitive action requires OTP verification via SMS and email. Two-factor authentication adds an extra layer of protection to your account.",
    icon: KeyRound,
  },
  {
    id: "biometric",
    title: "Biometric Authentication",
    description:
      "Login with your fingerprint or face ID on mobile devices. Biometric data is stored locally on your device — never on our servers.",
    icon: Fingerprint,
  },
  {
    id: "monitoring",
    title: "Real-time Monitoring",
    description:
      "Instant push notifications and SMS alerts for every transaction. Suspicious activity triggers immediate account freeze and customer notification.",
    icon: BellRing,
  },
  {
    id: "compliance",
    title: "RBI & PCI DSS Compliant",
    description:
      "Fully regulated by the Reserve Bank of India and certified to PCI DSS Level 1 — the highest standard for payment card data security globally.",
    icon: BadgeCheck,
  },
];

export const SECURITY_BADGES = [
  "RBI Regulated",
  "PCI DSS Level 1",
  "ISO 27001 Certified",
  "SOC 2 Type II",
  "GDPR Compliant",
];
