import { WhyUsItem } from "@/types";
import { Users, Zap, Headphones, IndianRupee, Sparkles, ShieldCheck } from "lucide-react";

export const WHY_US_ITEMS: WhyUsItem[] = [
  {
    id: "trusted",
    value: "2.4M+",
    label: "Customers",
    title: "Trusted by Millions",
    description:
      "2.4 million+ customers trust RZE Bank for their daily banking, investments, and financial goals.",
    icon: Users,
  },
  {
    id: "speed",
    value: "2 sec",
    label: "Transfer Speed",
    title: "Fast Banking",
    description:
      "Transfers in under 2 seconds. Account opening in 5 minutes. Loan approval in 2 hours.",
    icon: Zap,
  },
  {
    id: "support",
    value: "24×7",
    label: "Availability",
    title: "24×7 Support",
    description:
      "Round-the-clock customer support via chat, call, and video. Average response time under 2 minutes.",
    icon: Headphones,
  },
  {
    id: "fees",
    value: "₹0",
    label: "Hidden Fees",
    title: "Lowest Charges",
    description:
      "Zero maintenance fees, free UPI transactions, and the most competitive interest rates in the industry.",
    icon: IndianRupee,
  },
  {
    id: "ai",
    value: "200+",
    label: "AI Signals",
    title: "AI Banking",
    description:
      "AI-powered spending insights, fraud detection, investment recommendations, and smart alerts.",
    icon: Sparkles,
  },
  {
    id: "secure",
    value: "99.98%",
    label: "Uptime",
    title: "Secure Transactions",
    description:
      "Military-grade 256-bit encryption, biometric authentication, and real-time fraud monitoring.",
    icon: ShieldCheck,
  },
];
