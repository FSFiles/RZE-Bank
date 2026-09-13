"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowUpFromLine, Loader2, Landmark, Download } from "lucide-react";
import { toast } from "sonner";
import { createWithdrawalRequest } from "@/lib/actions/banking";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function WithdrawClient({ balance }: { balance: number }) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawal, setWithdrawal] = useState<{
    id: string;
    amount: number;
    qrPayload: string;
    expiresAt: Date;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid withdrawal amount.");
      return;
    }
    setSubmitting(true);
    const result = await createWithdrawalRequest(value);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "Something went wrong. Please try again.");
      return;
    }

    setWithdrawal({
      id: result.withdrawalId as string,
      amount: value,
      qrPayload: result.qrPayload as string,
      expiresAt: new Date(result.expiresAt as string),
    });
  }

  function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas || !withdrawal) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${withdrawal.id}-withdrawal-qr.png`;
    link.click();
  }

  if (withdrawal) {
    return (
      <div className="mx-auto max-w-md text-center py-8">
        <Landmark className="mx-auto h-12 w-12 text-[hsl(var(--gold))] mb-4" />
        <h2 className="font-display text-xl font-semibold">Withdrawal QR Ready</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Visit your nearest RZE Bank ATM. Scan this QR Code to withdraw your cash.
        </p>
        <div className="mx-auto flex w-fit rounded-2xl bg-white p-4">
          <QRCodeCanvas ref={canvasRef} value={withdrawal.qrPayload} size={220} level="H" />
        </div>
        <div className="mx-auto mt-6 max-w-xs space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{formatINR(withdrawal.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Withdrawal ID</span>
            <span className="font-mono font-medium">{withdrawal.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires At</span>
            <span className="font-medium">
              {withdrawal.expiresAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button variant="outline" className="gap-2" onClick={downloadQr}>
            <Download className="h-4 w-4" /> Download QR Code
          </Button>
          <Button variant="outline" onClick={() => { setWithdrawal(null); setAmount(""); }}>
            Withdraw Again
          </Button>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <DashboardPageHeader icon={ArrowUpFromLine} title="Withdraw Money" description="Generate a QR code to withdraw cash at any RZE Bank ATM" />
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Amount</CardTitle>
          <CardDescription>Available balance: {formatINR(balance)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" min={1} placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating QR...
                </>
              ) : (
                "Generate Withdrawal QR"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
