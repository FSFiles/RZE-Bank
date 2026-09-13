"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  clearSession,
  findCustomerById,
  findAccountByCustomerId,
} from "./store";
import type { MockCustomer, MockAccount } from "./types";

/**
 * Loads the mock-logged-in customer + account from localStorage.
 * Redirects to /login if there's no active session.
 */
export function useMockSession(options?: { redirectIfMissing?: boolean }) {
  const redirectIfMissing = options?.redirectIfMissing ?? true;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<MockCustomer | null>(null);
  const [account, setAccount] = useState<MockAccount | null>(null);

  const refresh = useCallback(() => {
    const customerId = getSession();
    if (!customerId) {
      setCustomer(null);
      setAccount(null);
      setLoading(false);
      if (redirectIfMissing) router.replace("/login");
      return;
    }
    const c = findCustomerById(customerId);
    if (!c) {
      setCustomer(null);
      setAccount(null);
      setLoading(false);
      if (redirectIfMissing) router.replace("/login");
      return;
    }
    setCustomer(c);
    setAccount(findAccountByCustomerId(customerId) ?? null);
    setLoading(false);
  }, [redirectIfMissing, router]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    clearSession();
    router.replace("/");
  }

  return { loading, customer, account, refresh, logout };
}
