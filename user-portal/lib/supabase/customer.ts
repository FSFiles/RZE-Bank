import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logSupabaseError } from "@/lib/utils";
import type { Database } from "@/types/database.types";

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Account = Database["public"]["Tables"]["accounts"]["Row"];

/**
 * Resolves the current customer + their primary account for the
 * logged-in Supabase Auth session. Server-only. Returns null if
 * there's no session or no matching customer row (e.g. mid-way
 * through email verification, before the trigger has run).
 *
 * Wrapped in React's `cache()` so that if multiple server components
 * in the same request tree (e.g. a layout and a page) both call this,
 * it only hits the database once instead of duplicating every query.
 *
 * The customer + their oldest account are fetched in a single request
 * via the `accounts_customer_id_fkey` relationship, instead of two
 * sequential round trips — this measurably speeds up every dashboard
 * page load and navigation.
 */
export const getCustomerSession = cache(async function getCustomerSession(): Promise<{
  customer: Customer;
  account: Account | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  type CustomerWithAccounts = Customer & { accounts: Account[] | null };

  let { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*, accounts(*)")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle<CustomerWithAccounts>();

  // If migration 0005 hasn't been run yet, the `deleted_at` column
  // won't exist and the query above errors out (silently returning
  // null before this fix, which made the whole dashboard render
  // blank). Fall back to a query without that filter so the app
  // still works pre-migration, instead of quietly failing.
  if (customerError) {
    logSupabaseError("getCustomerSession: customers query failed, retrying without deleted_at filter:", customerError);
    const fallback = await supabase
      .from("customers")
      .select("*, accounts(*)")
      .eq("auth_user_id", user.id)
      .maybeSingle<CustomerWithAccounts>();
    customer = fallback.data;
    if (fallback.error) {
      logSupabaseError("getCustomerSession: customers fallback query also failed:", fallback.error);
    }
  }

  if (!customer) return null;

  const { accounts, ...customerRow } = customer;
  const account =
    accounts && accounts.length > 0
      ? [...accounts].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0]
      : null;

  return { customer: customerRow, account };
});

/** Use at the top of customer server pages. Middleware already
 * redirects unauthenticated requests before they reach here. */
export async function requireCustomer(): Promise<{ customer: Customer; account: Account }> {
  const session = await getCustomerSession();
  if (!session) {
    console.warn("requireCustomer: no session/customer row found — redirecting to /login");
    redirect("/login");
  }
  if (!session.account) {
    console.error(
      `requireCustomer: customer ${session.customer.customer_id} has no account row — redirecting to /login`
    );
    redirect("/login");
  }
  return { customer: session.customer, account: session.account };
}
