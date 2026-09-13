import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCustomerDetail } from "@/lib/admin/queries";
import { CustomerLifecycleActions } from "@/components/admin/customer-lifecycle-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/utils/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Customer Detail — RZE Bank Admin" };

const STATUS_TONE: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  frozen: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  closed: "border-red-500/30 bg-red-500/10 text-red-400",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  suspended: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  failed: "border-red-500/30 bg-red-500/10 text-red-400",
  reversed: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCustomerDetail(id);
  if (!result) notFound();

  const { customer, transactions } = result;
  const accounts = Array.isArray(customer.accounts) ? customer.accounts : customer.accounts ? [customer.accounts] : [];
  const primaryAccountId = accounts[0]?.id ?? null;

  return (
    <div className="space-y-6">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-white">
              {customer.first_name} {customer.last_name}
            </h1>
            <Badge variant="outline" className={cn("capitalize", STATUS_TONE[customer.status])}>
              {customer.status}
            </Badge>
          </div>
          <p className="text-sm font-mono text-muted-foreground">{customer.customer_id}</p>
        </div>
        <CustomerLifecycleActions customerId={customer.id} accountId={primaryAccountId} status={customer.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Email" value={customer.email} />
          <Field label="Phone" value={customer.phone_number} />
          <Field label="City" value={`${customer.city}, ${customer.state}`} />
          <Field label="Address" value={customer.address_line1} />
          <Field label="PIN Code" value={customer.pin_code} />
          <Field label="Joined" value={new Date(customer.created_at).toLocaleDateString("en-IN")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts found.</p>
          ) : (
            accounts.map((a) => (
              <div key={a.account_number} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="font-mono text-sm">{a.account_number}</p>
                  <p className="text-xs text-muted-foreground capitalize">{a.account_type} account</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatINR(a.balance)}</p>
                  <Badge variant="outline" className={cn("capitalize", STATUS_TONE[a.status])}>
                    {a.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
          <CardDescription>Most recent 50 transactions across all accounts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 last:border-0">
                      <td className="p-4">{new Date(t.created_at).toLocaleString("en-IN")}</td>
                      <td className="p-4 capitalize">{t.type.replace(/_/g, " ")}</td>
                      <td className="p-4 text-right">{formatINR(t.amount)}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn("capitalize", STATUS_TONE[t.status])}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
