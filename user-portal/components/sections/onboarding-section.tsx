"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STEPS } from "@/lib/constants/testimonials";
import { SectionHeading } from "@/components/section-heading";

export function OnboardingSection() {
  return (
    <section className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Getting Started"
          title="Open Your Account in Minutes"
          description="Our fully digital onboarding process takes less than 5 minutes. No branch visit required."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ONBOARDING_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="relative rounded-2xl glass p-6"
            >
              <span className="font-display text-4xl font-black text-white/10">{step.step}</span>
              <span className="mt-[-2rem] flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <Button size="lg">
            Open Account Now — It&apos;s Free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-slate-500">
            No minimum balance · No hidden charges · Instant activation
          </p>
        </div>
      </div>
    </section>
  );
}
