"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/utils/format";
import type { Database } from "@/types/database.types";

type Txn = Database["public"]["Tables"]["transactions"]["Row"];

export function TransactionExportButtons({ transactions }: { transactions: Txn[] }) {
  function downloadCsv() {
    const header = ["Transaction ID", "Date", "Type", "Amount", "Status", "Remarks"];
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.created_at).toLocaleString("en-IN"),
      t.type,
      String(t.amount),
      t.status,
      t.reference_note ?? "",
    ]);
    const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rze-bank-transactions-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(11, 31, 77);
    doc.text("RZE Bank — Transaction History", 14, 18);

    let y = 30;
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    transactions.forEach((t) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${new Date(t.created_at).toLocaleDateString("en-IN")}  ${t.type}  ${formatINR(t.amount)}  ${t.status}`,
        14,
        y
      );
      y += 6;
    });
    doc.save(`rze-bank-transactions-${Date.now()}.pdf`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadCsv}>
        <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadPdf}>
        <Download className="h-3.5 w-3.5" /> PDF
      </Button>
    </div>
  );
}
