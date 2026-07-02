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

// ─── VAULT (Rewards / Affiliate-Codes) ────────────────────────────────────────

/**
 * Alle verfügbaren (nicht eingelösten) Rewards aus der Vault laden.
 * Filtert nach is_used = false.
 */
export async function getAvailableRewards() {
  const { data, error } = await supabase
    .from("vault")
    .select("*")
    .eq("is_used", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Drei zufällige Showcase-Rewards für die Landingpage laden.
 * Zeigt Vorschau ohne sensible Code-Daten (code wird nicht selektiert).
 */
export async function getShowcaseRewards() {
  const { data, error } = await supabase
    .from("vault")
    .select("id, title, description, cost_coins, reward_type, icon")
    .eq("is_used", false)
    .limit(3);

  if (error) throw error;
  return data;
}

/**
 * Einen Reward einlösen.
 * Setzt is_used = true und speichert die Discord-ID des Einlösers.
 *
 * @param {string} rewardId - UUID des Rewards in der vault-Tabelle
 * @param {string} discordId - Discord-ID des einlösenden Users
 */
export async function claimReward(rewardId, discordId) {
  const { data, error } = await supabase
    .from("vault")
    .update({
      is_used: true,
      claimed_by: discordId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", rewardId)
    .eq("is_used", false) // Race-Condition verhindern: nur wenn noch nicht eingelöst
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * LootCoins eines Spielers nach dem Einlösen abziehen.
 *
 * @param {string} discordId - Discord-ID des Spielers
 * @param {number} amount - Anzahl der abzuziehenden Coins
 */
export async function deductCoins(discordId, amount) {
  // Aktuellen Kontostand abrufen
  const player = await getPlayerByDiscordId(discordId);

  if (player.loot_coins < amount) {
    throw new Error("Nicht genügend LootCoins auf dem Konto.");
  }

  const { data, error } = await supabase
    .from("players")
    .update({ loot_coins: player.loot_coins - amount })
    .eq("discord_id", discordId)
    .select()
    .single();

  if (error) throw error;
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
