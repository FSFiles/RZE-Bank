"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INVESTMENT_PRODUCTS } from "@/lib/constants/investments";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

const RISK_VARIANT: Record<string, "success" | "gold" | "danger" | "secondary"> = {
  "Very Low Risk": "success",
  "Low Risk": "success",
  "Low-Medium Risk": "gold",
  "Medium Risk": "gold",
  "High Risk": "danger",
};

export function InvestmentsSection() {
  return (
    <section id="investments" className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Wealth Management"
          title="Grow Your Wealth Smartly"
          description="From first-time investors to seasoned traders — RZE Bank offers investment products for every financial goal and risk appetite."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INVESTMENT_PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10",
                product.badge ? "glass-strong border-blue-500/40" : "glass hover:border-blue-500/30"
              )}
            >
              {product.badge && (
                <Badge className="absolute -top-3 left-6">{product.badge}</Badge>
              )}

              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                  <product.icon className="h-6 w-6" />
                </span>
                <Badge variant={RISK_VARIANT[product.risk]}>{product.risk}</Badge>
              </div>

              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {product.name}
              </h3>
              <p className="text-xs font-medium text-blue-400">{product.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{product.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/10 py-4 text-sm">
                <div>
                  <p className="text-[11px] text-slate-500">Min Investment</p>
                  <p className="font-semibold text-white">{product.minInvestment}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Duration</p>
                  <p className="font-semibold text-white">{product.duration}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Category</p>
                  <p className="font-semibold text-white">{product.category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Suitable for</p>
                  <p className="font-semibold text-white">{product.suitableFor}</p>
                </div>
              </div>

              <div className="mt-4 flex-1">
                <p className="text-[11px] text-slate-500">Expected Returns</p>
                <p className="font-display text-2xl font-bold gradient-text">
                  {product.expectedReturn}
                </p>
              </div>

              <Button className="mt-6 w-full">{product.cta}</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
