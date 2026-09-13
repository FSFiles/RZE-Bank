import { NavLink, StatItem } from "@/types";
import { Users, IndianRupee, Activity, Landmark, Building2, Headphones } from "lucide-react";

export const NAV_LINKS: NavLink[] = [
  { label: "Personal Banking", href: "#services" },
  { label: "Business Banking", href: "#services" },
  { label: "Loans", href: "#loans" },
  { label: "Investments", href: "#investments" },
  { label: "Market", href: "#market" },
  { label: "Security", href: "#security" },
  { label: "About", href: "#about" },
];

export const HERO_STATS: StatItem[] = [
  { label: "Active Customers", value: "2.4M+", icon: Users },
  { label: "Assets Managed", value: "₹18,000 Cr+", icon: IndianRupee },
  { label: "Uptime Guarantee", value: "99.98%", icon: Activity },
  { label: "ATM Network", value: "3500+", icon: Landmark },
  { label: "Bank Branches", value: "1200+", icon: Building2 },
  { label: "Customer Support", value: "24×7", icon: Headphones },
];
