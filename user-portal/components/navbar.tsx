"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, LayoutDashboard, UserCog, SettingsIcon, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants/nav";
import { useScrolled } from "@/hooks/use-scrolled";
import { useRealCustomerSession } from "@/lib/supabase/use-customer-session";
import { ProfileMenu } from "@/components/profile-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";

export function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const { customer, logout } = useRealCustomerSession();
  const isLoggedIn = Boolean(customer);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
       scrolled
  ? "navbar-glass shadow-lg shadow-black/20"
  : "bg-transparent"
      )}
    >
      <nav className="container flex h-[4.5rem] items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
       <img
  src="/images/1.png"
  alt="RZE Bank Logo"
  className="h-20 w-30"
/>

         <span
  className={cn(
    "font-display text-lg font-bold tracking-tight transition-colors duration-300",
    scrolled
      ? "bg-gradient-to-r from-[#F8E27A] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent"
      : "text-white"
  )}
>
  RZE Bank
</span>
        </Link>

        {/* Desktop Navigation */}
        {/* Desktop Navigation - Show only before login */}
{!isLoggedIn && (
  <div className="hidden items-center gap-1 lg:flex">
    {!isLoggedIn &&
  NAV_LINKS.map((link) => (
      <Link
        key={link.label}
        href={link.href}
        className={cn(
          "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-300",
          scrolled
            ? "text-[#0B1F4D] hover:text-blue-700 hover:bg-slate-100"
            : "text-slate-300 hover:text-white hover:bg-white/5"
        )}
      >
        {link.label}
      </Link>
    ))}
  </div>
)}

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <ProfileMenu scrolled={scrolled} />
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "transition-colors duration-300",
                  scrolled
                    ? "text-[#0B1F4D] hover:bg-slate-100"
                    : "text-white hover:bg-white/10"
                )}
              >
                <Link href="/login">Login</Link>
              </Button>

              <Button asChild variant="gold" size="sm">
                <Link href="/register">Open Account</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors lg:hidden",
                scrolled
                  ? "bg-slate-100 text-[#0B1F4D]"
                  : "glass text-white"
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>

          <SheetContent>
            <div className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.label}>
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#0B1F4D]"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 pb-1">
                      <p className="text-sm font-semibold text-[#0B1F4D]">
                        {customer!.first_name} {customer!.last_name}
                      </p>
                      <p className="text-xs font-mono text-slate-500">{customer!.customer_id}</p>
                    </div>
                    <SheetClose asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0B1F4D]"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0B1F4D]"
                      >
                        <UserCog className="h-4 w-4" /> Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0B1F4D]"
                      >
                        <SettingsIcon className="h-4 w-4" /> Settings
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/dashboard/notifications"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0B1F4D]"
                      >
                        <Bell className="h-4 w-4" /> Notifications
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="ghost" className="text-[#0B1F4D] hover:bg-slate-100">
                        <Link href="/login">Login</Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button asChild className="bg-[#D4AF37] text-[#0B1F4D] hover:bg-[#C19A2E]">
                        <Link href="/register">Open Account</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}