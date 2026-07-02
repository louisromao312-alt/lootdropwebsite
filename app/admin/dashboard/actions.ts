import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { createServiceRoleClient } from "@/lib/supabase-admin";

// ─── Typen ───────────────────────────────────────────────────────────────────

export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface SystemLog {
  id: number;
  source: string;
  level: LogLevel;
  message: string;
  created_at: string;
}

export interface HealthStatus {
  status: "OK" | "WARN" | "CRITICAL" | "OFFLINE";
  label: string;
  lastSeen: string | null;
  detail: string;
}

export interface RedemptionDay {
  date: string;
  count: number;
}

export interface ServerBudget {
  id: string;
  server_slug: string;
  server_name: string;
  economy_budget: number;
}

export interface AdminDashboardData {
  pluginHealth: HealthStatus;
  botHealth: HealthStatus;
  totalRevenue: number;
  logs: SystemLog[];
  redemptionsPerDay: RedemptionDay[];
  serverBudgets: ServerBudget[];
}

// ─── Auth-Helfer (Server) ────────────────────────────────────────────────────

async function verifyAdminAccess(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase nicht konfiguriert.");
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Nicht authentifiziert.");
  }

  if (!isAdminEmail(user.email)) {
    throw new Error("Kein Administrator-Zugang.");
  }

  return user;
}

function healthFromLastSeen(
  lastSeen: string | null,
  sourceLabel: string,
  criticalMinutes = 5
): HealthStatus {
  if (!lastSeen) {
    return {
      status: "OFFLINE",
      label: "OFFLINE",
      lastSeen: null,
      detail: `Kein Heartbeat von ${sourceLabel} gefunden.`,
    };
  }

  const ageMs = Date.now() - new Date(lastSeen).getTime();
  const ageMin = Math.floor(ageMs / 60000);

  if (ageMin > criticalMinutes) {
    return {
      status: "CRITICAL",
      label: "CRITICAL",
      lastSeen,
      detail: `Letzter Kontakt vor ${ageMin} Min. (Schwellwert: ${criticalMinutes} Min.)`,
    };
  }

  return {
    status: "OK",
    label: "OK",
    lastSeen,
    detail: `Zuletzt aktiv vor ${ageMin <= 0 ? "< 1" : ageMin} Min.`,
  };
}

// ─── Datenabfragen ───────────────────────────────────────────────────────────

async function fetchLastLogTimestamp(
  db: ReturnType<typeof createServiceRoleClient>,
  source: string
): Promise<string | null> {
  const { data, error } = await db
    .from("system_logs")
    .select("created_at")
    .eq("source", source)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.created_at ?? null;
}

async function fetchSystemLogs(
  db: ReturnType<typeof createServiceRoleClient>
): Promise<SystemLog[]> {
  const { data, error } = await db
    .from("system_logs")
    .select("id, source, level, message, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as SystemLog[];
}

async function fetchTotalRevenue(
  db: ReturnType<typeof createServiceRoleClient>
): Promise<number> {
  const { data, error } = await db
    .from("vault")
    .select("cost")
    .eq("is_used", true);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + (row.cost ?? 0), 0);
}

async function fetchRedemptionsPerDay(
  db: ReturnType<typeof createServiceRoleClient>
): Promise<RedemptionDay[]> {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await db
    .from("vault")
    .select("claimed_at")
    .eq("is_used", true)
    .gte("claimed_at", since.toISOString());

  if (error) throw error;

  // Letzte 7 Tage initialisieren (auch Tage ohne Einlösungen)
  const days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days[d.toISOString().slice(0, 10)] = 0;
  }

  for (const row of data ?? []) {
    if (!row.claimed_at) continue;
    const key = new Date(row.claimed_at).toISOString().slice(0, 10);
    if (key in days) days[key]++;
  }

  return Object.entries(days).map(([date, count]) => ({ date, count }));
}

async function fetchServerBudgets(
  db: ReturnType<typeof createServiceRoleClient>
): Promise<ServerBudget[]> {
  const { data, error } = await db
    .from("server_budgets")
    .select("id, server_slug, server_name, economy_budget")
    .order("server_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ServerBudget[];
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function checkAdminAccess(
  accessToken: string
): Promise<{ isAdmin: boolean; email: string | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { isAdmin: false, email: null };
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
  } = await authClient.auth.getUser(accessToken);

  if (!user?.email) {
    return { isAdmin: false, email: null };
  }

  return {
    isAdmin: isAdminEmail(user.email),
    email: user.email,
  };
}

export async function getAdminDashboardData(
  accessToken: string
): Promise<AdminDashboardData> {
  await verifyAdminAccess(accessToken);
  const db = createServiceRoleClient();

  const [pluginLastSeen, botLastSeen, logs, totalRevenue, redemptionsPerDay, serverBudgets] =
    await Promise.all([
      fetchLastLogTimestamp(db, "minecraft_plugin"),
      fetchLastLogTimestamp(db, "discord_bot"),
      fetchSystemLogs(db),
      fetchTotalRevenue(db),
      fetchRedemptionsPerDay(db),
      fetchServerBudgets(db),
    ]);

  return {
    pluginHealth: healthFromLastSeen(pluginLastSeen, "Minecraft-Plugin"),
    botHealth: healthFromLastSeen(botLastSeen, "Discord-Bot"),
    totalRevenue,
    logs,
    redemptionsPerDay,
    serverBudgets,
  };
}

export async function increaseServerBudget(
  accessToken: string,
  serverSlug: string,
  amount: number
): Promise<{ success: boolean; newBudget: number }> {
  await verifyAdminAccess(accessToken);

  if (!serverSlug?.trim()) {
    throw new Error("Server-Slug ist erforderlich.");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Betrag muss größer als 0 sein.");
  }

  const db = createServiceRoleClient();

  const { data: existing, error: fetchError } = await db
    .from("server_budgets")
    .select("id, economy_budget")
    .eq("server_slug", serverSlug.trim())
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!existing) {
    throw new Error(`Kein Server-Budget für "${serverSlug}" gefunden.`);
  }

  const newBudget = existing.economy_budget + amount;

  const { error: updateError } = await db
    .from("server_budgets")
    .update({
      economy_budget: newBudget,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (updateError) throw updateError;

  return { success: true, newBudget };
}
