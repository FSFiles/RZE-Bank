"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, X, Loader2, Landmark, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { approveDepositRequest, rejectDepositRequest } from "@/lib/admin/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatINR } from "@/utils/format";

interface DepositCustomer {
  id: string;
  first_name: string;
  last_name: string;
  customer_id: string;
  email: string;
  phone_number: string;
}

interface DepositAccount {
  account_number: string;
  account_type: string;
  balance: number;
  customers: DepositCustomer[] | DepositCustomer | null;
}

export interface DepositRequestRow {
  id: string;
  amount: number;
  method: string;
  reference_number: string;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected" | "expired";
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  account_id: string;
  accounts: DepositAccount[] | DepositAccount | null;
}

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  expired: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

function single<T>(v: T[] | T | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export function DepositRequestTable({ requests }: { requests: DepositRequestRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DepositRequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const account = single(r.accounts);
      const customer = account ? single(account.customers) : null;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.reference_number.toLowerCase().includes(q) ||
        account?.account_number.toLowerCase().includes(q) ||
        customer?.first_name.toLowerCase().includes(q) ||
        customer?.last_name.toLowerCase().includes(q) ||
        customer?.customer_id.toLowerCase().includes(q) ||
        customer?.email.toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter]);

  async function handleApprove(id: string) {
    setBusyId(id);
    const result = await approveDepositRequest(id);
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Deposit approved and credited to the customer's account.");
    router.refresh();
  }

  async function handleReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setBusyId(rejectTarget.id);
    const result = await rejectDepositRequest(rejectTarget.id, rejectReason.trim());
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Deposit rejected. Customer has been notified.");
    setRejectTarget(null);
    setRejectReason("");
    router.refresh();
  }

  return (
    <div>
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, account number, reference..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
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
                <th className="p-4 font-medium">Account</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No deposit requests match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const account = single(r.accounts);
                  const customer = account ? single(account.customers) : null;
                  const isBusy = busyId === r.id;
                  const isExpanded = expandedId === r.id;
                  return (
                    <Fragment key={r.id}>
                      <tr className="border-b border-white/5 last:border-0">
                        <td className="p-4">
                          <p className="font-medium">
                            {customer ? `${customer.first_name} ${customer.last_name}` : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">{customer?.customer_id}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-xs">{account?.account_number ?? "—"}</p>
                          <p className="text-xs capitalize text-muted-foreground">{account?.account_type}</p>
                        </td>
                        <td className="p-4 font-medium">{formatINR(r.amount)}</td>
                        <td className="p-4">{r.method}</td>
                        <td className="p-4">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("capitalize", STATUS_TONE[r.status])}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white"
                            >
                              Details {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {r.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" className="gap-1.5" disabled={isBusy} onClick={() => handleApprove(r.id)}>
                                  {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"
                                  disabled={isBusy}
                                  onClick={() => setRejectTarget(r)}
                                >
                                  <X className="h-3.5 w-3.5" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Reference Number</p>
                                <p className="font-mono text-sm">{r.reference_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Current Balance</p>
                                <p className="text-sm">{account ? formatINR(account.balance) : "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Customer Contact</p>
                                <p className="text-sm">{customer?.email}</p>
                                <p className="text-sm text-muted-foreground">{customer?.phone_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Receipt</p>
                                {r.receipt_url ? (
                                  <a
                                    href={r.receipt_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-[hsl(var(--gold))] hover:underline"
                                  >
                                    View receipt
                                  </a>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Not provided</p>
                                )}
                              </div>
                              {r.status === "rejected" && r.rejection_reason && (
                                <div className="sm:col-span-4">
                                  <p className="text-xs text-muted-foreground">Rejection Reason</p>
                                  <p className="text-sm text-red-400">{r.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        title="Reject Deposit"
        description="This reason will be shown to the customer."
      >
        <div className="space-y-4">
          {rejectTarget && (
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
              <Landmark className="h-4 w-4 text-[hsl(var(--gold))]" />
              {formatINR(rejectTarget.amount)} — {rejectTarget.reference_number}
            </div>
          )}
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Reference number does not match branch records."
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--gold))]/50"
          />
          <Button className="w-full" onClick={handleReject} disabled={busyId === rejectTarget?.id}>
            {busyId === rejectTarget?.id ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
