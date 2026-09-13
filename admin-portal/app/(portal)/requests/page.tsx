import { getAllServiceRequests } from "@/lib/admin/queries";
import { RequestTable } from "@/components/admin/request-table";

export const metadata = { title: "Requests — RZE Bank Admin" };

export default async function AdminRequestsPage() {
  const requests = await getAllServiceRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Request Management</h1>
        <p className="text-sm text-muted-foreground">Review and act on customer service requests</p>
      </div>
      <RequestTable requests={requests} />
    </div>
  );
}
