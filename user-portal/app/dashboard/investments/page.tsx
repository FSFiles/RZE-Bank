"use client";

import { useState } from "react";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { updateAccountBalance, addTransaction, genTxnId, notify } from "@/lib/mock/store";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const PRODUCTS = [
  { id: "eq-growth", name: "RZE Equity Growth Fund", type: "Mutual Fund", returns: "14.2% (3Y)", risk: "High" },
  { id: "bal-adv", name: "RZE Balanced Advantage Fund", type: "Mutual Fund", returns: "10.8% (3Y)", risk: "Moderate" },
  { id: "gov-bond", name: "RZE Government Bond", type: "Bond", returns: "7.4% (fixed)", risk: "Low" },
  { id: "corp-bond", name: "RZE Corporate Bond Fund", type: "Bond", returns: "8.6% (fixed)", risk: "Moderate" },
];

export default function InvestmentsPage() {
  const { loading, account, refresh } = useCustomerAccountSession();
  const [selected, setSelected] = useState<(typeof PRODUCTS)[number] | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading || !account) return <p className="text-sm text-muted-foreground">Loading...</p>;

  async function handleInvest() {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid investment amount.");
      return;
    }
    if (value > account!.balance) {
      toast.error("Insufficient balance.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    updateAccountBalance(account!.accountNumber, account!.balance - value);
    addTransaction({
      id: genTxnId(),
      accountNumber: account!.accountNumber,
      type: "transfer_out",
      amount: value,
      description: `Investment in ${selected!.name}`,
      status: "success",
      date: new Date().toISOString(),
      category: "Others",
      location: "RZE Bank — Online",
    });
    notify("Investment Confirmed", `${formatINR(value)} invested in ${selected!.name}.`, "general");
    refresh();
    toast.success("Investment successful!");
    setSelected(null);
    setAmount("");
    setSubmitting(false);
  }

  return (
    <div>
      <DashboardPageHeader icon={TrendingUp} title="Investments" description="Explore mutual funds and bonds" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRODUCTS.map((p) => (
          <Card key={p.id} className="p-5">
            <p className="text-xs text-muted-foreground">{p.type}</p>
            <p className="font-display font-semibold mt-1">{p.name}</p>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-emerald-400">{p.returns}</span>
              <span className="text-muted-foreground">Risk: {p.risk}</span>
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => setSelected(p)}>
              Invest Now
            </Button>
          </Card>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name}
        description="Enter the amount you'd like to invest"
      >
        {selected && (
          <div className="space-y-4">
            <Input
              type="number"
              min={1}
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button className="w-full" onClick={handleInvest} disabled={submitting}>
              {submitting ? "Processing..." : "Confirm Investment"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
