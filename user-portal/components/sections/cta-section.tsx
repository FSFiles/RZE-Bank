"use client";

import { Apple, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-violet-600/15 to-blue-900/20 p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Download RZE Bank App
            </h2>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-300">
              Available on iOS & Android ·
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                4.9★ Rating
              </span>
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
  <Button
    size="lg"
    variant="secondary"
    className="bg-gradient-to-r from-[#FFF3B0] via-[#FFD700] to-[#B8860B] text-black border-0 shadow-xl shadow-yellow-600/40 hover:from-[#FFE58F] hover:via-[#FACC15] hover:to-[#C99700] transition-all duration-300"
  >
    <PlayCircle className="mr-2 h-5 w-5" />
    Google Play
  </Button>

  <Button
    size="lg"
    variant="secondary"
    className="bg-gradient-to-r from-[#FFF3B0] via-[#FFD700] to-[#B8860B] text-black border-0 shadow-xl shadow-yellow-600/40 hover:from-[#FFE58F] hover:via-[#FACC15] hover:to-[#C99700] transition-all duration-300"
  >
    <Apple className="mr-2 h-5 w-5" />
    App Store
  </Button>
</div>
          </div>
        </div>
      </div>
    </section>
  );
}
