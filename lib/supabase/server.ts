import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";

/** Server-Client mit Cookie-Session – für Route Handlers & Server Components. */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const { url, key } = getSupabaseEnv();

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll in Server Components kann fehlschlagen – Middleware refresht die Session.
        }
      },
    },
  });
}
