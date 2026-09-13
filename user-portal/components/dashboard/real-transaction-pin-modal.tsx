"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { PinInput } from "./pin-input";
import { createClient } from "@/lib/supabase/client";

export function RealTransactionPinModal({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [needsCreation, setNeedsCreation] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase.rpc("has_transaction_pin").then(({ data }) => {
      setNeedsCreation(!data);
    });
  }, [open]);

  function reset() {
    setPin("");
    setConfirmPin("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleCreate() {
    if (pin.length !== 4) {
      setError("Enter a 4-digit PIN.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("set_transaction_pin", { p_pin: pin });
    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    toast.success("Transaction PIN created.");
    reset();
    onVerified();
  }

  async function handleVerify() {
    if (pin.length !== 4) {
      setError("Enter your 4-digit PIN.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data: ok, error: rpcError } = await supabase.rpc("verify_transaction_pin", { p_pin: pin });
    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    if (!ok) {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      return;
    }
    reset();
    onVerified();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={needsCreation ? "Create Your Transaction PIN" : "Enter Transaction PIN"}
      description={
        needsCreation
          ? "Set a secure 4-digit PIN to protect your transfers."
          : "Enter your 4-digit PIN to continue."
      }
    >
      <div className="flex flex-col items-center gap-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30">
          <ShieldCheck className="h-5 w-5 text-[hsl(var(--gold))]" />
        </span>

        {needsCreation === null ? (
          <p className="text-sm text-muted-foreground">Checking...</p>
        ) : (
          <>
            <div className="w-full space-y-2">
              <p className="text-center text-xs text-muted-foreground">
                {needsCreation ? "New PIN" : "PIN"}
              </p>
              <PinInput value={pin} onChange={setPin} autoFocus />
            </div>

            {needsCreation && (
              <div className="w-full space-y-2">
                <p className="text-center text-xs text-muted-foreground">Confirm PIN</p>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              className="w-full"
              size="lg"
              disabled={submitting}
              onClick={needsCreation ? handleCreate : handleVerify}
            >
              {submitting ? "Please wait..." : needsCreation ? "Save PIN" : "Verify PIN"}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
