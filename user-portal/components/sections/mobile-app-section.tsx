"use client";

import { motion } from "framer-motion";
import {
  Apple,
  PlayCircle,
  Star,
  Send,
  Download,
  Fingerprint,
  Bell,
  CreditCard,
  QrCode,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const APP_FEATURES = [
  { title: "Instant Transfers", subtitle: "UPI & IMPS in 2 sec", icon: Send },
  { title: "Investment Tracker", subtitle: "Portfolio at a glance", icon: LineChart },
  { title: "Biometric Login", subtitle: "Face ID & fingerprint", icon: Fingerprint },
  { title: "Smart Alerts", subtitle: "Real-time notifications", icon: Bell },
  { title: "Card Controls", subtitle: "Freeze/unfreeze instantly", icon: CreditCard },
  { title: "QR Payments", subtitle: "Scan & pay anywhere", icon: QrCode },
];

export function MobileAppSection() {
  return (
    <section className="relative py-24">
      <div className="container">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="section-eyebrow">Available on iOS & Android</span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Banking in Your Pocket
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              Download the RZE Bank app and experience the future of banking. Manage accounts,
              transfer money, invest, and track your finances — all from your smartphone.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
  <Button
    size="lg"
    variant="secondary"
    className="bg-gradient-to-r from-[#FFF3B0] via-[#FFD700] to-[#B8860B] border-0 text-black shadow-xl shadow-yellow-600/40 hover:from-[#FFE58F] hover:via-[#FACC15] hover:to-[#C99700] transition-all duration-300"
  >
    <PlayCircle className="h-5 w-5" />
    <span className="flex flex-col items-start leading-tight">
      <span className="text-[10px] font-normal text-black/70">
        Get it on
      </span>
      <span className="font-semibold">
        Google Play
      </span>
    </span>
  </Button>

  <Button
    size="lg"
    variant="secondary"
    className="bg-gradient-to-r from-[#FFF3B0] via-[#FFD700] to-[#B8860B] border-0 text-black shadow-xl shadow-yellow-600/40 hover:from-[#FFE58F] hover:via-[#FACC15] hover:to-[#C99700] transition-all duration-300"
  >
    <Apple className="h-5 w-5" />
    <span className="flex flex-col items-start leading-tight">
      <span className="text-[10px] font-normal text-black/70">
        Download on the
      </span>
      <span className="font-semibold">
        App Store
      </span>
    </span>
  </Button>
</div>

            <div className="mt-7 flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-display font-bold text-white">4.9</span>
                <span className="text-xs text-slate-500">App Store</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="h-4 w-4 text-blue-400" />
                <span className="font-display font-bold text-white">2.4M+</span>
                <span className="text-xs text-slate-500">Downloads</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto aspect-[9/18.5] w-full max-w-[280px] rounded-[2.5rem] border-4 border-white/10 bg-[hsl(222,47%,8%)] p-3 shadow-2xl"
            >
              <div className="flex h-full flex-col rounded-[2rem] bg-gradient-to-b from-blue-950/60 to-[hsl(222,47%,6%)] p-4">
                <div className="flex items-center justify-between text-xs text-white">
                  <span className="font-display font-bold">RZE Bank</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px]">
                    R
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-4 shadow-lg">
                  <p className="text-[10px] text-blue-100">Balance</p>
                  <p className="mt-1 font-display text-lg font-bold text-white">₹2,84,500</p>
                  <div className="mt-3 flex gap-2">
                    <span className="flex-1 rounded-lg bg-white/15 py-1.5 text-center text-[10px] font-semibold text-white">
                      Send
                    </span>
                    <span className="flex-1 rounded-lg bg-white/15 py-1.5 text-center text-[10px] font-semibold text-white">
                      Receive
                    </span>
                    <span className="flex-1 rounded-lg bg-white/15 py-1.5 text-center text-[10px] font-semibold text-white">
                      Pay
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    { label: "Salary Credit", amount: "+₹85,000", positive: true },
                    { label: "Amazon Pay", amount: "-₹2,340", positive: false },
                    { label: "FD Interest", amount: "+₹1,250", positive: true },
                  ].map((tx) => (
                    <div
                      key={tx.label}
                      className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-[11px]"
                    >
                      <span className="text-slate-300">{tx.label}</span>
                      <span
                        className={tx.positive ? "font-semibold text-emerald-400" : "font-semibold text-red-400"}
                      >
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="absolute -right-4 top-10 hidden rounded-xl glass-strong p-3 shadow-xl sm:block">
              <QrCode className="h-8 w-8 text-blue-300" />
              <p className="mt-1 text-[9px] text-slate-400">Scan to Download</p>
              <p className="text-[9px] text-slate-500">iOS & Android</p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {APP_FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl glass p-4 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                <feature.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold text-white">{feature.title}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{feature.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
