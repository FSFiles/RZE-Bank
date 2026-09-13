import { Users, Landmark, ClipboardList, CheckCircle2, ArrowLeftRight, Wallet } from "lucide-react";
import { getAdminStats, getMonthlyVolume, getCustomerGrowth, getRecentServiceRequests } from "@/lib/admin/queries";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { TransactionVolumeChart, RevenueChart, CustomerGrowthChart } from "@/components/admin/admin-charts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/utils/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard — RZE Bank" };

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  expired: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

export default async function AdminDashboardPage() {
  const [stats, monthly, growth, recentRequests] = await Promise.all([
    getAdminStats(),
    getMonthlyVolume(),
    getCustomerGrowth(),
    getRecentServiceRequests(6),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">A live overview of RZE Bank&apos;s customers and activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnalyticsCard label="Total Customers" value={stats.totalCustomers.toLocaleString("en-IN")} icon={Users} tone="gold" />
        <AnalyticsCard label="Total Accounts" value={stats.totalAccounts.toLocaleString("en-IN")} icon={Landmark} tone="blue" />
        <AnalyticsCard label="Pending Requests" value={stats.pendingRequests.toLocaleString("en-IN")} icon={ClipboardList} tone="amber" />
        <AnalyticsCard label="Approved Requests" value={stats.approvedRequests.toLocaleString("en-IN")} icon={CheckCircle2} tone="emerald" />
        <AnalyticsCard label="Total Transactions" value={stats.totalTransactions.toLocaleString("en-IN")} icon={ArrowLeftRight} tone="blue" />
        <AnalyticsCard label="Total Deposits" value={formatINR(stats.totalDeposits)} icon={Wallet} tone="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransactionVolumeChart data={monthly.map((m) => ({ label: m.label, volume: m.volume }))} />
        <RevenueChart data={monthly.map((m) => ({ label: m.label, revenue: m.revenue }))} />
      </div>
      <CustomerGrowthChart data={growth} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Requests</CardTitle>
          <CardDescription>Latest service requests across all customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            recentRequests.map((r) => {
              const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{r.request_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer ? `${customer.first_name} ${customer.last_name} — ${customer.customer_id}` : "Unknown customer"}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("capitalize", STATUS_TONE[r.status])}>
                    {r.status}
                  </Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
