"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type CustomerStatus = Database["public"]["Tables"]["customers"]["Row"]["status"];

export async function setCustomerStatus(customerId: string, status: CustomerStatus, reason?: string) {
  // NOTE: requireAdmin() uses next/navigation's redirect() internally on
  // failure, which works by throwing a special signal Next.js catches
  // itself — it must stay OUTSIDE any try/catch here, or that redirect
  // would be swallowed as a generic error instead of navigating.
  await requireAdmin();

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_customer_status", {
      p_customer_id: customerId,
      p_new_status: status,
      p_reason: reason ?? null,
    });
    if (error) return { success: false as const, error: error.message };
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/customers");
    return { success: true as const };
  } catch (err) {
    console.error("setCustomerStatus failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}

export async function softDeleteCustomer(customerId: string, reason?: string) {
  await requireAdmin();

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_soft_delete_customer", {
      p_customer_id: customerId,
      p_reason: reason ?? null,
    });
    if (error) return { success: false as const, error: error.message };
    revalidatePath("/customers");
    return { success: true as const };
  } catch (err) {
    console.error("softDeleteCustomer failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}

// ---------------------------------------------------------
// Deposits
// ---------------------------------------------------------
export async function approveDepositRequest(depositId: string) {
  await requireAdmin();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_approve_deposit", { p_deposit_id: depositId });
    if (error) return { success: false as const, error: error.message };
    const result = data?.[0];
    if (result?.out_status !== "success") {
      return { success: false as const, error: result?.out_message ?? "Could not approve deposit." };
    }
    revalidatePath("/deposits");
    return { success: true as const };
  } catch (err) {
    console.error("approveDepositRequest failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}

export async function rejectDepositRequest(depositId: string, reason: string) {
  await requireAdmin();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_reject_deposit", {
      p_deposit_id: depositId,
      p_reason: reason || null,
    });
    if (error) return { success: false as const, error: error.message };
    const result = data?.[0];
    if (result?.out_status !== "success") {
      return { success: false as const, error: result?.out_message ?? "Could not reject deposit." };
    }
    revalidatePath("/deposits");
    return { success: true as const };
  } catch (err) {
    console.error("rejectDepositRequest failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}

// ---------------------------------------------------------
// Loans
// ---------------------------------------------------------
export async function setLoanCibilScore(loanId: string, score: number) {
  await requireAdmin();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_set_loan_cibil_score", {
      p_loan_id: loanId,
      p_score: score,
    });
    if (error) return { success: false as const, error: error.message };
    const result = data?.[0];
    if (result?.out_status !== "success") {
      return { success: false as const, error: result?.out_message ?? "Could not save the CIBIL score." };
    }
    revalidatePath("/loans");
    return { success: true as const };
  } catch (err) {
    console.error("setLoanCibilScore failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}

export async function approveLoanRequest(loanId: string) {
  await requireAdmin();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_approve_loan", { p_loan_id: loanId });
    if (error) return { success: false as const, error: error.message };
    const result = data?.[0];
    if (result?.out_status !== "success") {
      return { success: false as const, error: result?.out_message ?? "Could not approve loan." };
    }
    revalidatePath("/loans");
    return { success: true as const };
  } catch (err) {
    console.error("approveLoanRequest failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}

export async function rejectLoanRequest(loanId: string, reason: string) {
  await requireAdmin();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_reject_loan", {
      p_loan_id: loanId,
      p_reason: reason || null,
    });
    if (error) return { success: false as const, error: error.message };
    const result = data?.[0];
    if (result?.out_status !== "success") {
      return { success: false as const, error: result?.out_message ?? "Could not reject loan." };
    }
    revalidatePath("/loans");
    return { success: true as const };
  } catch (err) {
    console.error("rejectLoanRequest failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}

export async function adjustAccountBalance(
  accountId: string,
  amount: number,
  type: "admin_credit" | "admin_debit" | "interest_credit",
  note?: string
) {
  await requireAdmin();

  try {
    if (!amount || amount <= 0) {
      return { success: false as const, error: "Enter a valid amount." };
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_adjust_balance", {
      p_account_id: accountId,
      p_amount: amount,
      p_txn_type: type,
      p_note: note ?? null,
    });
    if (error) return { success: false as const, error: error.message };
    revalidatePath("/customers");
    return { success: true as const };
  } catch (err) {
    console.error("adjustAccountBalance failed:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}
