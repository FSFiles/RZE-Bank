"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { MockTransaction } from "@/lib/mock/types";
import {
  categoryBreakdown,
  last6MonthsComparison,
  last7DaysSpending,
  savingsTrend,
} from "@/lib/mock/analytics";
import { formatINR } from "@/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const COLORS = [
  "#D4AF37",
  "#60A5FA",
  "#F472B6",
  "#34D399",
  "#FB923C",
  "#A78BFA",
  "#F87171",
  "#94A3B8",
];

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  background: "#0B1230",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#fff",
};

export function ExpenseAnalytics({ transactions }: { transactions: MockTransaction[] }) {
  const categories = categoryBreakdown(transactions);
  const monthly = last6MonthsComparison(transactions);
  const weekly = last7DaysSpending(transactions);
  const savings = savingsTrend(transactions);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          <BarChart3 className="mx-auto h-8 w-8 mb-2 opacity-50" />
          No transactions yet — analytics will appear once you start using your account.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-4">Expense Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Category-Wise Spending" description="Where your money goes">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="amount"
                nameKey="category"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {categories.map((c, i) => (
                  <Cell key={c.category} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => formatINR(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {categories.slice(0, 5).map((c, i) => (
              <span key={c.category} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.category}
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Income vs Expenses" description="Last 6 months">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#8892a6" fontSize={11} />
              <YAxis stroke="#8892a6" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatINR(value)} />
              <Bar dataKey="income" fill="#34D399" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Spending" description="Last 7 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#8892a6" fontSize={11} />
              <YAxis stroke="#8892a6" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatINR(value)} />
              <Line type="monotone" dataKey="amount" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Savings Trend" description="Cumulative savings over time">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savings}>
              <defs>
                <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#8892a6" fontSize={11} />
              <YAxis stroke="#8892a6" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatINR(value)} />
              <Area type="monotone" dataKey="savings" stroke="#60A5FA" fill="url(#savingsFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
