import { ServiceItem } from "@/types";
import {
  PiggyBank,
  Wallet,
  Landmark,
  Repeat,
  Smartphone,
  QrCode,
  Globe,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Banknote,
  UserCheck,
} from "lucide-react";

export const SERVICES: ServiceItem[] = [
  {
    id: "savings-account",
    title: "Savings Account",
    description:
      "Earn up to 7% interest with zero minimum balance. Instant account opening with full digital KYC.",
    icon: PiggyBank,
  },
  {
    id: "current-account",
    title: "Current Account",
    description:
      "Zero MAB current account with unlimited transactions, bulk payments, and GST integration.",
    icon: Wallet,
  },
  {
    id: "fixed-deposit",
    title: "Fixed Deposit",
    description: "Guaranteed returns up to 7.5% p.a. Flexible tenures from 7 days to 10 years.",
    icon: Landmark,
  },
  {
    id: "recurring-deposit",
    title: "Recurring Deposit",
    description: "Build savings habit with monthly deposits. Start from just ₹500/month.",
    icon: Repeat,
  },
  {
    id: "upi-banking",
    title: "UPI Banking",
    description: "Instant UPI payments 24×7. Send money to any UPI ID, mobile number, or account.",
    icon: Smartphone,
  },
  {
    id: "qr-banking",
    title: "QR Banking",
    description: "Generate dynamic QR codes for instant payments. Accept payments at your doorstep.",
    icon: QrCode,
  },
  {
    id: "net-banking",
    title: "Net Banking",
    description:
      "Full-featured internet banking with fund transfers, bill payments, and investment management.",
    icon: Globe,
  },
  {
    id: "mobile-banking",
    title: "Mobile Banking",
    description:
      "Award-winning mobile app with biometric login, instant alerts, and AI spending insights.",
    icon: ShieldCheck,
  },
  {
    id: "business-banking",
    title: "Business Banking",
    description:
      "Complete business banking suite with payroll, vendor payments, and working capital loans.",
    icon: Briefcase,
  },
  {
    id: "student-banking",
    title: "Student Banking",
    description:
      "Zero-fee student account with education loans, scholarship tracking, and study abroad support.",
    icon: GraduationCap,
  },
  {
    id: "salary-account",
    title: "Salary Account",
    description:
      "Premium salary account with instant salary credit alerts, zero charges, and exclusive offers.",
    icon: Banknote,
  },
  {
    id: "senior-citizen-account",
    title: "Senior Citizen Account",
    description:
      "Higher FD rates, priority banking, doorstep service, and dedicated relationship manager.",
    icon: UserCheck,
  },
];
