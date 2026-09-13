"use client";

import { motion } from "framer-motion";
import { Check, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BANK_CARDS } from "@/lib/constants/cards";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

const NETWORK_GRADIENT: Record<string, string> = {
  VISA: "from-blue-600 via-blue-700 to-violet-800",
  MC: "from-amber-500 via-orange-600 to-rose-700",
  RUPAY: "from-emerald-600 via-teal-700 to-cyan-800",
};

const BADGE_VARIANT: Record<string, "default" | "success" | "gold" | "secondary"> = {
  popular: "default",
  free: "success",
  enterprise: "secondary",
  travel: "gold",
  students: "success",
};

export function CardsSection() {
  return (
    <section className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Cards"
          title="Premium Credit & Debit Cards"
          description="Choose from our range of premium cards — each designed to reward your lifestyle with exclusive benefits, cashback, and privileges."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BANK_CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center justify-between">
                <Badge variant={BADGE_VARIANT[card.badgeTone]}>{card.badge}</Badge>
                <span className="text-xs text-slate-500">{card.title}</span>
              </div>

              <div
                className={cn(
                  "relative mt-5 aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br p-5 shadow-xl",
                  NETWORK_GRADIENT[card.network]
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-white/80">
                    •••• •••• •••• 4821
                  </span>
                  <Wifi className="h-4 w-4 rotate-90 text-white/70" />
                </div>
                <p className="mt-4 text-[10px] text-white/70">VALID THRU</p>
                <p className="text-sm font-medium text-white">12/28</p>
                <p className="absolute bottom-4 right-5 font-display text-base font-black italic text-white">
                  {card.network === "VISA" ? "VISA" : card.network === "MC" ? "MC" : "RUPAY"}
                </p>
              </div>

              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {card.cardName}
              </h3>

              <ul className="mt-4 space-y-2.5">
                {card.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-slate-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button className="mt-6 w-full">{card.cta}</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
