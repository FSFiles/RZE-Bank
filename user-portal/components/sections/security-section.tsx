"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SECURITY_FEATURES, SECURITY_BADGES } from "@/lib/constants/security";
import { SectionHeading } from "@/components/section-heading";

export function SecuritySection() {
  return (
    <section id="security" className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Enterprise Security"
          title="Your Security is Our Priority"
          description="We invest more in security infrastructure than any other aspect of our platform — because your trust is the foundation of everything we build."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {SECURITY_BADGES.map((badge) => (
            <Badge key={badge} variant="secondary" className="px-4 py-2 text-xs">
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
