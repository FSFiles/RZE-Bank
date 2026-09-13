import { getAllTransactionsForAdmin } from "@/lib/admin/queries";
import { TransactionMonitorTable } from "@/components/admin/transaction-monitor-table";

export const metadata = { title: "Transactions — RZE Bank Admin" };

export default async function AdminTransactionsPage() {
  const transactions = await getAllTransactionsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Transaction Monitoring</h1>
        <p className="text-sm text-muted-foreground">Most recent {transactions.length} transactions across all customers</p>
      </div>
      <TransactionMonitorTable transactions={transactions} />
    </div>
  );
}
