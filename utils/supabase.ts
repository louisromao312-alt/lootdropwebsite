import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured as checkSupabaseConfigured } from "@/lib/supabase/config";
import type { ShowcaseReward } from "@/lib/rewards";

export const SUPABASE_CONFIG_ERROR =
  "Supabase nicht konfiguriert. Setze NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY (lokal: .env.local, Vercel: Environment Variables).";

/** Prüft ob Supabase-Umgebungsvariablen gesetzt sind. */
export function isSupabaseConfigured(): boolean {
  return checkSupabaseConfigured();
}

/** Anonymer Client für öffentliche Server-Abfragen (ohne Session). */
function createAnonClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Browser-Client mit Cookie-Session – nur in Client Components verwenden. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }
  return createBrowserSupabase();
}

/** No-Op Auth wenn Env-Vars fehlen – verhindert Runtime-Crash in der Navbar. */
function createSafeAuth(): SupabaseClient["auth"] {
  const subscription = { id: "noop", unsubscribe: () => {} };

  return {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription } }),
    signInWithOAuth: async () => ({
      data: { provider: "discord", url: null },
      error: new Error(SUPABASE_CONFIG_ERROR),
    }),
    signOut: async () => ({ error: null }),
  } as unknown as SupabaseClient["auth"];
}

/** Rückwärtskompatibler Export – nutzt Safe-Auth wenn nicht konfiguriert. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!isSupabaseConfigured()) {
      if (prop === "auth") return createSafeAuth();
      throw new Error(SUPABASE_CONFIG_ERROR);
    }

    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function signInWithDiscord() {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }

  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await getSupabase().auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await getSupabase().auth.getSession();
  if (error) throw error;
  return session;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

// ─── PLAYERS ─────────────────────────────────────────────────────────────────

export async function getPlayerByDiscordId(discordId: string) {
  const { data, error } = await createAnonClient()
    .from("players")
    .select("*")
    .eq("discord_id", discordId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMyPlayer() {
  const { data, error } = await getSupabase().rpc("web_get_my_player");
  if (error) throw error;
  if (!data?.found) {
    const err = new Error(data?.message ?? "Spieler nicht gefunden") as Error & {
      reason?: string;
    };
    err.reason = data?.reason;
    throw err;
  }
  return data;
}

// ─── VAULT ───────────────────────────────────────────────────────────────────

export async function getAvailableRewards(): Promise<ShowcaseReward[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabase().rpc("web_list_available_rewards", {
    p_limit: 50,
  });

  if (error) throw error;
  return (data ?? []) as ShowcaseReward[];
}

export async function getShowcaseRewards(): Promise<ShowcaseReward[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await createAnonClient().rpc(
    "web_list_available_rewards",
    { p_limit: 3 }
  );

  if (error) throw error;
  return (data ?? []) as ShowcaseReward[];
}

export async function purchaseReward(rewardId: string) {
  const { data, error } = await getSupabase().rpc("web_purchase_vault_item", {
    p_vault_id: rewardId,
  });

  if (error) throw error;

  if (!data?.success) {
    const messages: Record<string, string> = {
      not_linked: "Account nicht verknüpft. Nutze /link im Discord.",
      not_available: "Reward nicht mehr verfügbar.",
      insufficient_coins: "Nicht genügend LootCoins.",
      not_authenticated: "Bitte mit Discord einloggen.",
    };
    throw new Error(messages[data?.reason as string] ?? "Kauf fehlgeschlagen.");
  }

  return data;
}

// ─── SERVERS ─────────────────────────────────────────────────────────────────

export async function getPartnerServers() {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await createAnonClient()
    .from("servers")
    .select("*")
    .eq("is_active", true)
    .order("player_count", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
