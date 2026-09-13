"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_METHODS } from "@/lib/constants/payments";

const PAYMENT_STATS = [
  { label: "Transaction Fee", value: "₹0" },
  { label: "Transfer Speed", value: "2 sec" },
  { label: "Success Rate", value: "100%" },
];

const TAGS: Record<string, string> = {
  upi: "Most Used",
  imps: "Instant",
};

export function PaymentsSection() {
  return (
    <section className="relative py-24">
      <div className="container">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="section-eyebrow">Digital Payments</span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pay Anyone, Anywhere, Anytime
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              RZE Bank supports all major payment methods — from UPI and QR to NEFT, RTGS, and
              bill payments. Experience the fastest, most secure payment infrastructure in
              India.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {PAYMENT_STATS.map((stat) => (
                <div key={stat.label} className="rounded-xl glass px-4 py-4 text-center">
                  <p className="font-display text-xl font-bold gradient-text sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <Button
  size="lg"
  className="mt-8 bg-gradient-to-r from-[#FFF3B0] via-[#FFD700] to-[#B8860B] text-white shadow-xl shadow-yellow-600/40 hover:from-[#FFE58F] hover:via-[#FACC15] hover:to-[#C99700] transition-all duration-300"
>
  Start Paying Now
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method, i) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
                className="relative rounded-xl glass p-4 text-center transition-all hover:-translate-y-1 hover:border-blue-500/30"
              >
                {TAGS[method.id] && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px]">
                    {TAGS[method.id]}
                  </Badge>
                )}
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                  <method.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{method.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{method.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
