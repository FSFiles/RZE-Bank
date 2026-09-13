import { getAllLoanRequests } from "@/lib/admin/queries";
import { LoanRequestTable, type LoanRequestRow } from "@/components/admin/loan-request-table";

export const metadata = { title: "Loan Requests — RZE Bank Admin" };

export default async function AdminLoansPage() {
  const requests = (await getAllLoanRequests()) as unknown as LoanRequestRow[];
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Loan Requests</h1>
        <p className="text-sm text-muted-foreground">
          {pendingCount} pending — enter the CIBIL score for each applicant, then approve or reject.
        </p>
      </div>
      <LoanRequestTable requests={requests} />
    </div>
  );
}
