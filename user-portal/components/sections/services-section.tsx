"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/constants/services";
import { SectionHeading } from "@/components/section-heading";

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative bg-white pt-40 pb-24"
    >
      {/* Top Wave Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-full">
        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="block w-full h-[180px]"
        >
          <path
            fill="#ffffff"
            d="
              M0,180
              C180,145 330,95 560,105
              C760,114 940,150 1160,135
              C1290,126 1370,108 1440,88
              L1440,180
              L0,180
              Z
            "
          />
        </svg>
      </div>

      <div className="container">
        <SectionHeading
          eyebrow="Our Services"
          title="Banking Solutions for Everyone"
          description="From personal savings to enterprise banking — RZE Bank offers a complete suite of financial services tailored to your needs."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.4,
                delay: (i % 4) * 0.06,
              }}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 transition-colors group-hover:from-blue-200 group-hover:to-blue-100">
                <service.icon className="h-6 w-6" />
              </span>

              <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">
                {service.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {service.description}
              </p>

              <button className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700">
                Explore
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}