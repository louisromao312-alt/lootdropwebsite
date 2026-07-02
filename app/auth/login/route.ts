import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/** Startet Discord OAuth – PKCE-Cookies werden auf der Redirect-Response gesetzt. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
  }

  const { url, key } = getSupabaseEnv();
  const pendingCookies: {
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach((cookie) => {
          pendingCookies.push(cookie);
          request.cookies.set(cookie.name, cookie.value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: "identify email",
    },
  });

  if (error || !data.url) {
    const message = error?.message ?? "OAuth URL konnte nicht erstellt werden.";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    );
  }

  const response = NextResponse.redirect(data.url);

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  request.cookies.getAll().forEach(({ name, value }) => {
    response.cookies.set(name, value);
  });

  return response;
}
