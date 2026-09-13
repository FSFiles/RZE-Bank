"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { CERTIFICATIONS } from "@/lib/constants/certifications";
import { SectionHeading } from "@/components/section-heading";

export function CertificationsSection() {
  return (
    <section className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Certifications & Compliance"
          title="Regulated. Certified. Trusted."
          description="RZE Bank operates under the strictest regulatory oversight and holds all required certifications for a safe and compliant banking experience."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATIONS.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                  <cert.icon className="h-6 w-6" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {cert.status}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">{cert.title}</h3>
              <p className="text-xs font-medium text-blue-400">{cert.entity}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{cert.description}</p>
              <p className="mt-4 border-t border-white/10 pt-3 font-mono text-[11px] text-slate-500">
                {cert.code}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
