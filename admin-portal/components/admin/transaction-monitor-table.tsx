"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatINR } from "@/utils/format";
import { cn } from "@/lib/utils";

interface TxnCustomer {
  first_name: string;
  last_name: string;
  customer_id: string;
}
interface TxnAccount {
  account_number: string;
  customers: TxnCustomer[] | TxnCustomer | null;
}
interface TxnRow {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference_note: string | null;
  city: string | null;
  created_at: string;
  accounts: TxnAccount[] | TxnAccount | null;
}

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  failed: "border-red-500/30 bg-red-500/10 text-red-400",
  reversed: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

export function TransactionMonitorTable({ transactions }: { transactions: TxnRow[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const account = Array.isArray(t.accounts) ? t.accounts[0] : t.accounts;
      const customer = account ? (Array.isArray(account.customers) ? account.customers[0] : account.customers) : null;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        account?.account_number.toLowerCase().includes(q) ||
        customer?.first_name.toLowerCase().includes(q) ||
        customer?.last_name.toLowerCase().includes(q) ||
        customer?.customer_id.toLowerCase().includes(q)
      );
    });
  }, [transactions, search, typeFilter, statusFilter]);

  return (
    <div>
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by account number, customer, transaction ID..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="transfer_in">Transfer In</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="reversed">Reversed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Account Holder</th>
                <th className="p-4 font-medium">Account No.</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const account = Array.isArray(t.accounts) ? t.accounts[0] : t.accounts;
                  const customer = account ? (Array.isArray(account.customers) ? account.customers[0] : account.customers) : null;
                  return (
                    <tr key={t.id} className="border-b border-white/5 last:border-0">
                      <td className="p-4">{new Date(t.created_at).toLocaleString("en-IN")}</td>
                      <td className="p-4">
                        {customer ? `${customer.first_name} ${customer.last_name}` : "—"}
                        <p className="text-xs font-mono text-muted-foreground">{customer?.customer_id}</p>
                      </td>
                      <td className="p-4 font-mono text-xs">{account?.account_number ?? "—"}</td>
                      <td className="p-4 capitalize">{t.type.replace(/_/g, " ")}</td>
                      <td className="p-4 text-right font-medium">{formatINR(t.amount)}</td>
                      <td className="p-4 text-xs text-muted-foreground">{t.city ?? "—"}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn("capitalize", STATUS_TONE[t.status])}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
