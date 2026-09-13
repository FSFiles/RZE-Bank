import { FixedDepositProduct } from "@/types";
import { Landmark, UserCheck } from "lucide-react";

// --- Added per request: General & Senior Citizen Fixed Deposit cards ---
export const FIXED_DEPOSIT_PRODUCTS: FixedDepositProduct[] = [
  {
    id: "general-fixed-deposit",
    name: "General Fixed Deposit",
    interestRate: "6.55% p.a. for 1 Year  6.80% p.a. for 2 Years",
    description: "A secure, guaranteed-return deposit for every kind of saver.",
    benefits: ["Guaranteed Returns", "Flexible Tenure", "Safe Investment", "Online Opening"],
    icon: Landmark,
  },
  {
    id: "senior-citizen-fixed-deposit",
    name: "Senior Citizen Fixed Deposit",
    interestRate: "7.05% p.a. for 1 Year   7.30% p.a. for 2 Years",
    description: "Higher rates and quarterly payouts designed for senior citizens.",
    benefits: ["Higher Interest Rate", "Quarterly Interest", "Flexible Tenure", "Secure Investment"],
    icon: UserCheck,
    highlight: true,
  },
];
