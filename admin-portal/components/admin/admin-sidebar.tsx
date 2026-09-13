"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ArrowLeftRight,
  BarChart3,
  ShieldCheck,
  Landmark,
  HandCoins,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/deposits", label: "Deposits", icon: Landmark },
  { href: "/loans", label: "Loans", icon: HandCoins },
  { href: "/requests", label: "All Requests", icon: ClipboardList },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#070B1A]">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30">
          <ShieldCheck className="h-4.5 w-4.5 text-[hsl(var(--gold))]" />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-white">RZE Bank</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-[11px] text-muted-foreground">RZE Bank Admin Portal v1.0</p>
      </div>
    </aside>
  );
}
