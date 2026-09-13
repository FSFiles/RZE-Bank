"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Target,
  Plus,
  Plane,
  Bike,
  Laptop,
  Home,
  ShieldCheck,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";
import { addGoal, contributeToGoal, genGoalId } from "@/lib/mock/store";
import type { MockGoal } from "@/lib/mock/types";
import { formatINR } from "@/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

const GOAL_ICONS: Record<string, LucideIcon> = {
  Vacation: Plane,
  Bike: Bike,
  Laptop: Laptop,
  House: Home,
  "Emergency Fund": ShieldCheck,
  Other: PiggyBank,
};

const PRESETS = ["Vacation", "Bike", "Laptop", "House", "Emergency Fund", "Other"];

export function GoalsSection({
  accountNumber,
  goals,
  onChange,
}: {
  accountNumber: string;
  goals: MockGoal[];
  onChange: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState(PRESETS[0]);
  const [target, setTarget] = useState("");
  const [contributeOpen, setContributeOpen] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(target);
    if (!value || value <= 0) {
      toast.error("Enter a valid target amount.");
      return;
    }
    addGoal({
      id: genGoalId(),
      accountNumber,
      name,
      icon: name,
      targetAmount: value,
      savedAmount: 0,
      createdAt: new Date().toISOString(),
    });
    toast.success(`"${name}" goal created.`);
    setTarget("");
    setModalOpen(false);
    onChange();
  }

  function handleContribute(goalId: string) {
    const value = Number(contributeAmount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    contributeToGoal(goalId, value);
    toast.success("Added to your goal.");
    setContributeAmount("");
    setContributeOpen(null);
    onChange();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-[hsl(var(--gold))]" /> Savings Goals
          </CardTitle>
          <CardDescription>Track progress toward what matters to you</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No goals yet — create one to start tracking your savings progress.
          </p>
        ) : (
          goals.map((goal) => {
            const Icon = GOAL_ICONS[goal.icon] ?? PiggyBank;
            const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
            return (
              <div key={goal.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--gold))]/10">
                      <Icon className="h-4 w-4 text-[hsl(var(--gold))]" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatINR(goal.savedAmount)} of {formatINR(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setContributeOpen(goal.id)}>
                    Add Funds
                  </Button>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-amber-300",
                      pct >= 100 && "from-emerald-400 to-emerald-300"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{pct}% complete</p>

                <Modal
                  open={contributeOpen === goal.id}
                  onClose={() => setContributeOpen(null)}
                  title={`Add Funds to ${goal.name}`}
                >
                  <div className="space-y-4">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Amount (₹)"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                    />
                    <Button className="w-full" onClick={() => handleContribute(goal.id)}>
                      Add to Goal
                    </Button>
                  </div>
                </Modal>
              </div>
            );
          })
        )}
      </CardContent>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a Savings Goal">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Goal</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const Icon = GOAL_ICONS[p];
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setName(p)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs",
                      name === p
                        ? "border-[hsl(var(--gold))]/60 bg-[hsl(var(--gold))]/10"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <Icon className="h-4 w-4 text-[hsl(var(--gold))]" />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target Amount (₹)</Label>
            <Input
              id="target"
              type="number"
              min={1}
              placeholder="50000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Create Goal
          </Button>
        </form>
      </Modal>
    </Card>
  );
}
