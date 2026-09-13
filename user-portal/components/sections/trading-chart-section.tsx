"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"] as const;

const INDEX_CARDS = [
  { id: "nifty", label: "NIFTY 50", change: "+0.63%", positive: true },
  { id: "sensex", label: "SENSEX", change: "+0.71%", positive: true },
  { id: "btc", label: "BTC/INR", change: "+2.34%", positive: true },
  { id: "gold", label: "GOLD", change: "+0.42%", positive: true },
];

function generateSeries(seed: number, points: number) {
  let value = 23800;
  const data: { t: number; v: number }[] = [];

  for (let i = 0; i < points; i++) {
    const wave = Math.sin((i + seed) * 0.4) * 60;
    const drift = i * (seed % 3 === 0 ? 3.2 : 2.1);

    value = 23800 + wave + drift;

    data.push({
      t: i,
      v: Math.round(value),
    });
  }

  return data;
}

const SERIES_BY_TIMEFRAME = {
  "1D": generateSeries(1, 24),
  "1W": generateSeries(2, 7),
  "1M": generateSeries(3, 30),
  "3M": generateSeries(4, 12),
  "1Y": generateSeries(5, 12),
};

export function TradingChartSection() {
  const [timeframe, setTimeframe] =
    useState<(typeof TIMEFRAMES)[number]>("1D");

  const data = useMemo(
    () => SERIES_BY_TIMEFRAME[timeframe],
    [timeframe]
  );

  return (
    <section className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Trading Market"
          title="Professional Market Charts"
          description="Track market movements with institutional-grade charting tools"
        />

        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-4">
              {INDEX_CARDS.map((idx) => (
                <div
                  key={idx.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2"
                >
                  <span className="text-xs font-semibold text-slate-500">
                    {idx.label}
                  </span>

                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-bold",
                      idx.positive
                        ? "text-emerald-500"
                        : "text-red-500"
                    )}
                  >
                    {idx.positive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}

                    {idx.change}
                  </span>
                </div>
              ))}
            </div>

            <Tabs
              value={timeframe}
              onValueChange={(v) =>
                setTimeframe(v as (typeof TIMEFRAMES)[number])
              }
            >
              <TabsList>
                {TIMEFRAMES.map((tf) => (
                  <TabsTrigger key={tf} value={tf}>
                    {tf}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-8 flex items-baseline gap-3">
            <p className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              24,012.60
            </p>

            <span className="flex items-center gap-1 text-sm font-semibold text-emerald-500">
              <TrendingUp className="h-4 w-4" />
              +0.63%
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            As of 11 Jul 2026, 07:28 PM IST
          </p>

          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient
                    id="chartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#dbe4f2"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="t"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 13,
                  }}
                  tickFormatter={(v) => `Day ${v + 1}`}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 50", "dataMax + 50"]}
                  tick={{
                    fill: "#64748b",
                    fontSize: 13,
                  }}
                  tickFormatter={(v) =>
                    Number(v).toLocaleString("en-IN")
                  }
                />

                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    color: "#0f172a",
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString("en-IN"),
                    "NIFTY 50",
                  ]}
                  labelFormatter={(label) =>
                    `Day ${Number(label) + 1}`
                  }
                />

                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#chartFill)"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}