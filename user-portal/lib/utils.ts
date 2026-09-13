import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Supabase's PostgrestError / AuthError objects don't always have a
 * useful, non-empty `.message` (a bad service-role key, a network
 * hiccup, etc. can leave it blank or oddly shaped). Passing that
 * straight to the UI is what caused error toasts to show a bare "{}"
 * instead of real text. This guarantees callers only ever get a real,
 * non-empty string back.
 */
export function safeErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

/**
 * Next.js forwards server-side console.error calls to the browser
 * console/dev-overlay, but it can't serialize Supabase error class
 * instances (PostgrestError, AuthError) across that boundary — they
 * show up as a bare "{}" instead of the real message. Logging a
 * plain object with the actual fields pulled out fixes that.
 */
export function logSupabaseError(label: string, error: unknown) {
  if (error && typeof error === "object") {
    const e = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    console.error(label, {
      message: typeof e.message === "string" ? e.message : String(e.message ?? "unknown error"),
      code: e.code ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    });
  } else {
    console.error(label, error);
  }
}
