import { getMonthlyVolume, getCustomerGrowth, getRequestBreakdown } from "@/lib/admin/queries";
import { TransactionVolumeChart, RevenueChart, CustomerGrowthChart } from "@/components/admin/admin-charts";
import { RequestBreakdownCharts } from "@/components/admin/request-breakdown-charts";

export const metadata = { title: "Analytics — RZE Bank Admin" };

export default async function AdminAnalyticsPage() {
  const [monthly, growth, breakdown] = await Promise.all([
    getMonthlyVolume(),
    getCustomerGrowth(),
    getRequestBreakdown(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-muted-foreground">Bank-wide trends across transactions, customers, and requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransactionVolumeChart data={monthly.map((m) => ({ label: m.label, volume: m.volume }))} />
        <RevenueChart data={monthly.map((m) => ({ label: m.label, revenue: m.revenue }))} />
      </div>
      <CustomerGrowthChart data={growth} />
      <RequestBreakdownCharts byType={breakdown.byType} byPriority={breakdown.byPriority} />
    </div>
  );
}
