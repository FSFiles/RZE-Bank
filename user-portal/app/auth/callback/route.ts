import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Password-reset / email-verification flows pass an explicit `next`
      // and should always honor it.
      if (explicitNext) {
        return NextResponse.redirect(`${origin}${explicitNext}`);
      }

      // For everyone else (including fresh Google OAuth sign-ins), check
      // whether a banking profile already exists for this auth user.
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();

      if (!customer) {
        return NextResponse.redirect(`${origin}/complete-profile`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
