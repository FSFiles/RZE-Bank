"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/lib/supabase/customer";

export function useRealCustomerSession() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCustomer(null);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("auth_user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();
    setCustomer(data ?? null);

    if (data) {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", data.id)
        .eq("is_read", false);
      setUnreadCount(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => refresh());
    return () => subscription.unsubscribe();
  }, [refresh]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCustomer(null);
    router.replace("/");
    router.refresh();
  }

  return { loading, customer, unreadCount, logout };
}
