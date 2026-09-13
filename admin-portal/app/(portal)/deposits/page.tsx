import { getAllDepositRequests } from "@/lib/admin/queries";
import { DepositRequestTable, type DepositRequestRow } from "@/components/admin/deposit-request-table";

export const metadata = { title: "Deposit Requests — RZE Bank Admin" };

export default async function AdminDepositsPage() {
  const requests = (await getAllDepositRequests()) as unknown as DepositRequestRow[];
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Deposit Requests</h1>
        <p className="text-sm text-muted-foreground">
          {pendingCount} pending — review customer deposit requests and approve or reject them.
        </p>
      </div>
      <DepositRequestTable requests={requests} />
    </div>
  );
}
