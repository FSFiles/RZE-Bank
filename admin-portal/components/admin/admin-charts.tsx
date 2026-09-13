"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR } from "@/utils/format";

const tooltipStyle = {
  background: "#0B1230",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#fff",
};

export function TransactionVolumeChart({
  data,
}: {
  data: { label: string; volume: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transaction Volume</CardTitle>
        <CardDescription>Total transaction amount, last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#8892a6" fontSize={11} />
              <YAxis stroke="#8892a6" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatINR(v)} />
              <Bar dataKey="volume" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueChart({ data }: { data: { label: string; revenue: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue (Approved Deposits)</CardTitle>
        <CardDescription>Deposit inflow, last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#8892a6" fontSize={11} />
              <YAxis stroke="#8892a6" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatINR(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerGrowthChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer Growth</CardTitle>
        <CardDescription>Cumulative customers, last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#8892a6" fontSize={11} />
              <YAxis stroke="#8892a6" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="total" stroke="#60A5FA" fill="url(#growthFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
