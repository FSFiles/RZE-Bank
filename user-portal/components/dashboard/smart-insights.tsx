"use client";

import { Sparkles } from "lucide-react";
import type { MockTransaction } from "@/lib/mock/types";
import { generateInsights } from "@/lib/mock/analytics";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function SmartInsights({ transactions }: { transactions: MockTransaction[] }) {
  const insights = generateInsights(transactions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-[hsl(var(--gold))]" /> Smart Insights
        </CardTitle>
        <CardDescription>Personalized observations based on your activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keep using your account and insights will appear here.
          </p>
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
            >
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--gold))]" />
              <p className="text-sm text-slate-200">{insight}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
