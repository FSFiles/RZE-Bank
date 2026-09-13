import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Admin Portal — standalone app. Every route requires a logged-in
// Supabase Auth user who also has a matching row in admin_users,
// except /login itself.
const LOGIN_PATH = "/login";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLoginPage = path === LOGIN_PATH;

  if (!isLoginPage) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("redirectTo", path);
      return NextResponse.redirect(url);
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!adminRow) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("error", "not_admin");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginPage && user) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (adminRow) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
