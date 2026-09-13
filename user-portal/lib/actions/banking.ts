"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCustomerSession } from "@/lib/supabase/customer";
import { safeErrorMessage, logSupabaseError } from "@/lib/utils";

export type BankingActionResult =
  | { success: true; [key: string]: unknown }
  | { success: false; error: string };

function generateDepositCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEP-${year}-${rand}`;
}

/**
 * Creates a pending deposit request + a linked service_requests row
 * (so it shows up in the Admin Portal's Requests queue). Approving
 * it there calls the existing approve_deposit RPC, which credits
 * the account — this action does NOT touch the balance itself.
 */
export async function createDepositRequest(amount: number): Promise<BankingActionResult> {
  try {
    if (!amount || amount <= 0) return { success: false, error: "Enter a valid deposit amount." };

    const session = await getCustomerSession();
    if (!session || !session.account) return { success: false, error: "Not signed in." };

    const supabase = await createClient();
    const code = generateDepositCode();

    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .insert({
        account_id: session.account.id,
        amount,
        method: "Branch Deposit",
        reference_number: code,
      })
      .select("id")
      .single();

    if (depositError || !deposit) {
      return { success: false, error: safeErrorMessage(depositError, "Could not create deposit request.") };
    }

    const { error: requestError } = await supabase.from("service_requests").insert({
      customer_id: session.customer.id,
      request_type: "deposit_request",
      request_details: { amount, code },
      source_table: "deposits",
      source_id: deposit.id,
    });

    if (requestError) {
      return { success: false, error: safeErrorMessage(requestError, "Could not submit your request.") };
    }

    revalidatePath("/dashboard");

    return { success: true, code };
  } catch (err) {
    logSupabaseError("createDepositRequest failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Creates a withdrawal QR request. Like deposits, this stays
 * pending until an admin approves it via the Requests queue.
 */
export async function createWithdrawalRequest(amount: number): Promise<BankingActionResult> {
  try {
    if (!amount || amount <= 0) return { success: false, error: "Enter a valid withdrawal amount." };

    const session = await getCustomerSession();
    if (!session || !session.account) return { success: false, error: "Not signed in." };

    if (amount > session.account.balance) {
      return { success: false, error: "Insufficient balance." };
    }

    const supabase = await createClient();

    const { data: withdrawalId, error: idError } = await supabase.rpc("next_withdrawal_id");
    if (idError || !withdrawalId) {
      return { success: false, error: safeErrorMessage(idError, "Could not generate a withdrawal ID.") };
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();
    const qrPayload = JSON.stringify({
      bank: "RZE Bank",
      account: session.account.account_number,
      amount,
      withdrawalId,
      expires: expiresAt,
    });

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .insert({
        withdrawal_id: withdrawalId,
        account_id: session.account.id,
        amount,
        qr_payload: qrPayload,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (withdrawalError || !withdrawal) {
      return { success: false, error: safeErrorMessage(withdrawalError, "Could not create withdrawal request.") };
    }

    const { error: requestError } = await supabase.from("service_requests").insert({
      customer_id: session.customer.id,
      request_type: "withdrawal_request",
      request_details: { amount, withdrawalId },
      source_table: "withdrawals",
      source_id: withdrawal.id,
    });

    if (requestError) {
      return { success: false, error: safeErrorMessage(requestError, "Could not submit your request.") };
    }

    revalidatePath("/dashboard");

    return { success: true, withdrawalId, qrPayload, expiresAt };
  } catch (err) {
    logSupabaseError("createWithdrawalRequest failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

const LOAN_TYPE_ENUM_MAP: Record<string, "personal" | "home" | "vehicle" | "education" | "business"> = {
  "Personal Loan": "personal",
  "Home Loan": "home",
  "Vehicle Loan": "vehicle",
  "Education Loan": "education",
  "Business Loan": "business",
  "Women Empowerment Loan": "personal",
};

function mapLoanTypeToEnum(label: string): "personal" | "home" | "vehicle" | "education" | "business" {
  return LOAN_TYPE_ENUM_MAP[label] ?? "personal";
}

export interface LoanApplicationInput {
  loanType: string; // display label, e.g. "Personal Loan", "Women Empowerment Loan"
  amount: number;
  purpose: string;
  monthlyIncome: number; // in ₹/month
  occupation: string;
  documentUrls?: string[];
}

/**
 * Creates a pending loan application + a linked service_requests
 * row (request_type: 'loan_request') so it shows up in the Admin
 * Portal's dedicated Loans queue. The admin enters a CIBIL score and
 * then approves/rejects it there — this action only submits it.
 */
export async function createLoanRequest(input: LoanApplicationInput): Promise<BankingActionResult> {
  try {
    if (!input.amount || input.amount <= 0) return { success: false, error: "Enter a valid loan amount." };
    if (!input.monthlyIncome || input.monthlyIncome <= 0) {
      return { success: false, error: "Enter a valid income." };
    }
    if (!input.occupation?.trim()) return { success: false, error: "Enter your occupation." };
    if (!input.purpose?.trim()) return { success: false, error: "Enter the purpose of the loan." };

    const session = await getCustomerSession();
    if (!session) return { success: false, error: "Not signed in." };

    const supabase = await createClient();

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .insert({
        customer_id: session.customer.id,
        loan_type: mapLoanTypeToEnum(input.loanType),
        loan_category: input.loanType,
        amount: input.amount,
        monthly_income: input.monthlyIncome,
        occupation: input.occupation.trim(),
        purpose: input.purpose.trim(),
        document_urls: input.documentUrls ?? [],
      })
      .select("id")
      .single();

    if (loanError || !loan) {
      return { success: false, error: safeErrorMessage(loanError, "Could not submit your loan application.") };
    }

    const { error: requestError } = await supabase.from("service_requests").insert({
      customer_id: session.customer.id,
      request_type: "loan_request",
      request_details: {
        loanType: input.loanType,
        amount: input.amount,
        purpose: input.purpose.trim(),
        monthlyIncome: input.monthlyIncome,
      },
      priority: input.amount >= 1000000 ? "high" : "medium",
      source_table: "loans",
      source_id: loan.id,
    });

    if (requestError) {
      return { success: false, error: safeErrorMessage(requestError, "Could not submit your request.") };
    }

    return { success: true, loanId: loan.id as string };
  } catch (err) {
    logSupabaseError("createLoanRequest failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export interface LoanApplicationRow {
  id: string;
  loan_type: string;
  loan_category: string | null;
  amount: number;
  status: "pending" | "approved" | "rejected" | "expired";
  cibil_score: number | null;
  rejection_reason: string | null;
  created_at: string;
}

/** Fetches the signed-in customer's past loan applications, newest first. */
export async function getMyLoanApplications(): Promise<LoanApplicationRow[]> {
  const session = await getCustomerSession();
  if (!session) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("id, loan_type, loan_category, amount, status, cibil_score, rejection_reason, created_at")
    .eq("customer_id", session.customer.id)
    .order("created_at", { ascending: false });

  if (error) {
    logSupabaseError("getMyLoanApplications failed:", error);
    return [];
  }
  return (data ?? []) as LoanApplicationRow[];
}

export type TransferIdentifierType = "account_number" | "phone_number" | "upi_id";

/**
 * Transfers are immediate (unlike deposits/withdrawals) — they call
 * the existing atomic process_transfer RPC directly, exactly as it
 * was designed originally.
 */
export async function transferMoney(
  identifier: string,
  identifierType: TransferIdentifierType,
  amount: number,
  note?: string
): Promise<BankingActionResult> {
  try {
    if (!amount || amount <= 0) return { success: false, error: "Enter a valid amount." };
    if (!identifier.trim()) return { success: false, error: "Enter a recipient." };

    const session = await getCustomerSession();
    if (!session || !session.account) return { success: false, error: "Not signed in." };

    // Prevent an obvious self-transfer by account number up front — the
    // RPC also guards this, but this gives a faster, clearer message.
    if (identifierType === "account_number" && identifier.trim() === session.account.account_number) {
      return { success: false, error: "You cannot transfer money to your own account." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("process_transfer", {
      p_sender_account_id: session.account.id,
      p_receiver_identifier: identifier.trim(),
      p_identifier_type: identifierType,
      p_amount: amount,
      p_note: note ?? null,
    });

    if (error) return { success: false, error: safeErrorMessage(error, "Transfer failed. Please try again.") };

    const result = data?.[0];
    if (!result || result.out_status !== "success") {
      return { success: false, error: safeErrorMessage({ message: result?.out_message }, "Transfer failed. Please try again.") };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      transactionId: result.out_transaction_id,
      receiverName: result.out_receiver_name,
    };
  } catch (err) {
    logSupabaseError("transferMoney failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
