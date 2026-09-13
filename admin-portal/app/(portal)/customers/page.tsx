import { getAllCustomersWithAccounts } from "@/lib/admin/queries";
import { CustomerTable } from "@/components/admin/customer-table";

export const metadata = { title: "Customers — RZE Bank Admin" };

export default async function AdminCustomersPage() {
  const customers = await getAllCustomersWithAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} registered customers</p>
      </div>
      <CustomerTable customers={customers} />
    </div>
  );
}
