import { PaymentMethod } from "@/types";
import {
  Zap,
  QrCode,
  Timer,
  ArrowLeftRight,
  Landmark,
  Receipt,
  Smartphone,
  Store,
  Droplet,
  RefreshCw,
} from "lucide-react";

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "upi", title: "UPI", subtitle: "Instant 24×7 transfers", icon: Zap },
  { id: "qr", title: "QR Payments", subtitle: "Scan & pay instantly", icon: QrCode },
  { id: "imps", title: "IMPS", subtitle: "Real-time transfers", icon: Timer },
  { id: "neft", title: "NEFT", subtitle: "Bank-to-bank transfer", icon: ArrowLeftRight },
  { id: "rtgs", title: "RTGS", subtitle: "High-value transfers", icon: Landmark },
  { id: "bills", title: "Bill Payments", subtitle: "All bills in one place", icon: Receipt },
  { id: "recharge", title: "Recharge", subtitle: "Mobile & DTH recharge", icon: Smartphone },
  { id: "merchant", title: "Merchant Payments", subtitle: "Pay at any store", icon: Store },
  { id: "utility", title: "Utility Payments", subtitle: "Electricity, gas, water", icon: Droplet },
  { id: "subscriptions", title: "Subscriptions", subtitle: "Auto-pay management", icon: RefreshCw },
];
