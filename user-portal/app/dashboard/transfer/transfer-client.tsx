"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { transferMoney, type TransferIdentifierType } from "@/lib/actions/banking";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { RealTransactionPinModal } from "@/components/dashboard/real-transaction-pin-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function TransferClient({ balance }: { balance: number }) {
  const [mode, setMode] = useState<TransferIdentifierType>("account_number");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [success, setSuccess] = useState<{ receiverName: string; amount: number } | null>(null);

  function validateRecipient(): string | null {
    const v = recipient.trim();
    if (!v) return "Enter a recipient.";
    if (mode === "account_number" && !/^\d{10,18}$/.test(v)) return "Enter a valid account number.";
    if (mode === "phone_number" && !/^[6-9]\d{9}$/.test(v)) return "Enter a valid 10-digit mobile number.";
    if (mode === "upi_id" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v)) return "Enter a valid UPI ID.";
    return null;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const recipientError = validateRecipient();
    if (recipientError) {
      toast.error(recipientError);
      return;
    }
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid transfer amount.");
      return;
    }
    if (value > balance) {
      toast.error("Insufficient balance for this transfer.");
      return;
    }
    setPinModalOpen(true);
  }

  async function completeTransfer() {
    setPinModalOpen(false);
    setSubmitting(true);
    const value = Number(amount);
    const result = await transferMoney(recipient.trim(), mode, value, note.trim() || undefined);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "Something went wrong. Please try again.");
      return;
    }

    setSuccess({ receiverName: (result.receiverName as string) ?? recipient.trim(), amount: value });
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md text-center py-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400 mb-4" />
        <h2 className="font-display text-xl font-semibold">Transfer Successful</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {formatINR(success.amount)} was sent to {success.receiverName}.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="outline" onClick={() => { setSuccess(null); setRecipient(""); setAmount(""); setNote(""); }}>
            Send Another
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
      <DashboardPageHeader icon={Send} title="Transfer Money" description="Send money via account number, phone number, or UPI ID" />
      <Card>
        <CardHeader>
          <CardTitle>New Transfer</CardTitle>
          <CardDescription>Available balance: {formatINR(balance)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <Tabs value={mode} onValueChange={(v) => setMode(v as TransferIdentifierType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account_number">Account No.</TabsTrigger>
                <TabsTrigger value="phone_number">Phone</TabsTrigger>
                <TabsTrigger value="upi_id">UPI ID</TabsTrigger>
              </TabsList>
              <TabsContent value="account_number" className="mt-4 space-y-2">
                <Label htmlFor="recipient">Recipient Account Number</Label>
                <Input id="recipient" placeholder="RZE202600000002" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </TabsContent>
              <TabsContent value="phone_number" className="mt-4 space-y-2">
                <Label htmlFor="recipient">Recipient Mobile Number</Label>
                <Input id="recipient" placeholder="9876543210" maxLength={10} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </TabsContent>
              <TabsContent value="upi_id" className="mt-4 space-y-2">
                <Label htmlFor="recipient">Recipient UPI ID</Label>
                <Input id="recipient" placeholder="name@rzebank" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" min={1} placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send Money"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Protected by your Transaction PIN.{" "}
              <Link href="/dashboard/security" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                <KeyRound className="h-3 w-3" /> Manage PIN
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <RealTransactionPinModal open={pinModalOpen} onClose={() => setPinModalOpen(false)} onVerified={completeTransfer} />
    </div>
  );
}
