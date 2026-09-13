"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RequestCustomer {
  first_name: string;
  last_name: string;
  customer_id: string;
  email: string;
}

interface ServiceRequestRow {
  id: string;
  request_type: string;
  request_details: Record<string, unknown>;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "approved" | "rejected" | "expired" | "needs_info" | "closed";
  admin_message: string | null;
  created_at: string;
  customer_id: string;
  customers: RequestCustomer[] | RequestCustomer | null;
}

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  expired: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  needs_info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  closed: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

const PRIORITY_TONE: Record<string, string> = {
  low: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  medium: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  high: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  urgent: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function RequestTable({ requests }: { requests: ServiceRequestRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ServiceRequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        r.request_type.toLowerCase().includes(q) ||
        customer?.first_name.toLowerCase().includes(q) ||
        customer?.last_name.toLowerCase().includes(q) ||
        customer?.customer_id.toLowerCase().includes(q) ||
        customer?.email.toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter, priorityFilter]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("admin_review_service_request", {
        p_request_id: id,
        p_new_status: "approved",
      });
      if (error) {
        toast.error(error.message || "Failed to approve request.");
        return;
      }
      toast.success("Request approved. Customer has been notified.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setBusyId(rejectTarget.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("admin_review_service_request", {
        p_request_id: rejectTarget.id,
        p_new_status: "rejected",
        p_admin_message: rejectReason.trim(),
      });
      if (error) {
        toast.error(error.message || "Failed to reject request.");
        return;
      }
      toast.success("Request rejected. Customer has been notified.");
      setRejectTarget(null);
      setRejectReason("");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, Customer ID, request type..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="needs_info">Needs Info</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                <th className="p-4 font-medium">Request ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No requests match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
                  const isBusy = busyId === r.id;
                  return (
                    <tr key={r.id} className="border-b border-white/5 last:border-0">
                      <td className="p-4 font-mono text-xs">{r.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <p className="font-medium">{customer ? `${customer.first_name} ${customer.last_name}` : "—"}</p>
                        <p className="text-xs text-muted-foreground">{customer?.email}</p>
                      </td>
                      <td className="p-4 capitalize">{r.request_type.replace(/_/g, " ")}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn("capitalize", PRIORITY_TONE[r.priority])}>
                          {r.priority}
                        </Badge>
                      </td>
                      <td className="p-4">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn("capitalize", STATUS_TONE[r.status])}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {r.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gap-1.5"
                              disabled={isBusy}
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
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {r.admin_message ? `"${r.admin_message}"` : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
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
        title="Reject Request"
        description="This reason will be shown to the customer."
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Documents submitted do not match KYC records."
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
