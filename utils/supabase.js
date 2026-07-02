import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

/**
 * Prüft ob Supabase-Umgebungsvariablen gesetzt sind.
 * Wichtig für Build-Zeit (Vercel) wenn Env-Vars noch fehlen.
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Lazy Supabase-Client – wirft erst bei Nutzung, nicht beim Import.
 * Verhindert Build-Fehler wenn Env-Vars temporär fehlen.
 */
export function getSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Fehlende Supabase Umgebungsvariablen. Bitte .env.local prüfen."
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return supabaseClient;
}

// Rückwärtskompatibel: bestehende Imports von `supabase` funktionieren weiter
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabase();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────

/**
 * Discord OAuth Login via Supabase Auth.
 * Leitet den User nach der Authentifizierung zum Dashboard weiter.
 */
export async function signInWithDiscord() {
  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Aktuellen eingeloggten User abrufen.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await getSupabase().auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Aktuelle Session abrufen (wird für geschützte Routen benötigt).
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await getSupabase().auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * User ausloggen.
 */
export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

// ─── PLAYERS (Spieler-Tabelle) ────────────────────────────────────────────────

/**
 * Spielerdaten anhand der Discord-ID laden.
 */
export async function getPlayerByDiscordId(discordId) {
  const { data, error } = await getSupabase()
    .from("players")
    .select("*")
    .eq("discord_id", discordId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Spielerdaten für eingeloggten Web-User via sichere RPC.
 */
export async function getMyPlayer() {
  const { data, error } = await getSupabase().rpc("web_get_my_player");
  if (error) throw error;
  if (!data?.found) {
    const err = new Error(data?.message ?? "Spieler nicht gefunden");
    err.reason = data?.reason;
    throw err;
  }
  return data;
}

// ─── VAULT (Rewards / Affiliate-Codes) ────────────────────────────────────────

/**
 * Alle verfügbaren Rewards aus der Vault laden.
 */
export async function getAvailableRewards() {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabase().rpc("web_list_available_rewards", {
    p_limit: 50,
  });

  if (error) throw error;
  return data ?? [];
}

/**
 * Showcase-Rewards für die Landingpage (3 Stück).
 */
export async function getShowcaseRewards() {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabase().rpc("web_list_available_rewards", {
    p_limit: 3,
  });

  if (error) throw error;
  return data ?? [];
}

/**
 * Reward atomisch einlösen via DB-RPC.
 */
export async function purchaseReward(rewardId) {
  const { data, error } = await getSupabase().rpc("web_purchase_vault_item", {
    p_vault_id: rewardId,
  });

  if (error) throw error;

  if (!data?.success) {
    const message =
      data?.message ??
      ({
        not_linked: "Account nicht verknüpft. Nutze /link im Discord.",
        not_available: "Reward nicht mehr verfügbar.",
        insufficient_coins: "Nicht genügend LootCoins.",
        not_authenticated: "Bitte mit Discord einloggen.",
      }[data?.reason] ?? "Kauf fehlgeschlagen.");
    throw new Error(message);
  }

  return data;
}

// ─── SERVERS (Partner-Server Showcase) ────────────────────────────────────────

/**
 * Alle aktiven Partner-Server laden.
 */
export async function getPartnerServers() {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabase()
    .from("servers")
    .select("*")
    .eq("is_active", true)
    .order("player_count", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
