"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, Copy, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createDepositRequest } from "@/lib/actions/banking";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];
type Stage = "form" | "generating" | "ready";

export function DepositClient({
  balance,
  customerName,
  customerId,
}: {
  balance: number;
  customerName: string;
  customerId: string;
}) {
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [depositCode, setDepositCode] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid deposit amount.");
      return;
    }

    setStage("generating");
    const [result] = await Promise.all([
      createDepositRequest(value),
      new Promise((r) => setTimeout(r, 1200)),
    ]);

    if (!result.success) {
      toast.error(result.error || "Something went wrong. Please try again.");
      setStage("form");
      return;
    }

    setDepositCode(result.code as string);
    setStage("ready");
  }

  function copyCode() {
    if (!depositCode) return;
    navigator.clipboard.writeText(depositCode);
    toast.success("Deposit code copied to clipboard.");
  }

  async function downloadSlip() {
    if (!depositCode) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const value = Number(amount);

    doc.setFontSize(18);
    doc.setTextColor(11, 31, 77);
    doc.text("RZE Bank", 20, 20);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Deposit Slip", 20, 28);
    doc.setDrawColor(212, 175, 55);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    const lines: [string, string][] = [
      ["Deposit Code", depositCode],
      ["Customer Name", customerName],
      ["Customer ID", customerId],
      ["Deposit Amount", formatINR(value)],
      ["Generated On", new Date().toLocaleString("en-IN")],
      ["Status", "Pending Branch Verification"],
    ];
    let y = 45;
    lines.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(val, 80, y);
      y += 10;
    });

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const message = doc.splitTextToSize(
      "Please visit your nearest RZE Bank branch and show this Deposit Code to the bank staff. Once verified, your amount will be deposited into your account after approval.",
      165
    );
    doc.text(message, 20, y);
    doc.save(`${depositCode}-deposit-slip.pdf`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <DashboardPageHeader
        icon={ArrowDownToLine}
        title="Deposit Money"
        description="Generate a branch deposit code to add funds to your account"
      />

      <AnimatePresence mode="wait">
        {stage === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card>
              <CardHeader>
                <CardTitle>Deposit Amount</CardTitle>
                <CardDescription>Current balance: {formatINR(balance)}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" type="number" min={1} placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((a) => (
                      <button type="button" key={a} onClick={() => setAmount(String(a))} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs hover:border-[hsl(var(--gold))]/50">
                        {formatINR(a)}
                      </button>
                    ))}
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Deposit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stage === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }} className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[hsl(var(--gold))]/60">
              <ShieldCheck className="h-7 w-7 text-[hsl(var(--gold))]" />
            </motion.div>
            <p className="font-display text-lg font-semibold">Generating your Deposit Code...</p>
            <p className="text-sm text-muted-foreground mt-1">Securing your transaction reference</p>
          </motion.div>
        )}

        {stage === "ready" && depositCode && (
          <motion.div key="ready" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
            <Card className="border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5">
              <CardContent className="p-6 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Your Deposit Code</p>
                <p className="font-mono text-3xl font-bold text-[hsl(var(--gold))] tracking-wider">{depositCode}</p>
                <p className="text-sm text-muted-foreground mt-2">For {formatINR(Number(amount))}</p>
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-muted-foreground">
                  Please visit your nearest RZE Bank branch and show this Deposit Code to the bank staff. Once
                  verified, your amount will be deposited into your account after approval.
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="gap-2" onClick={copyCode}>
                    <Copy className="h-4 w-4" /> Copy Code
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={downloadSlip}>
                    <Download className="h-4 w-4" /> Download Deposit Slip
                  </Button>
                </div>
                <Button className="w-full mt-3" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
