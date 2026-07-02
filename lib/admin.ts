/**
 * Admin-Zugangskontrolle über ADMIN_EMAILS (kommagetrennt, server-only).
 * Beispiel: ADMIN_EMAILS=admin@lootdrop.gg,ceo@example.com
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.trim().toLowerCase());
}
