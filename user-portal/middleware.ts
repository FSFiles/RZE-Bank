import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Re-enabled for the Admin Portal (Phase 2), which runs on real
// Supabase Auth from day one. The customer portal at /dashboard
// still uses the temporary mock session and is unaffected — see
// the comments in lib/supabase/middleware.ts.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
