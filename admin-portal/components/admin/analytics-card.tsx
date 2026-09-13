import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AnalyticsCard({
  label,
  value,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "gold" | "emerald" | "blue" | "amber";
}) {
  const toneClasses: Record<string, string> = {
    gold: "bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  };

  return (
    <Card className="p-5">
      <CardContent className="flex items-center justify-between p-0">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold mt-1">{value}</p>
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
