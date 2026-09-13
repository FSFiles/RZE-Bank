"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, X, Loader2, ChevronDown, ChevronUp, Gauge, Save } from "lucide-react";
import { toast } from "sonner";
import { setLoanCibilScore, approveLoanRequest, rejectLoanRequest } from "@/lib/admin/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatINR } from "@/utils/format";

interface LoanCustomer {
  id: string;
  first_name: string;
  last_name: string;
  customer_id: string;
  email: string;
  phone_number: string;
}

export interface LoanRequestRow {
  id: string;
  loan_type: string;
  loan_category: string | null;
  amount: number;
  monthly_income: number;
  occupation: string;
  purpose: string;
  document_urls: string[];
  status: "pending" | "approved" | "rejected" | "expired";
  cibil_score: number | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  customer_id: string;
  customers: LoanCustomer[] | LoanCustomer | null;
}

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  expired: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

function cibilTone(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 750) return "text-emerald-400";
  if (score >= 650) return "text-amber-400";
  return "text-red-400";
}

function single<T>(v: T[] | T | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export function LoanRequestTable({ requests }: { requests: LoanRequestRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [rejectTarget, setRejectTarget] = useState<LoanRequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const customer = single(r.customers);
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.loan_category ?? r.loan_type).toLowerCase().includes(q) ||
        customer?.first_name.toLowerCase().includes(q) ||
        customer?.last_name.toLowerCase().includes(q) ||
        customer?.customer_id.toLowerCase().includes(q) ||
        customer?.email.toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter]);

  async function handleSaveScore(id: string) {
    const raw = scoreDrafts[id];
    const score = Number(raw);
    if (!raw || Number.isNaN(score) || score < 300 || score > 900) {
      toast.error("Enter a CIBIL score between 300 and 900.");
      return;
    }
    setBusyId(id);
    const result = await setLoanCibilScore(id, score);
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("CIBIL score saved.");
    router.refresh();
  }

  async function handleApprove(id: string) {
    setBusyId(id);
    const result = await approveLoanRequest(id);
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Loan approved. Customer has been notified.");
    router.refresh();
  }

  async function handleReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setBusyId(rejectTarget.id);
    const result = await rejectLoanRequest(rejectTarget.id, rejectReason.trim());
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Loan rejected. Customer has been notified.");
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
              placeholder="Search by customer, Customer ID, loan type..."
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
                <th className="p-4 font-medium">Applicant</th>
                <th className="p-4 font-medium">Loan Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">CIBIL Score</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No loan applications match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const customer = single(r.customers);
                  const isBusy = busyId === r.id;
                  const isExpanded = expandedId === r.id;
                  const draft = scoreDrafts[r.id] ?? "";

                  return (
                    <Fragment key={r.id}>
                      <tr className="border-b border-white/5 last:border-0 align-top">
                        <td className="p-4">
                          <p className="font-medium">
                            {customer ? `${customer.first_name} ${customer.last_name}` : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">{customer?.customer_id}</p>
                        </td>
                        <td className="p-4 capitalize">{r.loan_category ?? r.loan_type}</td>
                        <td className="p-4 font-medium">{formatINR(r.amount)}</td>
                        <td className="p-4">
                          {r.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={300}
                                max={900}
                                placeholder={r.cibil_score ? String(r.cibil_score) : "e.g. 742"}
                                value={draft}
                                onChange={(e) =>
                                  setScoreDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))
                                }
                                className="h-8 w-24"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 px-2"
                                disabled={isBusy || !draft}
                                onClick={() => handleSaveScore(r.id)}
                              >
                                {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          ) : (
                            <span className={cn("flex items-center gap-1 font-medium", cibilTone(r.cibil_score))}>
                              <Gauge className="h-3.5 w-3.5" />
                              {r.cibil_score ?? "—"}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("capitalize", STATUS_TONE[r.status])}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white"
                            >
                              Details {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {r.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="gap-1.5"
                                  disabled={isBusy || r.cibil_score === null}
                                  title={r.cibil_score === null ? "Enter a CIBIL score first" : undefined}
                                  onClick={() => handleApprove(r.id)}
                                >
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
                          <td colSpan={6} className="p-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Monthly Income</p>
                                <p className="text-sm">{formatINR(r.monthly_income)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Occupation</p>
                                <p className="text-sm">{r.occupation}</p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground">Purpose</p>
                                <p className="text-sm">{r.purpose}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Customer Contact</p>
                                <p className="text-sm">{customer?.email}</p>
                                <p className="text-sm text-muted-foreground">{customer?.phone_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Applied On</p>
                                <p className="text-sm">{new Date(r.created_at).toLocaleString("en-IN")}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Documents</p>
                                {r.document_urls.length ? (
                                  <div className="flex flex-col gap-1">
                                    {r.document_urls.map((url, i) => (
                                      <a
                                        key={url}
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-[hsl(var(--gold))] hover:underline"
                                      >
                                        Document {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">None uploaded</p>
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
        title="Reject Loan Application"
        description="This reason will be shown to the customer."
      >
        <div className="space-y-4">
          {rejectTarget && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
              {formatINR(rejectTarget.amount)} — {rejectTarget.loan_category ?? rejectTarget.loan_type}
            </div>
          )}
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. CIBIL score below the minimum threshold for this loan type."
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
