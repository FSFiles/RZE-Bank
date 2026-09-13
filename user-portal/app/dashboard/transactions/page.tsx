import { History, Download, FileSpreadsheet } from "lucide-react";
import { requireCustomer } from "@/lib/supabase/customer";
import { getPaginatedTransactions } from "@/lib/customer/queries";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { TransactionFiltersBar, TransactionPagination } from "@/components/dashboard/transaction-filters-bar";
import { TransactionExportButtons } from "@/components/dashboard/transaction-export-buttons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  failed: "border-red-500/30 bg-red-500/10 text-red-400",
  reversed: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

const CREDIT_TYPES = new Set(["deposit", "transfer_in", "admin_credit", "interest_credit"]);

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; status?: string; from?: string; to?: string }>;
}) {
  const { account } = await requireCustomer();
  const params = await searchParams;

  const result = await getPaginatedTransactions(account.id, {
    page: params.page ? Number(params.page) : 1,
    type: params.type,
    status: params.status,
    from: params.from,
    to: params.to,
  });

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <DashboardPageHeader
          icon={<History className="h-5 w-5 text-[hsl(var(--gold))]" />}
          title="Transaction History"
          description={`${result.total} transactions on your account`}
        />
        <TransactionExportButtons transactions={result.transactions} />
      </div>

      <TransactionFiltersBar />

      <Card>
        <CardContent className="p-0">
          {result.transactions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No transactions match your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                    <th className="p-4 font-medium">Transaction ID</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Remarks</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.transactions.map((txn) => {
                    const isCredit = CREDIT_TYPES.has(txn.type);
                    const d = new Date(txn.created_at);
                    return (
                      <tr key={txn.id} className="border-b border-white/5 last:border-0">
                        <td className="p-4 font-mono text-xs">{txn.id.slice(0, 8)}</td>
                        <td className="p-4">
                          {d.toLocaleDateString("en-IN")} <span className="text-muted-foreground">{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="p-4 capitalize">{txn.type.replace(/_/g, " ")}</td>
                        <td className="p-4 text-xs text-muted-foreground">{txn.reference_note ?? "—"}</td>
                        <td className={cn("p-4 text-right font-medium", isCredit ? "text-emerald-400" : "text-red-400")}>
                          {isCredit ? "+" : "-"}
                          {formatINR(txn.amount)}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("capitalize", STATUS_TONE[txn.status])}>
                            {txn.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionPagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
