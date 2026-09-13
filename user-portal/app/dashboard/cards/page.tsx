"use client";

import { useState, useEffect } from "react";
import { CreditCard, Snowflake, Sun, Ban, Sliders } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { ensureDebitCard, updateCard, notify } from "@/lib/mock/store";
import type { MockCard } from "@/lib/mock/types";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function CardsPage() {
  const { loading, customer, account } = useCustomerAccountSession();
  const [card, setCard] = useState<MockCard | null>(null);
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (account) {
      const c = ensureDebitCard(account.accountNumber);
      setCard(c);
      setLimit(String(c.dailyLimit));
    }
  }, [account]);

  if (loading || !account || !customer || !card) return <p className="text-sm text-muted-foreground">Loading...</p>;

  function setStatus(status: MockCard["status"]) {
    updateCard(card!.id, { status });
    setCard({ ...card!, status });
    notify("Security Alert", `Your debit card was ${status === "active" ? "unfrozen" : status}.`, "security");
    toast.success(`Card ${status}.`);
  }

  function saveLimit() {
    const value = Number(limit);
    if (!value || value <= 0) {
      toast.error("Enter a valid daily limit.");
      return;
    }
    updateCard(card!.id, { dailyLimit: value });
    setCard({ ...card!, dailyLimit: value });
    toast.success("Daily limit updated.");
  }

  return (
    <div className="mx-auto max-w-lg">
      <DashboardPageHeader icon={CreditCard} title="Cards" description="Manage your RZE Bank debit card" />

      <div
        className={cn(
          "relative mb-6 rounded-2xl bg-gradient-to-br from-[#0B1F4D] via-[#132a63] to-[#1a3a80] p-6 text-white shadow-xl overflow-hidden",
          card.status !== "active" && "grayscale opacity-70"
        )}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--gold))]/20 blur-2xl" />
        <p className="text-xs uppercase tracking-widest text-white/60">RZE Bank</p>
        <p className="mt-6 font-mono text-lg tracking-widest">{card.cardNumberMasked}</p>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-white/50 uppercase">Card Holder</p>
            <p className="text-sm font-medium">
              {customer.firstName} {customer.lastName}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase">Expires</p>
            <p className="text-sm font-medium">{card.expiry}</p>
          </div>
        </div>
        {card.status !== "active" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold uppercase tracking-wide">
            {card.status}
          </div>
        )}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Card Controls</CardTitle>
          <CardDescription>
            Status: <span className="capitalize">{card.status}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <Button
            variant={card.status === "frozen" ? "default" : "outline"}
            className="flex-col h-auto py-3 gap-1"
            onClick={() => setStatus(card.status === "frozen" ? "active" : "frozen")}
          >
            {card.status === "frozen" ? <Sun className="h-4 w-4" /> : <Snowflake className="h-4 w-4" />}
            <span className="text-xs">{card.status === "frozen" ? "Unfreeze" : "Freeze"}</span>
          </Button>
          <Button
            variant="outline"
            className={cn(
              "flex-col h-auto py-3 gap-1",
              card.status === "blocked" && "border-red-500/60 bg-red-500/10 text-red-400"
            )}
            onClick={() => setStatus(card.status === "blocked" ? "active" : "blocked")}
          >
            <Ban className="h-4 w-4" />
            <span className="text-xs">{card.status === "blocked" ? "Unblock" : "Block"}</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3 gap-1" disabled>
            <Sliders className="h-4 w-4" />
            <span className="text-xs">PIN Reset</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Card Limits</CardTitle>
          <CardDescription>Daily spending limit for this card</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limit">Daily Limit (₹)</Label>
            <Input id="limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <Button onClick={saveLimit}>Save Limit</Button>
        </CardContent>
      </Card>
    </div>
  );
}
