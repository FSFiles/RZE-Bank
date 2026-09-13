"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, findCustomerById } from "./store";

/**
 * Use on guest-only pages (login, register). If a valid mock session
 * already exists, immediately redirects to /dashboard instead of
 * rendering the guest page — so a logged-in customer can never land
 * back on the Login/Register screens by navigating, refreshing, or
 * using the browser back button.
 */
export function useGuestOnly() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const customerId = getSession();
    if (customerId && findCustomerById(customerId)) {
      router.replace("/dashboard");
      return;
    }
    setChecking(false);
  }, [router]);

  return { checking };
}
