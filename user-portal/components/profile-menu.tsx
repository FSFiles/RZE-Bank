"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UserCog,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useRealCustomerSession } from "@/lib/supabase/use-customer-session";
import { cn } from "@/lib/utils";

export function ProfileMenu({ scrolled }: { scrolled: boolean }) {
  const { customer, logout, unreadCount } = useRealCustomerSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!customer) return null;

  const initials = `${customer.first_name[0] ?? ""}${customer.last_name[0] ?? ""}`.toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors",
          scrolled ? "hover:bg-slate-100" : "hover:bg-white/10"
        )}
      >
        {customer.profile_picture_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={customer.profile_picture_url} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--gold))]/20 text-xs font-semibold text-[hsl(var(--gold))]">
            {initials}
          </span>
        )}
        <span className={cn("text-sm font-medium", scrolled ? "text-[#0B1F4D]" : "text-white")}>
          {customer.first_name}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
            scrolled ? "text-[#0B1F4D]" : "text-white"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0B1230] shadow-2xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-medium text-white">
              {customer.first_name} {customer.last_name}
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{customer.customer_id}</p>
          </div>
          <div className="p-1.5">
            <MenuLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setOpen(false)} />
            <MenuLink href="/dashboard/profile" icon={UserCog} label="Profile" onClick={() => setOpen(false)} />
            <MenuLink href="/dashboard/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
            <MenuLink href="/dashboard/notifications" icon={Bell} label="Notifications" badge={unreadCount} onClick={() => setOpen(false)} />
          </div>
          <div className="border-t border-white/10 p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
    >
      <Icon className="h-4 w-4 text-[hsl(var(--gold))]" /> {label}
      {Boolean(badge) && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
