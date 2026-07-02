"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInWithDiscordAction(): Promise<{ url: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase nicht konfiguriert.");
  }

  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (host ? `${proto}://${host}` : "http://localhost:3000");

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${siteOrigin}/auth/callback`,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("Discord OAuth URL konnte nicht erstellt werden.");

  return { url: data.url };
}
