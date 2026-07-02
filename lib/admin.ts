import type { User } from "@supabase/supabase-js";

/**
 * Admin-Zugang über ADMIN_EMAILS und/oder ADMIN_DISCORD_USERNAMES (server-only).
 * Beispiel:
 *   ADMIN_EMAILS=you@example.com
 *   ADMIN_DISCORD_USERNAMES=louisplot
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminDiscordUsernames(): string[] {
  const raw = process.env.ADMIN_DISCORD_USERNAMES ?? "";
  return raw
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.trim().toLowerCase());
}

/** Discord-Username aus Supabase User-Metadaten (OAuth). */
export function getDiscordUsername(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const candidates = [
    meta.user_name,
    meta.preferred_username,
    meta.full_name,
    meta.name,
    meta.custom_claims?.global_name,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim().toLowerCase();
    }
  }

  return null;
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (isAdminEmail(user.email)) return true;

  const discordUsername = getDiscordUsername(user);
  if (!discordUsername) return false;

  const adminUsernames = getAdminDiscordUsernames();
  return adminUsernames.length > 0 && adminUsernames.includes(discordUsername);
}
