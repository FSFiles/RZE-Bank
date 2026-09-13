"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Trash2, PlusCircle, MinusCircle } from "lucide-react";
import { setCustomerStatus, softDeleteCustomer, adjustAccountBalance } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

export function CustomerLifecycleActions({
  customerId,
  accountId,
  status,
}: {
  customerId: string;
  accountId: string | null;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState<"admin_credit" | "admin_debit" | null>(null);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");

  function handleStatusChange(newStatus: "active" | "suspended" | "rejected") {
    startTransition(async () => {
      const result = await setCustomerStatus(customerId, newStatus);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Customer status set to ${newStatus}.`);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await softDeleteCustomer(customerId, reason.trim() || undefined);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Customer soft-deleted.");
      setDeleteModalOpen(false);
      router.push("/customers");
    });
  }

  function handleAdjust() {
    if (!accountId || !adjustModalOpen) return;
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    startTransition(async () => {
      const result = await adjustAccountBalance(accountId, value, adjustModalOpen, reason.trim() || undefined);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Account ${adjustModalOpen === "admin_credit" ? "credited" : "debited"}.`);
      setAdjustModalOpen(null);
      setAmount("");
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "active" && (
        <Button size="sm" variant="outline" className="gap-1.5" disabled={isPending} onClick={() => handleStatusChange("active")}>
          <ShieldCheck className="h-3.5 w-3.5" /> Activate
        </Button>
      )}
      {status !== "suspended" && (
        <Button size="sm" variant="outline" className="gap-1.5" disabled={isPending} onClick={() => handleStatusChange("suspended")}>
          <ShieldOff className="h-3.5 w-3.5" /> Suspend
        </Button>
      )}
      {status === "pending" && (
        <Button size="sm" variant="outline" className="gap-1.5 border-red-500/40 text-red-400" disabled={isPending} onClick={() => handleStatusChange("rejected")}>
          Reject
        </Button>
      )}
      <Button size="sm" variant="outline" className="gap-1.5" disabled={isPending || !accountId} onClick={() => setAdjustModalOpen("admin_credit")}>
        <PlusCircle className="h-3.5 w-3.5" /> Credit
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" disabled={isPending || !accountId} onClick={() => setAdjustModalOpen("admin_debit")}>
        <MinusCircle className="h-3.5 w-3.5" /> Debit
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5 border-red-500/40 text-red-400" disabled={isPending} onClick={() => setDeleteModalOpen(true)}>
        <Trash2 className="h-3.5 w-3.5" /> Soft Delete
      </Button>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Soft Delete Customer" description="This can be reversed manually in the database if needed.">
        <div className="space-y-4">
          <Input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button className="w-full" variant="outline" onClick={handleDelete} disabled={isPending}>
            Confirm Soft Delete
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(adjustModalOpen)}
        onClose={() => setAdjustModalOpen(null)}
        title={adjustModalOpen === "admin_credit" ? "Credit Account" : "Debit Account"}
      >
        <div className="space-y-4">
          <Input type="number" min={1} placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input placeholder="Note (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button className="w-full" onClick={handleAdjust} disabled={isPending}>
            Confirm {adjustModalOpen === "admin_credit" ? "Credit" : "Debit"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
