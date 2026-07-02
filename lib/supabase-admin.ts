import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Client mit Service Role Key – nur serverseitig für Admin-Abfragen.
 * Umgeht RLS; niemals im Browser verwenden.
 */
export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Fehlende Admin-Supabase-Konfiguration (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
