"use client";

import { useState } from "react";
import { PiggyBank, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import {
  addFixedDeposit,
  genFdId,
  getFixedDeposits,
  updateAccountBalance,
  notify,
} from "@/lib/mock/store";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TENURE_RATES: { months: number; rate: number }[] = [
  { months: 6, rate: 6.0 },
  { months: 12, rate: 6.75 },
  { months: 24, rate: 7.1 },
  { months: 36, rate: 7.25 },
  { months: 60, rate: 7.5 },
];

function calcMaturity(principal: number, rate: number, months: number) {
  const years = months / 12;
  // Quarterly compounding, typical for Indian FDs
  const n = 4;
  const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
  return Math.round(amount);
}

export default function FixedDepositPage() {
  const { loading, account, refresh } = useCustomerAccountSession();
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState(TENURE_RATES[1].months);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string; maturity: number } | null>(null);

  if (loading || !account) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const rate = TENURE_RATES.find((t) => t.months === tenure)!.rate;
  const principal = Number(amount) || 0;
  const maturity = principal > 0 ? calcMaturity(principal, rate, tenure) : 0;
  const fds = getFixedDeposits(account.accountNumber);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!principal || principal <= 0) {
      toast.error("Enter a valid deposit amount.");
      return;
    }
    if (principal > account!.balance) {
      toast.error("Insufficient balance to open this FD.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const id = genFdId();
    const start = new Date();
    const maturityDate = new Date(start);
    maturityDate.setMonth(maturityDate.getMonth() + tenure);

    addFixedDeposit({
      id,
      accountNumber: account!.accountNumber,
      principal,
      tenureMonths: tenure,
      interestRate: rate,
      maturityAmount: maturity,
      startDate: start.toISOString(),
      maturityDate: maturityDate.toISOString(),
      status: "active",
    });
    updateAccountBalance(account!.accountNumber, account!.balance - principal);
    notify("Fixed Deposit Opened", `₹${principal.toLocaleString("en-IN")} locked in for ${tenure} months at ${rate}% p.a.`, "general");
    refresh();

    setSuccess({ id, maturity });
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md text-center py-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400 mb-4" />
        <h2 className="font-display text-xl font-semibold">Fixed Deposit Opened</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Maturity amount: {formatINR(success.maturity)}
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-3">Reference: {success.id}</p>
        <Button className="mt-6" onClick={() => setSuccess(null)}>
          Open Another FD
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <DashboardPageHeader icon={PiggyBank} title="Fixed Deposit" description="Grow your savings with guaranteed returns" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Open a New FD</CardTitle>
          <CardDescription>Available balance: {formatINR(account.balance)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount">Deposit Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min={1000}
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tenure</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {TENURE_RATES.map((t) => (
                  <button
                    type="button"
                    key={t.months}
                    onClick={() => setTenure(t.months)}
                    className={`rounded-lg border px-2 py-2 text-xs ${
                      tenure === t.months
                        ? "border-[hsl(var(--gold))]/60 bg-[hsl(var(--gold))]/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {t.months}m
                    <br />
                    <span className="text-[hsl(var(--gold))]">{t.rate}%</span>
                  </button>
                ))}
              </div>
            </div>

            {principal > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span>{rate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maturity Amount</span>
                  <span className="font-semibold text-[hsl(var(--gold))]">{formatINR(maturity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Earned</span>
                  <span>{formatINR(maturity - principal)}</span>
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Opening FD...
                </>
              ) : (
                "Open Fixed Deposit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {fds.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Your Fixed Deposits</h2>
          <div className="space-y-2">
            {fds.map((fd) => (
              <div key={fd.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{formatINR(fd.principal)} @ {fd.interestRate}%</p>
                  <span className="text-xs capitalize text-emerald-400">{fd.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Matures {new Date(fd.maturityDate).toLocaleDateString("en-IN")} — {formatINR(fd.maturityAmount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
