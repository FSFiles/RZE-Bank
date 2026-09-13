import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// This is the User Portal — it only ever deals with customer auth.
// The Admin Portal is a fully separate app/deployment and is not
// reachable from here.
const CUSTOMER_PROTECTED_PREFIXES = ["/complete-profile", "/welcome", "/dashboard"];
const CUSTOMER_AUTH_PAGES = ["/login", "/register", "/forgot-password", "/resend-verification"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let refreshedCookies: { name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          refreshedCookies = cookiesToSet;
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: don't add any logic between createServerClient and
  // this call. supabase.auth.getUser() is what actually validates
  // the session against Supabase Auth and, if the access token has
  // expired, transparently uses the refresh token to mint a new
  // one — rotating it and writing the new cookies via setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isCustomerProtected = CUSTOMER_PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isCustomerAuthPage = CUSTOMER_AUTH_PAGES.some((p) => path.startsWith(p));

  // Whenever we redirect instead of falling through to `return response`,
  // we MUST copy any cookies that getUser() just refreshed onto the
  // redirect response. Building a bare `NextResponse.redirect(url)`
  // here would silently drop a just-rotated session cookie, leaving
  // the browser holding an already-consumed (permanently invalid)
  // refresh token — which is exactly what causes a session to work
  // once and then break until cookies are manually cleared.
  function redirectWithRefreshedCookies(url: URL) {
    const redirectResponse = NextResponse.redirect(url);
    refreshedCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    return redirectResponse;
  }

  if (isCustomerProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return redirectWithRefreshedCookies(url);
  }

  if (isCustomerAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithRefreshedCookies(url);
  }

  // Every authenticated/protected response must be explicitly marked
  // as non-cacheable. Without this, an intermediary (or an overly
  // aggressive browser bfcache/back-forward restore) could serve a
  // previously rendered authenticated page after the session has
  // since changed or expired.
  if (isCustomerProtected) {
    response.headers.set("Cache-Control", "no-store, must-revalidate");
  }

  return response;
}
