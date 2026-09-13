"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { MARKET_ASSETS } from "@/lib/constants/market";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

export function MarketTickerSection() {
  const tickerItems = [...MARKET_ASSETS, ...MARKET_ASSETS];

  return (
    <section id="market" className="relative py-24">
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <SectionHeading
            eyebrow="Live Market"
            title="Financial Market Overview"
            description="Real-time rates for commodities, currencies, crypto, and indices"
            align="left"
            className="max-w-none"
          />
          <div className="flex shrink-0 items-center gap-2 rounded-full glass px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-red-400">LIVE</span>
          </div>
        </div>

        {/* Scrolling marquee */}
        <div className="mt-10 overflow-hidden rounded-2xl glass py-4 mask-fade-x">
          <div className="flex w-max animate-marquee gap-8">
            {tickerItems.map((asset, i) => (
              <div key={`${asset.id}-${i}`} className="flex items-center gap-2 whitespace-nowrap px-2 text-sm">
                <span className="font-semibold text-white">{asset.symbol}</span>
                <span className="text-slate-400">{asset.price}</span>
                <span
                  className={cn(
                    "font-semibold",
                    asset.positive ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {asset.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset cards grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {MARKET_ASSETS.slice(0, 5).map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl glass p-4 transition-all hover:-translate-y-1 hover:border-blue-500/30"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {asset.symbol}
              </p>
              <p className="mt-1 text-xs text-slate-500">{asset.name}</p>
              <p className="mt-2 font-display text-base font-bold text-white">{asset.price}</p>
              <div
                className={cn(
                  "mt-1.5 flex items-center gap-1 text-xs font-semibold",
                  asset.positive ? "text-emerald-400" : "text-red-400"
                )}
              >
                {asset.positive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {asset.change}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-right text-xs text-slate-500">
          Last updated: 13 Jul 2026, 03:03 AM
        </p>
      </div>
    </section>
  );
}
