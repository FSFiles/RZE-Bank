"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FIXED_DEPOSIT_PRODUCTS } from "@/lib/constants/fixed-deposits";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

// --- Added per request: Fixed Deposit section (General + Senior Citizen) ---
export function FixedDepositSection() {
  return (
    <section id="fixed-deposits" className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Fixed Deposits"
          title="Secure, Guaranteed-Return Deposits"
          description="Lock in guaranteed returns with a tenure that fits your goals — with a dedicated, higher-rate plan for senior citizens."
        />

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {FIXED_DEPOSIT_PRODUCTS.map((fd, i) => (
            <motion.div
              key={fd.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10",
                fd.highlight
                  ? "glass-strong border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "glass hover:border-blue-500/30"
              )}
            >
              {fd.highlight && (
                <Badge className="absolute -top-3 left-6">Best for Seniors</Badge>
              )}

              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                <fd.icon className="h-6 w-6" />
              </span>

              <h3 className="mt-5 font-display text-xl font-semibold text-white">{fd.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{fd.description}</p>

              <div className="mt-5 border-y border-white/10 py-4">
                <p className="text-[11px] text-slate-500">Interest Rate</p>
                <p className="font-display text-3xl font-bold gradient-text">
                  {fd.interestRate}
                </p>
              </div>

              <ul className="mt-4 flex-1 space-y-2.5">
                {fd.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-slate-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button className="mt-6 w-full">Open Fixed Deposit</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
