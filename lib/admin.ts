import type { User } from "@supabase/supabase-js";

/**
 * Admin-Zugang über ADMIN_EMAILS, ADMIN_DISCORD_USERNAMES, ADMIN_DISCORD_IDS (server-only).
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminDiscordUsernames(): string[] {
  const raw =
    process.env.ADMIN_DISCORD_USERNAMES ??
    process.env.NEXT_PUBLIC_ADMIN_DISCORD_USERNAMES ??
    "";
  return raw
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminDiscordIds(): string[] {
  const raw = process.env.ADMIN_DISCORD_IDS ?? "";
  return raw.split(",").map((id) => id.trim()).filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.trim().toLowerCase());
}

/** Alle erkennbaren Discord-Identitäten aus OAuth-Metadaten sammeln. */
export function getDiscordIdentityCandidates(user: User): string[] {
  const candidates = new Set<string>();
  const meta = user.user_metadata ?? {};

  const metaFields = [
    meta.user_name,
    meta.preferred_username,
    meta.full_name,
    meta.name,
    meta.custom_claims?.global_name,
    meta.custom_claims?.username,
    meta.custom_claims?.name,
    user.email,
  ];

  for (const value of metaFields) {
    if (typeof value === "string" && value.trim()) {
      candidates.add(value.trim().toLowerCase());
    }
  }

  for (const identity of user.identities ?? []) {
    if (identity.provider !== "discord") continue;

    const data = identity.identity_data ?? {};
    const identityFields = [
      data.user_name,
      data.username,
      data.name,
      data.full_name,
      data.global_name,
      data.preferred_username,
      data.sub,
      data.provider_id,
      identity.id,
    ];

    for (const value of identityFields) {
      if (value != null && String(value).trim()) {
        candidates.add(String(value).trim().toLowerCase());
      }
    }
  }

  return [...candidates];
}

/** Erster Anzeigename für UI. */
export function getDiscordUsername(user: User): string | null {
  return getDiscordIdentityCandidates(user)[0] ?? null;
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (isAdminEmail(user.email)) return true;

  const adminUsernames = getAdminDiscordUsernames();
  const adminIds = getAdminDiscordIds();
  const candidates = getDiscordIdentityCandidates(user);

  if (adminUsernames.length > 0 && adminUsernames.some((name) => candidates.includes(name))) {
    return true;
  }

  if (adminIds.length > 0 && adminIds.some((id) => candidates.includes(id.toLowerCase()))) {
    return true;
  }

  return false;
}

/** Client-seitige Admin-UI-Prüfung (öffentliche Usernamen-Liste). */
export function isAdminUserClient(user: User | null | undefined): boolean {
  if (!user) return false;

  const publicAdmins = (process.env.NEXT_PUBLIC_ADMIN_DISCORD_USERNAMES ?? "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  if (publicAdmins.length === 0) return false;

  const candidates = getDiscordIdentityCandidates(user);
  return publicAdmins.some((name) => candidates.includes(name));
}
