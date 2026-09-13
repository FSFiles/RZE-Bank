"use client";

import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants/testimonials";
import { SectionHeading } from "@/components/section-heading";

export function TestimonialsSection() {
  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Customer Stories"
          title="Trusted by Millions"
          description="Real stories from real customers across India"
        />
      </div>

      <div className="mt-14 overflow-hidden mask-fade-x">
        <div
          className="flex w-max animate-marquee gap-6"
          style={{ animationDuration: "50s" }}
        >
          {items.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="flex w-[380px] shrink-0 flex-col rounded-2xl glass p-7"
            >
              <Quote className="h-7 w-7 text-blue-500/40" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
