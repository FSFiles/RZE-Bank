import { createClient } from "@/lib/supabase/server";

export interface AdminStats {
  totalCustomers: number;
  totalAccounts: number;
  pendingRequests: number;
  approvedRequests: number;
  totalTransactions: number;
  totalDeposits: number; // sum of approved deposit amounts
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [
    { count: totalCustomers },
    { count: totalAccounts },
    { count: pendingRequests },
    { count: approvedRequests },
    { count: totalTransactions },
    { data: approvedDeposits },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("accounts").select("*", { count: "exact", head: true }),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("deposits").select("amount").eq("status", "approved"),
  ]);

  const totalDeposits = (approvedDeposits ?? []).reduce((sum, d) => sum + Number(d.amount), 0);

  return {
    totalCustomers: totalCustomers ?? 0,
    totalAccounts: totalAccounts ?? 0,
    pendingRequests: pendingRequests ?? 0,
    approvedRequests: approvedRequests ?? 0,
    totalTransactions: totalTransactions ?? 0,
    totalDeposits,
  };
}

/**
 * Monthly transaction volume (sum of amounts) and count, for the
 * last 6 months. Used for both the "Transaction Volume" and
 * "Revenue" charts — there's no separate fee/interest ledger in
 * the schema yet, so deposit inflow is used as the revenue proxy.
 */
export async function getMonthlyVolume() {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);

  const [{ data: txns }, { data: deposits }] = await Promise.all([
    supabase.from("transactions").select("amount, created_at").gte("created_at", since.toISOString()),
    supabase
      .from("deposits")
      .select("amount, created_at")
      .eq("status", "approved")
      .gte("created_at", since.toISOString()),
  ]);

  const months: { key: string; label: string; volume: number; revenue: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      volume: 0,
      revenue: 0,
    });
  }

  (txns ?? []).forEach((t) => {
    const d = new Date(t.created_at);
    const bucket = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.volume += Number(t.amount);
  });

  (deposits ?? []).forEach((dep) => {
    const d = new Date(dep.created_at);
    const bucket = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.revenue += Number(dep.amount);
  });

  return months;
}

export async function getCustomerGrowth() {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);

  const { data: customers } = await supabase
    .from("customers")
    .select("created_at")
    .gte("created_at", since.toISOString());

  const months: { key: string; label: string; newCustomers: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      newCustomers: 0,
    });
  }

  (customers ?? []).forEach((c) => {
    const d = new Date(c.created_at);
    const bucket = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.newCustomers += 1;
  });

  let cumulative = 0;
  return months.map((m) => {
    cumulative += m.newCustomers;
    return { label: m.label, newCustomers: m.newCustomers, total: cumulative };
  });
}

export async function getRecentServiceRequests(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_requests")
    .select("id, request_type, status, priority, created_at, customers(first_name, last_name, customer_id)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllServiceRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_requests")
    .select(
      "id, request_type, request_details, priority, status, admin_message, created_at, customer_id, customers(first_name, last_name, customer_id, email)"
    )
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllCustomersWithAccounts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select(
      "id, customer_id, first_name, last_name, email, phone_number, city, status, created_at, accounts(account_number, account_type, balance, status)"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCustomerDetail(customerId: string) {
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("*, accounts(*)")
    .eq("id", customerId)
    .maybeSingle();

  if (!customer) return null;

  const accountIds = (customer.accounts ?? []).map((a: { id: string }) => a.id);
  const { data: transactions } = accountIds.length
    ? await supabase
        .from("transactions")
        .select("*")
        .in("account_id", accountIds)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return { customer, transactions: transactions ?? [] };
}

export async function getRequestBreakdown() {
  const supabase = await createClient();
  const { data } = await supabase.from("service_requests").select("request_type, priority, status");

  const byType = new Map<string, number>();
  const byPriority = new Map<string, number>();
  (data ?? []).forEach((r) => {
    byType.set(r.request_type, (byType.get(r.request_type) ?? 0) + 1);
    byPriority.set(r.priority, (byPriority.get(r.priority) ?? 0) + 1);
  });

  return {
    byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })),
    byPriority: Array.from(byPriority.entries()).map(([priority, count]) => ({ priority, count })),
  };
}

/**
 * All deposit requests with the full customer + account context the
 * dedicated /deposits page needs (amount, method, reference, receipt,
 * account balance) — queried straight off `deposits`, which is the
 * source of truth for status once admin_approve_deposit/
 * admin_reject_deposit run.
 */
export async function getAllDepositRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deposits")
    .select(
      `id, amount, method, reference_number, receipt_url, status, reviewed_at, rejection_reason, created_at,
       account_id,
       accounts:account_id (
         account_number, account_type, balance,
         customers:customer_id ( id, first_name, last_name, customer_id, email, phone_number )
       )`
    )
    .order("created_at", { ascending: false });
  return data ?? [];
}

/**
 * All loan applications with full applicant context for the
 * dedicated /loans page — including cibil_score so the admin can see
 * at a glance which applications still need a score entered.
 */
export async function getAllLoanRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select(
      `id, loan_type, loan_category, amount, monthly_income, occupation, purpose, document_urls,
       status, cibil_score, rejection_reason, reviewed_at, created_at,
       customer_id,
       customers:customer_id ( id, first_name, last_name, customer_id, email, phone_number )`
    )
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllTransactionsForAdmin(limit = 200) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, status, reference_note, city, created_at, account_id, accounts!transactions_account_id_fkey(account_number, customers(first_name, last_name, customer_id))"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
