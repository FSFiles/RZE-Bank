"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatINR } from "@/utils/format";
import { cn } from "@/lib/utils";

interface CustomerAccount {
  account_number: string;
  account_type: string;
  balance: number;
  status: string;
}

interface CustomerRow {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  city: string;
  status: string;
  created_at: string;
  accounts: CustomerAccount[] | CustomerAccount | null;
}

const STATUS_TONE: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  frozen: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  closed: "border-red-500/30 bg-red-500/10 text-red-400",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  suspended: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [customerStatusFilter, setCustomerStatusFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const account = Array.isArray(c.accounts) ? c.accounts[0] : c.accounts;
      if (statusFilter !== "all" && account?.status !== statusFilter) return false;
      if (customerStatusFilter !== "all" && c.status !== customerStatusFilter) return false;
      if (!q) return true;
      return (
        c.customer_id.toLowerCase().includes(q) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone_number.includes(q)
      );
    });
  }, [customers, search, statusFilter, customerStatusFilter]);

  return (
    <div>
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, Customer ID, email, phone..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={customerStatusFilter} onValueChange={setCustomerStatusFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Customer status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customer Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Account status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Account Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Account No.</th>
                <th className="p-4 font-medium text-right">Balance</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No customers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const account = Array.isArray(c.accounts) ? c.accounts[0] : c.accounts;
                  return (
                    <tr key={c.id} className="border-b border-white/5 last:border-0">
                      <td className="p-4">
                        <p className="font-medium">
                          {c.first_name} {c.last_name}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">{c.customer_id}</p>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        <p>{c.email}</p>
                        <p>{c.phone_number}</p>
                      </td>
                      <td className="p-4 font-mono text-xs">{account?.account_number ?? "—"}</td>
                      <td className="p-4 text-right font-medium">
                        {account ? formatINR(account.balance) : "—"}
                      </td>
                      <td className="p-4 space-y-1">
                        <Badge variant="outline" className={cn("capitalize", STATUS_TONE[c.status])}>
                          {c.status}
                        </Badge>
                        {account && (
                          <div>
                            <Badge variant="outline" className={cn("capitalize", STATUS_TONE[account.status])}>
                              {account.status}
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Link href={`/customers/${c.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        </Link>
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
