import { z } from "zod";

// Aadhaar: 12 digits, first digit 2-9
export const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;

// PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Indian mobile number: 10 digits, starts 6-9
export const mobileRegex = /^[6-9][0-9]{9}$/;

// PIN code: 6 digits, first digit not 0
export const pinCodeRegex = /^[1-9][0-9]{5}$/;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

// Step 1 of signup: just enough to create the login (email + password).
// All KYC details (name, DOB, Aadhaar, PAN, address, account type...) are
// collected later in `completeProfileSchema`, after the email address has
// been verified.
export const registerSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),

    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms & Conditions" }),
    }),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Privacy Policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Customer ID: RZE-CUST-000001
export const customerIdRegex = /^RZE-CUST-\d{6}$/;

export const loginSchema = z.object({
  customerId: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Customer ID is required")
    .regex(customerIdRegex, "Enter a valid Customer ID (e.g. RZE-CUST-000001)"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your Customer ID or email address")
    .refine(
      (val) => customerIdRegex.test(val.toUpperCase()) || z.string().email().safeParse(val).success,
      "Enter a valid Customer ID (e.g. RZE-CUST-000001) or email address"
    ),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Step 2 of signup (used by BOTH the Google flow and the email/password
// flow, once the user is authenticated with a verified email): no
// password fields here — just the KYC details needed to open the account.
export const completeProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const age = (Date.now() - new Date(val).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18;
    }, "You must be at least 18 years old"),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),

  mobileNumber: z
    .string()
    .trim()
    .regex(mobileRegex, "Enter a valid 10-digit Indian mobile number"),

  aadhaarNumber: z
    .string()
    .trim()
    .regex(aadhaarRegex, "Enter a valid 12-digit Aadhaar number"),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(4, "PAN number is required")
    .max(20, "PAN number is too long"),

  addressLine1: z.string().trim().min(1, "Address line 1 is required").max(100),
  addressLine2: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(50),
  state: z.string().trim().min(1, "State is required").max(50),
  pinCode: z.string().trim().regex(pinCodeRegex, "Enter a valid 6-digit PIN code"),
  country: z.string().trim().min(1).default("India"),

  accountType: z.enum(["savings", "current"], { required_error: "Select an account type" }),

  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms & Conditions" }),
  }),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Privacy Policy" }),
  }),
});

export type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;
