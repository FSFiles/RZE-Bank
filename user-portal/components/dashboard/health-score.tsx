"use client";

import { Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function scoreTone(score: number) {
  if (score >= 75) return { label: "Excellent", color: "text-emerald-400", ring: "#34D399" };
  if (score >= 50) return { label: "Good", color: "text-[hsl(var(--gold))]", ring: "#D4AF37" };
  return { label: "Needs Attention", color: "text-red-400", ring: "#F87171" };
}

export function HealthScoreCard({ score }: { score: number }) {
  const tone = scoreTone(score);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-[hsl(var(--gold))]" /> Financial Health Score
        </CardTitle>
        <CardDescription>Based on savings, income, expenses & activity</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0 -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={tone.ring}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div>
          <p className="font-display text-3xl font-bold">
            {score}
            <span className="text-base font-normal text-muted-foreground">/100</span>
          </p>
          <p className={cn("text-sm font-medium mt-1", tone.color)}>{tone.label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
