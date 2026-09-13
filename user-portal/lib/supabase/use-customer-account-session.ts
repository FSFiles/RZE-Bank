"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Customer, Account } from "@/lib/supabase/customer";
import type { MockCustomer, MockAccount } from "@/lib/mock/types";

/**
 * Bridges the REAL Supabase Auth session into the shape the
 * temporary mock-data pages (lib/mock/*) were written against.
 *
 * Several dashboard pages (loans, fixed-deposit, cards, investments,
 * statement, help, upi, profile, settings, security, services) were
 * built against `useMockSession()`, which reads a customer id from
 * localStorage that is only ever set by the old mock login flow.
 * Since the app moved to real Supabase Auth, that localStorage key
 * is never set for a real logged-in customer, so `useMockSession()`
 * always found "no session" and bounced the user straight back to
 * /login — which is why these Quick Actions looked like they weren't
 * opening at all.
 *
 * This hook fetches the real customer + account from Supabase and
 * maps them onto the MockCustomer/MockAccount shape, so it's a
 * drop-in replacement for `useMockSession()` with the same
 * `{ loading, customer, account, refresh, logout }` return shape —
 * no changes needed to the rest of each page.
 */

function toMockCustomer(c: Customer): MockCustomer {
  return {
    id: c.id,
    customerId: c.customer_id,
    firstName: c.first_name,
    lastName: c.last_name,
    dob: c.dob,
    gender: c.gender,
    mobileNumber: c.phone_number,
    email: c.email,
    addressLine1: c.address_line1,
    addressLine2: c.address_line2 ?? undefined,
    city: c.city,
    state: c.state,
    pinCode: c.pin_code,
    country: c.country,
    password: "",
    photoDataUrl: c.profile_picture_url ?? undefined,
    twoFactorEnabled: c.security_settings?.two_factor_enabled ?? false,
    lastLoginAt: c.updated_at,
    createdAt: c.created_at,
  };
}

function toMockAccount(a: Account, customerId: string): MockAccount {
  return {
    id: a.id,
    customerId,
    accountNumber: a.account_number,
    accountType: a.account_type,
    balance: a.balance,
    ifsc: a.ifsc,
    branch: a.branch,
    status: a.status,
  };
}

export function useCustomerAccountSession(options?: { redirectIfMissing?: boolean }) {
  const redirectIfMissing = options?.redirectIfMissing ?? true;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<MockCustomer | null>(null);
  const [account, setAccount] = useState<MockAccount | null>(null);

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCustomer(null);
        setAccount(null);
        setLoading(false);
        if (redirectIfMissing) router.replace("/login");
        return;
      }

      const { data: customerRow, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("auth_user_id", user.id)
        .is("deleted_at", null)
        .maybeSingle();

      if (customerError || !customerRow) {
        setCustomer(null);
        setAccount(null);
        setLoading(false);
        if (redirectIfMissing) router.replace("/login");
        return;
      }

      const { data: accountRow } = await supabase
        .from("accounts")
        .select("*")
        .eq("customer_id", customerRow.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      setCustomer(toMockCustomer(customerRow as Customer));
      setAccount(accountRow ? toMockAccount(accountRow as Account, (customerRow as Customer).customer_id) : null);
      setLoading(false);
    } catch (err) {
      console.error("useCustomerAccountSession: failed to load session:", err);
      setCustomer(null);
      setAccount(null);
      setLoading(false);
    }
  }, [redirectIfMissing, router]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCustomer(null);
    setAccount(null);
    router.replace("/");
  }

  return { loading, customer, account, refresh, logout };
}
