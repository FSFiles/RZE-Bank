"use client";

import { useMemo, useState } from "react";
import { FileText, Printer, Download } from "lucide-react";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { getTransactions } from "@/lib/mock/store";
import type { TransactionType } from "@/lib/mock/types";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const TYPE_LABEL: Record<TransactionType, string> = {
  deposit: "Deposit",
  withdraw: "Withdrawal",
  transfer_out: "Transfer Sent",
  transfer_in: "Transfer Received",
};

type Mode = "mini" | "monthly";

export default function StatementPage() {
  const { loading, customer, account } = useCustomerAccountSession();
  const [mode, setMode] = useState<Mode>("mini");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM

  const transactions = useMemo(() => {
    const allTransactions = account ? getTransactions(account.accountNumber) : [];
    if (mode === "mini") return allTransactions.slice(0, 10);
    return allTransactions.filter((t) => t.date.startsWith(month));
  }, [account, mode, month]);

  if (loading || !customer || !account) return <p className="text-sm text-muted-foreground">Loading...</p>;

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(11, 31, 77);
    doc.text("RZE Bank", 20, 20);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(mode === "mini" ? "Mini Statement" : `Monthly Statement — ${month}`, 20, 28);
    doc.setDrawColor(212, 175, 55);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Customer:", 20, 44);
    doc.setFont("helvetica", "normal");
    doc.text(`${customer!.firstName} ${customer!.lastName} (${customer!.customerId})`, 55, 44);
    doc.setFont("helvetica", "bold");
    doc.text("Account:", 20, 51);
    doc.setFont("helvetica", "normal");
    doc.text(account!.accountNumber, 55, 51);

    let y = 65;
    doc.setFontSize(9);
    transactions.forEach((t) => {
      const isCredit = t.type === "deposit" || t.type === "transfer_in";
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${new Date(t.date).toLocaleDateString("en-IN")}  ${TYPE_LABEL[t.type]}  ${isCredit ? "+" : "-"}${formatINR(
          t.amount
        )}  ${t.description}`,
        20,
        y
      );
      y += 7;
    });

    doc.save(`rze-bank-${mode}-statement-${Date.now()}.pdf`);
  }

  return (
    <div>
      <div className="no-print flex items-start justify-between flex-wrap gap-4">
        <DashboardPageHeader
          icon={FileText}
          title="Statement"
          description="View, download, or print your mini or monthly statement"
        />
      </div>

      <div className="no-print mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList>
            <TabsTrigger value="mini">Mini Statement</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Statement</TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === "monthly" && (
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-40"
          />
        )}
      </div>

      <Card className="print:shadow-none print:border-none print:bg-white">
        <CardContent className="p-6 print:text-black" id="statement-content">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 print:border-black/20">
            <div>
              <p className="font-display text-lg font-semibold">RZE Bank</p>
              <p className="text-xs text-muted-foreground print:text-black/60">
                {mode === "mini" ? "Mini Statement" : `Monthly Statement — ${month}`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground print:text-black/60">
              Generated: {new Date().toLocaleString("en-IN")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-xs text-muted-foreground print:text-black/60">Customer Name</p>
              <p className="font-medium">
                {customer.firstName} {customer.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground print:text-black/60">Customer ID</p>
              <p className="font-mono font-medium">{customer.customerId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground print:text-black/60">Account Number</p>
              <p className="font-mono font-medium">{account.accountNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground print:text-black/60">Current Balance</p>
              <p className="font-medium">{formatINR(account.balance)}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-muted-foreground print:border-black/20 print:text-black/60">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-muted-foreground">
                    No transactions found for this period.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const isCredit = txn.type === "deposit" || txn.type === "transfer_in";
                  return (
                    <tr key={txn.id} className="border-b border-white/5 last:border-0 print:border-black/10">
                      <td className="py-2">{new Date(txn.date).toLocaleDateString("en-IN")}</td>
                      <td className="py-2">{txn.description}</td>
                      <td className="py-2">{TYPE_LABEL[txn.type]}</td>
                      <td className="py-2 text-right">
                        {isCredit ? "+" : "-"}
                        {formatINR(txn.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
        <Button size="lg" variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print Statement
        </Button>
        <Button size="lg" className="gap-2" onClick={downloadPdf}>
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>
    </div>
  );
}
