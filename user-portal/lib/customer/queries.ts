import { createClient } from "@/lib/supabase/server";
import { logSupabaseError } from "@/lib/utils";

export async function getAccountTransactions(accountId: string, limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    logSupabaseError("getAccountTransactions failed:", error);
  }
  return data ?? [];
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export async function getPaginatedTransactions(accountId: string, filters: TransactionFilters) {
  const supabase = await createClient();
  const pageSize = filters.pageSize ?? 15;
  const page = Math.max(1, filters.page ?? 1);
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type as never);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status as never);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);

  const { data, count } = await query.range(start, end);

  return {
    transactions: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function getCustomerNotifications(customerId: string, limit = 30) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getUnreadNotificationCount(customerId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("is_read", false);
  return count ?? 0;
}

export async function getCustomerServiceRequests(customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_requests")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCustomerLoans(customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
