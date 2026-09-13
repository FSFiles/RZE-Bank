"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  completeProfileSchema,
  type RegisterFormValues,
  type LoginFormValues,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
  type CompleteProfileFormValues,
} from "@/lib/validations/auth";
import { safeErrorMessage, logSupabaseError } from "@/lib/utils";

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export type ProvisionResult =
  | { success: true; customerId: string; accountNumber: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Step 1 of registration: just email + password.
 *
 * This only creates the Supabase Auth user and emails a verification
 * link — no KYC data is collected or stored yet. Once the user clicks
 * the link in their inbox, `/auth/callback` verifies them, signs them
 * in, and (finding no `customers` row yet) sends them to
 * `/complete-profile` to fill in their name, Aadhaar, PAN, address,
 * etc. The Customer ID and Account Number are generated only after
 * that second step, via the `provision_customer` RPC — see
 * `completeCustomerProfile` below.
 */
export async function registerCustomer(values: RegisterFormValues): Promise<ActionResult> {
  try {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
    }
    const data = parsed.data;

    const admin = createAdminClient();

    // Duplicate email check — already a fully registered customer
    const { data: existingEmail } = await admin
      .from("customers")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (existingEmail) {
      return {
        success: false,
        error: "An account with this email already exists.",
        fieldErrors: { email: "Email already registered" },
      };
    }

    const { data: existingAuthUsers } = await admin.auth.admin.listUsers();
    const matchingUser = existingAuthUsers?.users.find(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase()
    );

    if (matchingUser) {
      if (matchingUser.email_confirmed_at) {
        // Verified but somehow no customer row (shouldn't normally
        // happen) — send them to finish their profile instead of
        // erroring out.
        return {
          success: false,
          error:
            "This email is already verified. Please log in, or continue completing your profile.",
          fieldErrors: { email: "Email already registered" },
        };
      }
      // A previous, never-verified signup attempt. Clean it up so
      // createUser below doesn't fail with "already registered", and
      // so this attempt's password takes effect.
      await admin.auth.admin.deleteUser(matchingUser.id);
    }

    // Create the Supabase Auth user (unverified)
    const { data: signUpData, error: signUpError } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: false,
    });

    if (signUpError || !signUpData.user) {
      logSupabaseError("registerCustomer: createUser failed:", signUpError);
      return {
        success: false,
        error: safeErrorMessage(signUpError, "Could not create your account. Please try again."),
      };
    }

    // Actually send the verification email. (admin.auth.admin.createUser
    // with email_confirm:false does NOT send one on its own, and
    // generateLink() only returns a link — it doesn't dispatch mail
    // either. resend() is the call that actually emails the user.)
    const { error: resendError } = await admin.auth.resend({
      type: "signup",
      email: data.email,
      options: { emailRedirectTo: `${SITE_URL}/auth/confirm?next=/complete-profile` },
    });

    if (resendError) {
      // The account was created successfully — don't fail the whole
      // registration over the email step; let them use "Resend
      // verification email" on the login page instead.
      return {
        success: true,
        message:
          "Account created, but we couldn't send the verification email right away. You can resend it from the login page.",
      };
    }

    return {
      success: true,
      message: "Verification email has been sent to your email address.",
    };
  } catch (err) {
    logSupabaseError("registerCustomer failed:", err);
    return {
      success: false,
      error: "Something went wrong while creating your account. Please try again.",
    };
  }
}

/**
 * Step 2 of registration — used by every first-time user once they're
 * authenticated with a verified email, whether they got there via
 * Google sign-in (pre-verified by Google) or via the email/password
 * flow (verified through the confirmation link). Validates the KYC
 * form and calls the `provision_customer` RPC directly, which creates
 * the Customer + Account rows and returns the freshly generated
 * Customer ID + Account Number so the UI can reveal them.
 */
export async function completeCustomerProfile(
  values: CompleteProfileFormValues
): Promise<ProvisionResult> {
  try {
    const parsed = completeProfileSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: "Please fix the highlighted fields." };
    }
    const data = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { success: false, error: "Your session has expired. Please sign in again." };
    }

    const admin = createAdminClient();

    // Already provisioned? (e.g. user double-submitted or hit back button)
    const { data: existingCustomer } = await admin
      .from("customers")
      .select("customer_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (existingCustomer) {
      return { success: false, error: "Your banking profile already exists." };
    }

    // Duplicate phone/PAN/Aadhaar checks
    const { data: existingPhone } = await admin
      .from("customers")
      .select("id")
      .eq("phone_number", data.mobileNumber)
      .maybeSingle();
    if (existingPhone) {
      return {
        success: false,
        error: "An account with this mobile number already exists.",
        fieldErrors: { mobileNumber: "Mobile number already registered" },
      };
    }

    const { data: existingPan } = await admin
      .from("customers")
      .select("id")
      .eq("pan_number", data.panNumber)
      .maybeSingle();
    if (existingPan) {
      return {
        success: false,
        error: "An account with this PAN number already exists.",
        fieldErrors: { panNumber: "PAN already registered" },
      };
    }

    const { data: existingAadhaar } = await admin
      .from("customers")
      .select("id")
      .eq("aadhaar_number", data.aadhaarNumber)
      .maybeSingle();
    if (existingAadhaar) {
      return {
        success: false,
        error: "An account with this Aadhaar number already exists.",
        fieldErrors: { aadhaarNumber: "Aadhaar already registered" },
      };
    }

    const { data: rpcResult, error: rpcError } = await admin.rpc("provision_customer", {
      p_auth_user_id: user.id,
      p_first_name: data.firstName,
      p_last_name: data.lastName,
      p_phone_number: data.mobileNumber,
      p_email: user.email,
      p_dob: data.dob,
      p_gender: data.gender,
      p_aadhaar_number: data.aadhaarNumber,
      p_pan_number: data.panNumber,
      p_address_line1: data.addressLine1,
      p_address_line2: data.addressLine2 || null,
      p_city: data.city,
      p_state: data.state,
      p_pin_code: data.pinCode,
      p_country: data.country,
      p_account_type: data.accountType,
    });

    if (rpcError || !rpcResult || rpcResult.length === 0) {
      logSupabaseError("completeCustomerProfile: provision_customer rpc failed:", rpcError);
      return {
        success: false,
        error: safeErrorMessage(rpcError, "Could not provision your account. Please try again."),
      };
    }

    const row = rpcResult[0] as { out_customer_id: string; out_account_number: string };

    return {
      success: true,
      customerId: row.out_customer_id,
      accountNumber: row.out_account_number,
    };
  } catch (err) {
    logSupabaseError("completeCustomerProfile failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Login is by Customer ID, but Supabase Auth operates on email under
 * the hood. This looks up the real email for a given Customer ID using
 * the service-role client (bypassing RLS, since an anonymous visitor
 * can't otherwise read another row's email) — the email itself is
 * never shown to the caller, only used server-side to sign in.
 */
async function resolveEmailByCustomerId(customerId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("customers")
    .select("email")
    .eq("customer_id", customerId)
    .maybeSingle();
  return data?.email ?? null;
}

export async function loginCustomer(values: LoginFormValues): Promise<ActionResult> {
  try {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: "Enter a valid Customer ID and password." };
    }

    const email = await resolveEmailByCustomerId(parsed.data.customerId);
    if (!email) {
      // Generic message on purpose — don't reveal whether the Customer ID exists.
      return { success: false, error: "Invalid Customer ID or password." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return { success: false, error: "Please verify your email before logging in." };
      }
      return { success: false, error: "Invalid Customer ID or password." };
    }

    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { success: false, error: "Please verify your email before logging in." };
    }

    return { success: true };
  } catch (err) {
    logSupabaseError("loginCustomer failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function resendVerificationEmail(email: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${SITE_URL}/auth/confirm?next=/complete-profile` },
  });
  if (error) {
    logSupabaseError("resendVerificationEmail failed:", error);
    return { success: false, error: safeErrorMessage(error, "Could not resend the verification email. Please try again.") };
  }
  return { success: true, message: "Verification email resent." };
}

export async function requestPasswordReset(values: ForgotPasswordFormValues): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid Customer ID or email address." };
  }

  const identifier = parsed.data.identifier.trim();
  const looksLikeCustomerId = /^RZE-CUST-\d{6}$/i.test(identifier);
  const email = looksLikeCustomerId
    ? await resolveEmailByCustomerId(identifier.toUpperCase())
    : identifier;

  if (!email) {
    // Same success message either way — don't reveal whether the
    // Customer ID/email is registered.
    return { success: true, message: "If that account exists, a reset link has been sent." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/confirm?next=/reset-password`,
  });
  if (error) {
    logSupabaseError("requestPasswordReset failed:", error);
    return { success: false, error: safeErrorMessage(error, "Could not send the reset link. Please try again.") };
  }
  return { success: true, message: "If that account exists, a reset link has been sent." };
}

export async function updatePassword(values: ResetPasswordFormValues): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Please fix the highlighted fields." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    logSupabaseError("updatePassword failed:", error);
    return { success: false, error: safeErrorMessage(error, "Could not update your password. Please try again.") };
  }
  return { success: true, message: "Password updated successfully." };
}

export async function signOutCustomer(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
