import { createClient } from "@supabase/supabase-js";

// Supabase-Client initialisieren mit den Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Fehlende Supabase Umgebungsvariablen. Bitte .env.local prüfen."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── AUTH ────────────────────────────────────────────────────────────────────

/**
 * Discord OAuth Login via Supabase Auth.
 * Leitet den User nach der Authentifizierung zum Dashboard weiter.
 */
export async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
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
  } = await supabase.auth.getUser();
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
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * User ausloggen.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── PLAYERS (Spieler-Tabelle) ────────────────────────────────────────────────

/**
 * Spielerdaten anhand der Discord-ID laden.
 * Gibt { loot_coins, username, avatar_url, ... } zurück.
 * @param {string} discordId - Die Discord-ID des Spielers
 */
export async function getPlayerByDiscordId(discordId) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("discord_id", discordId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Spielerdaten für eingeloggten Web-User via sichere RPC.
 * Nutzt Discord-ID aus dem Auth-JWT (kein manuelles Mapping nötig).
 */
export async function getMyPlayer() {
  const { data, error } = await supabase.rpc("web_get_my_player");
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
 * Alle verfügbaren (nicht eingelösten) Rewards aus der Vault laden.
 * Filtert nach is_used = false.
 */
export async function getAvailableRewards() {
  const { data, error } = await supabase.rpc("web_list_available_rewards", {
    p_limit: 50,
  });

  if (error) throw error;
  return data ?? [];
}

/**
 * Drei zufällige Showcase-Rewards für die Landingpage laden.
 * Zeigt Vorschau ohne sensible Code-Daten (code wird nicht selektiert).
 */
export async function getShowcaseRewards() {
  const { data, error } = await supabase.rpc("web_list_available_rewards", {
    p_limit: 3,
  });

  if (error) throw error;
  return data ?? [];
}

/**
 * Reward atomisch einlösen (Coins abziehen + Vault claimen in einer Transaktion).
 * Nutzt die DB-RPC web_purchase_vault_item – sicherer als zwei separate PATCH-Requests.
 *
 * @param {string} rewardId - UUID des Rewards in der vault-Tabelle
 */
export async function purchaseReward(rewardId) {
  const { data, error } = await supabase.rpc("web_purchase_vault_item", {
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
  const { data, error } = await supabase
    .from("servers")
    .select("*")
    .eq("is_active", true)
    .order("player_count", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
