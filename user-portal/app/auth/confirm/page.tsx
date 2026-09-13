"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type EmailOtpType = "signup" | "email" | "recovery" | "invite" | "email_change";

function AuthConfirmShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-lg">
          <Card>{children}</Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

/**
 * Supabase's hosted `/auth/v1/verify` link (the default target of
 * `{{ .ConfirmationURL }}` in email templates) verifies the token
 * server-side, then redirects the browser back here. Depending on the
 * project's Auth settings, the resulting session can arrive as:
 *
 *   1. A hash fragment: `#access_token=...&refresh_token=...&type=signup`
 *      (the classic delivery for these email-link verifications — a
 *      server Route Handler can NEVER read this, since fragments are
 *      never sent in the HTTP request; only client-side JS can).
 *   2. A `token_hash` + `type` query pair, if verification hasn't
 *      happened yet and this page needs to call it itself.
 *   3. A PKCE `code` query param.
 *
 * This page is a client component precisely so it can inspect
 * `window.location.hash`, cover all three shapes, and land the user on
 * `next` (defaulting to `/complete-profile`, which itself already
 * redirects on to `/dashboard` if the account is already fully set up).
 */
function AuthConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function run() {
      const supabase = createClient();
      const next = searchParams.get("next") || "/complete-profile";

      let ok = false;

      // Shape 1: hash-fragment session tokens
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          ok = !error;
        }
      }

      // Shape 2: token_hash + type (email OTP verification)
      if (!ok) {
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type") as EmailOtpType | null;
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
          ok = !error;
        }
      }

      // Shape 3: PKCE code
      if (!ok) {
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          ok = !error;
        }
      }

      if (ok) {
        router.replace(next);
      } else {
        setFailed(true);
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <>
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <CardTitle>Verification Link Invalid or Expired</CardTitle>
          <CardDescription>
            This link may have already been used, or it&apos;s expired. Request a new
            verification email and try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link href="/resend-verification">Resend Verification Email</Link>
          </Button>
          <Link href="/login" className="text-sm text-blue-400 hover:underline">
            Back to login
          </Link>
        </CardContent>
      </>
    );
  }

  return (
    <CardHeader className="items-center text-center">
      <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-400" />
      <CardTitle>Verifying Your Email...</CardTitle>
      <CardDescription>Hang tight, this only takes a moment.</CardDescription>
    </CardHeader>
  );
}

export default function AuthConfirmPage() {
  return (
    <AuthConfirmShell>
      <Suspense
        fallback={
          <CardHeader className="items-center text-center">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-400" />
            <CardTitle>Verifying Your Email...</CardTitle>
            <CardDescription>Hang tight, this only takes a moment.</CardDescription>
          </CardHeader>
        }
      >
        <AuthConfirmInner />
      </Suspense>
    </AuthConfirmShell>
  );
}

