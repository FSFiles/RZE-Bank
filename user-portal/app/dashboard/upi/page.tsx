"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function UpiPage() {
  const { loading, customer, account } = useCustomerAccountSession();
  const [amount, setAmount] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (loading || !customer || !account) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const upiId = `${customer.customerId.toLowerCase().replace(/[^a-z0-9]/g, "")}@rzebank`;
  const payload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    customer.firstName + " " + customer.lastName
  )}&am=${amount || ""}&cu=INR`;

  function copyUpiId() {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied to clipboard.");
  }

  function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${upiId}-qr.png`;
    link.click();
  }

  return (
    <div className="mx-auto max-w-md">
      <DashboardPageHeader icon={QrCode} title="UPI" description="Receive money instantly via UPI" />

      <Card>
        <CardHeader>
          <CardTitle>Your UPI ID</CardTitle>
          <CardDescription>Share this ID or QR to receive payments</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="font-mono text-lg font-semibold text-[hsl(var(--gold))]">{upiId}</p>
          <Button variant="outline" size="sm" className="gap-2 mt-3" onClick={copyUpiId}>
            <Copy className="h-3.5 w-3.5" /> Copy UPI ID
          </Button>

          <div className="mx-auto mt-6 flex w-fit rounded-2xl bg-white p-4">
            <QRCodeCanvas ref={canvasRef} value={payload} size={200} level="H" />
          </div>

          <div className="mx-auto mt-6 max-w-xs space-y-2 text-left">
            <Label htmlFor="amount">Request a specific amount (optional)</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button variant="outline" className="gap-2 mt-4" onClick={downloadQr}>
            <Download className="h-4 w-4" /> Download QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
