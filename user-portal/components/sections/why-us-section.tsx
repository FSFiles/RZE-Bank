"use client";

import { motion } from "framer-motion";
import { WHY_US_ITEMS } from "@/lib/constants/why-us";
import { SectionHeading } from "@/components/section-heading";

export function WhyUsSection() {
  return (
    <section
      id="about"
      className="relative bg-white py-24"
    >
      <div className="container">
        <SectionHeading
          eyebrow="Why RZE Bank"
          title="Banking Built for Modern India"
          description="We combine the trust of traditional banking with the speed of modern fintech — designed for people who demand both security and simplicity."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.4,
                delay: (i % 3) * 0.08,
              }}
              className="rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600">
                  <item.icon className="h-6 w-6" />
                </span>

                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-blue-700">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.label}
                  </p>
                </div>
              </div>

              <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}