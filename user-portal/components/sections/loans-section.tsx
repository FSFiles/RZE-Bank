"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LOAN_PRODUCTS } from "@/lib/constants/loans";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

export function LoansSection() {
  return (
    <section id="loans" className="relative py-24">
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center">
          <SectionHeading
            eyebrow="Loan Products"
            title="Competitive Loan Interest Rates"
            description="Transparent pricing, no hidden charges — rates effective from 01 Jul 2026"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LOAN_PRODUCTS.map((loan, i) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10",
                loan.popular
                  ? "glass-strong border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "glass hover:border-blue-500/30"
              )}
            >
              {loan.popular && (
                <Badge className="absolute -top-3 left-6 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Most Popular
                </Badge>
              )}

              {loan.emiFrom && (
                <p className="text-xs text-slate-500">
                  EMI starts from{" "}
                  <span className="font-semibold text-slate-300">{loan.emiFrom}</span>
                </p>
              )}
              <h3 className="mt-2 font-display text-xl font-semibold text-white">{loan.name}</h3>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold gradient-text">{loan.rate}</span>
                <span className="text-xs text-slate-500">{loan.rateNote}</span>
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/10 py-4 text-sm">
                <div>
                  <p className="text-[11px] text-slate-500">Max Amount</p>
                  <p className="font-semibold text-white">{loan.maxAmount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Tenure</p>
                  <p className="font-semibold text-white">{loan.tenure}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Processing Fee</p>
                  <p className="font-semibold text-white">{loan.processingFee}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Approval Time</p>
                  <p className="font-semibold text-white">{loan.approvalTime}</p>
                </div>
              </div>

              <ul className="mt-4 flex-1 space-y-2.5">
                {loan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="mt-6 w-full">{loan.cta}</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
