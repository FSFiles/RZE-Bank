"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RealTransactionPinModal } from "@/components/dashboard/real-transaction-pin-modal";
import { formatINR } from "@/utils/format";

export function BalanceReveal({ balance }: { balance: number }) {
  const [visible, setVisible] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  function toggle() {
    if (visible) {
      setVisible(false);
      return;
    }
    setPinModalOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1">Available Balance</p>
        <button onClick={toggle} aria-label={visible ? "Hide balance" : "Show balance"} className="text-muted-foreground hover:text-[hsl(var(--gold))]">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xl font-display font-semibold mt-1 text-[hsl(var(--gold))]">
        {visible ? formatINR(balance) : "•••••••••••"}
      </p>
      <RealTransactionPinModal
        open={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onVerified={() => {
          setPinModalOpen(false);
          setVisible(true);
        }}
      />
    </>
  );
}

export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.replace("/");
    router.refresh();
  }
  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 shrink-0">
      <LogOut className="h-4 w-4" /> Log Out
    </Button>
  );
}
