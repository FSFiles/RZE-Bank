"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";
import { SectionHeading } from "@/components/section-heading";
import { useEmiCalculator } from "@/hooks/use-emi-calculator";
import { formatCompactINR, formatINR } from "@/utils/format";

export function EmiCalculatorSection() {
  const {
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    tenureMonths,
    setTenureMonths,
    emi,
    totalPayable,
    totalInterest,
    principalShare,
    interestShare,
  } = useEmiCalculator();

  const pieData = [
    { name: "Principal", value: loanAmount, color: "#3b82f6" },
    { name: "Interest", value: Math.max(totalInterest, 0), color: "#a78bfa" },
  ];

  const tenureYears = Math.floor(tenureMonths / 12);
  const tenureRemMonths = tenureMonths % 12;

  return (
    <section className="relative bg-white py-24">
      <div className="container">
        <SectionHeading
          eyebrow="EMI Calculator"
          title="Plan Your Loan EMI"
          description="Adjust the sliders to calculate your monthly EMI instantly"
        />

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 rounded-3xl border border-slate-700 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8 lg:grid-cols-2 lg:gap-12">
          {/* Sliders */}
          <div>
            <p className="text-sm font-semibold text-slate-900">Loan Parameters</p>

            <div className="mt-7 space-y-9">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Loan Amount</span>
                  <span className="font-display font-bold text-slate-900">
                    {formatINR(loanAmount)}
                  </span>
                </div>
                <Slider
                  className="mt-4"
                  min={50000}
                  max={5000000}
                  step={10000}
                  value={[loanAmount]}
                  onValueChange={([v]) => setLoanAmount(v)}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>₹50K</span>
                  <span>₹50L</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Interest Rate</span>
                  <span className="font-display font-bold text-slate-900">
                    {interestRate.toFixed(1)}% p.a.
                  </span>
                </div>
                <Slider
                  className="mt-4"
                  min={5}
                  max={24}
                  step={0.1}
                  value={[interestRate]}
                  onValueChange={([v]) => setInterestRate(v)}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>5%</span>
                  <span>24%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Loan Tenure</span>
                  <span className="font-display font-bold text-slate-900">
                    {tenureYears}yr {tenureRemMonths}mo
                  </span>
                </div>
                <Slider
                  className="mt-4"
                  min={6}
                  max={360}
                  step={6}
                  value={[tenureMonths]}
                  onValueChange={([v]) => setTenureMonths(v)}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>6 mo</span>
                  <span>30 yr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-900">Your EMI Breakdown</p>

            <div className="mt-5 flex items-center gap-6">
              <div className="relative h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-slate-500">Monthly EMI</p>
                  <p className="font-display text-lg font-bold text-slate-900">
                    {formatCompactINR(Math.round(emi))}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Principal ({principalShare}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <span className="text-slate-600">Interest ({interestShare}%)</span>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
              <p className="text-xs text-slate-500">Monthly EMI</p>
              <p className="font-display text-3xl font-bold text-blue-700 sm:text-4xl">
                {formatINR(Math.round(emi))}
              </p>
              <p className="mt-1 text-xs text-slate-500">for {tenureMonths} months</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] text-slate-500">Principal Amount</p>
                <p className="mt-1 font-semibold text-slate-900">{formatCompactINR(loanAmount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] text-slate-500">Total Interest</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatCompactINR(Math.round(totalInterest))}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] text-slate-500">Total Payable</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatCompactINR(Math.round(totalPayable))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
