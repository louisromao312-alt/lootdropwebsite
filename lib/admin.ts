import type { User } from "@supabase/supabase-js";

/** Fallback-Admins wenn ENV auf Vercel noch nicht gesetzt ist (Founder). */
const DEFAULT_ADMIN_DISCORD_USERNAMES = ["louisplot"];
const DEFAULT_ADMIN_EMAILS = ["louisromao312@gmail.com"];

function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails(): string[] {
  return [...new Set([...parseList(process.env.ADMIN_EMAILS), ...DEFAULT_ADMIN_EMAILS])];
}

export function getAdminDiscordUsernames(): string[] {
  const fromEnv = [
    ...parseList(process.env.ADMIN_DISCORD_USERNAMES),
    ...parseList(process.env.NEXT_PUBLIC_ADMIN_DISCORD_USERNAMES),
  ];
  return [...new Set([...fromEnv, ...DEFAULT_ADMIN_DISCORD_USERNAMES])];
}

export function getAdminDiscordIds(): string[] {
  return parseList(process.env.ADMIN_DISCORD_IDS);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/** Anzeigename wie in der Navbar. */
export function getUserDisplayName(user: User): string {
  return (
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.user_metadata?.user_name ??
    user.email ??
    ""
  );
}

function collectStrings(value: unknown, out: Set<string>) {
  if (typeof value === "string" && value.trim()) {
    out.add(value.trim().toLowerCase());
    return;
  }
  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectStrings(nested, out);
    }
  }
}

/** Alle erkennbaren Discord-Identitäten aus OAuth-Metadaten sammeln. */
export function getDiscordIdentityCandidates(user: User): string[] {
  const candidates = new Set<string>();

  collectStrings(user.user_metadata, candidates);
  if (user.email) candidates.add(user.email.trim().toLowerCase());

  for (const identity of user.identities ?? []) {
    if (identity.provider !== "discord") continue;
    collectStrings(identity.identity_data, candidates);
    if (identity.id) candidates.add(identity.id.toLowerCase());
  }

  const display = getUserDisplayName(user).trim().toLowerCase();
  if (display) candidates.add(display);

  return [...candidates];
}

export function getDiscordUsername(user: User): string | null {
  return getDiscordIdentityCandidates(user)[0] ?? null;
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (isAdminEmail(user.email)) return true;

  const adminUsernames = getAdminDiscordUsernames();
  const adminIds = getAdminDiscordIds();
  const candidates = getDiscordIdentityCandidates(user);

  if (adminUsernames.some((name) => candidates.includes(name))) {
    return true;
  }

  if (adminIds.length > 0 && adminIds.some((id) => candidates.includes(id.toLowerCase()))) {
    return true;
  }

  return false;
}

/** @deprecated Nutze isAdminUser – gleiche Logik für Client und Server. */
export function isAdminUserClient(user: User | null | undefined): boolean {
  return isAdminUser(user);
}
