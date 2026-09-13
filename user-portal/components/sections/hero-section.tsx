"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Landmark,
  ArrowRight,
  Compass,
  Wifi,
  Sparkles,
  Smartphone,
  QrCode,
  Bot,
  ArrowLeftRight,
  TrendingUp,
  Lock,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HERO_STATS } from "@/lib/constants/nav";

const TRUST_BADGES = [
  { label: "256-bit SSL Encrypted", icon: Lock },
  { label: "Instant Transfers", icon: Zap },
  { label: "RBI Regulated", icon: BadgeCheck },
];

const FLOATING_CHIPS = [
  { title: "Mobile Banking", subtitle: "iOS & Android", icon: Smartphone, className: "-left-6 top-6 lg:-left-10" },
  { title: "QR Payment", subtitle: "Scan & Pay", icon: QrCode, className: "-right-4 top-20 lg:-right-8" },
  { title: "AI Assistant", subtitle: "Smart Banking", icon: Bot, className: "-left-10 top-1/2 lg:-left-14" },
  { title: "Instant Transfer", subtitle: "IMPS / UPI", icon: ArrowLeftRight, className: "-right-8 bottom-24 lg:-right-12" },
  { title: "Investments", subtitle: "Grow Wealth", icon: TrendingUp, className: "-left-4 bottom-8 lg:-left-8" },
  { title: "Secure Banking", subtitle: "256-bit SSL", icon: ShieldCheck, className: "right-4 -bottom-6 lg:right-8" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-36 lg:pb-32 lg:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:64px_64px] opacity-[0.03]" />

      <div className="container relative grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-8">
        {/* Left column */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-eyebrow"
          >
            <Sparkles className="h-3.5 w-3.5" />
            India&apos;s Most Trusted Digital Bank
          </motion.div>

          <motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.55, delay: 0.1 }}
  className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
>
  <span className="text-white">
    Smart Digital Banking
  </span>{" "}
  <span className="bg-gradient-to-r from-[#F8E27A] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
    for the Future
  </span>
</motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400"
          >
            Experience next-generation banking with AI-powered insights, instant transfers,
            smart investments, and enterprise-grade security — all in one seamless platform.
          </motion.p>

          <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.55, delay: 0.4 }}
  className="mt-9 flex flex-wrap gap-4"
>
  <Button
    asChild
    size="lg"
    className="bg-gradient-to-r from-[#FDE68A] via-[#D4AF37] to-[#B8860B] text-white shadow-xl shadow-yellow-600/40 hover:from-[#FFE58F] hover:via-[#E6C04A] hover:to-[#C99700] transition-all duration-300"
  >
    <Link href="/register">
      Open Free Account
      <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
  </Button>

  <Button asChild size="lg" variant="secondary">
    <Link href="#services">
      <Compass className="mr-2 h-4 w-4" />
      Explore Services
    </Link>
  </Button>
</motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column - card mockup */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative aspect-[1.586/1] w-full rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-800 p-7 shadow-2xl shadow-blue-900/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 font-display text-sm font-bold text-white backdrop-blur">
                  RZE
                </span>
                <p className="mt-2 font-display text-sm font-semibold tracking-wide text-white">
                  RZE Bank
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-100">
                  Premium
                </p>
                <p className="mt-0.5 font-display text-sm font-bold italic text-white">VISA</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <Wifi className="h-4 w-4 rotate-90 text-blue-100" />
              <p className="font-mono text-lg tracking-[0.2em] text-white sm:text-xl">
                •••• •••• •••• 4821
              </p>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-blue-200">Valid Thru</p>
                <p className="text-sm font-medium text-white">12/28</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Secure Active
              </div>
            </div>

            <div className="absolute -bottom-5 right-7 rounded-xl glass-strong px-3.5 py-2 text-xs text-white shadow-lg">
              <p className="font-semibold text-amber-300">Rewards</p>
              <p className="text-slate-200">4,820 pts</p>
            </div>
          </motion.div>

          {FLOATING_CHIPS.map((chip, i) => (
            <motion.div
              key={chip.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
              className={`absolute hidden animate-float items-center gap-2.5 rounded-xl glass-strong px-3.5 py-2.5 shadow-xl md:flex ${chip.className}`}
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/30 text-blue-300">
                <chip.icon className="h-4 w-4" />
              </span>
              <span>
                <p className="text-xs font-semibold text-white">{chip.title}</p>
                <p className="text-[10px] text-slate-400">{chip.subtitle}</p>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
