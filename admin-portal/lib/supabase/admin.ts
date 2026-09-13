import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];

/**
 * Resolves the current admin_users row for the logged-in Supabase
 * Auth session, or null if there isn't one (not logged in, or a
 * logged-in user with no matching admin_users row). Server-only.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return admin;
}

/**
 * Use at the top of admin server components/layouts. Middleware
 * already redirects unauthenticated/non-admin requests before they
 * reach here — this is the defense-in-depth second check.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");
  return admin;
}
