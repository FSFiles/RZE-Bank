import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Landmark, ShieldCheck } from "lucide-react";
import { requireCustomer } from "@/lib/supabase/customer";
import { getAccountTransactions } from "@/lib/customer/queries";
import { formatINR } from "@/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BalanceReveal, LogoutButton } from "@/components/dashboard/real-dashboard-client";
import { QUICK_ACTIONS } from "@/lib/constants/quick-actions";
import { cn } from "@/lib/utils";

const TXN_ICON = {
  deposit: ArrowDownLeft,
  transfer_in: ArrowDownLeft,
  admin_credit: ArrowDownLeft,
  interest_credit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  transfer_out: ArrowUpRight,
  admin_debit: ArrowUpRight,
} as const;

const CREDIT_TYPES = new Set(["deposit", "transfer_in", "admin_credit", "interest_credit"]);

export default async function DashboardPage() {
  const { customer, account } = await requireCustomer();
  const transactions = await getAccountTransactions(account.id, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Welcome, {customer.first_name}!</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
        </div>
        <LogoutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>A snapshot of your RZE Bank account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Customer Name" value={`${customer.first_name} ${customer.last_name}`} />
            <Field label="Customer ID" value={customer.customer_id} mono />
            <Field label="Account Number" value={account.account_number} mono />
            <Field label="Account Type" value={account.account_type} className="capitalize" />
            <Field label="IFSC Code" value={account.ifsc} mono />
            <Field label="Branch" value={account.branch} />
            <Field
              label="Account Status"
              value={
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="capitalize">{account.status}</span>
                </span>
              }
            />
            <div className="rounded-xl border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/10 p-4 sm:col-span-2">
              <BalanceReveal balance={account.balance} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.id} href={action.href}>
              <Card className="h-full p-4 hover:border-[hsl(var(--primary))]/50 hover:-translate-y-0.5 cursor-pointer">
                <action.icon className="h-5 w-5 text-[hsl(var(--gold))] mb-2" />
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your last few account activities</CardDescription>
          </div>
          <Link href="/dashboard/transactions" className="text-sm text-blue-400 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            transactions.map((txn) => {
              const isCredit = CREDIT_TYPES.has(txn.type);
              const Icon = TXN_ICON[txn.type as keyof typeof TXN_ICON] ?? Landmark;
              return (
                <div key={txn.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", isCredit ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium capitalize">{txn.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {txn.reference_note ? ` — ${txn.reference_note}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={cn("text-sm font-semibold", isCredit ? "text-emerald-400" : "text-red-400")}>
                    {isCredit ? "+" : "-"}
                    {formatINR(txn.amount)}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, mono, className }: { label: string; value: React.ReactNode; mono?: boolean; className?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {label === "Account Status" && <ShieldCheck className="h-3 w-3" />}
        {label}
      </p>
      <p className={cn("text-sm font-medium mt-1", mono && "font-mono", className)}>{value}</p>
    </div>
  );
}
