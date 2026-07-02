"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/utils/supabase";
import {
  checkAdminAccess,
  getAdminDashboardData,
  increaseServerBudget,
  type AdminDashboardData,
  type LogLevel,
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  Bot,
  CheckCircle2,
  Coins,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  Terminal,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const LEVEL_STYLES: Record<
  LogLevel,
  { badge: string; dot: string }
> = {
  INFO: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
  WARN: {
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  ERROR: {
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
};

function StatusIcon({ status }: { status: string }) {
  if (status === "OK") {
    return <CheckCircle2 className="h-5 w-5 text-primary" />;
  }
  return <AlertCircle className="h-5 w-5 text-red-400" />;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "OK":
      return "border-primary/40 text-primary bg-primary/10";
    case "WARN":
      return "border-yellow-500/40 text-yellow-400 bg-yellow-500/10";
    case "CRITICAL":
    case "OFFLINE":
      return "border-red-500/40 text-red-400 bg-red-500/10";
    default:
      return "border-border text-muted-foreground";
  }
}

function formatTimestamp(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatChartDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Budget-Formular
  const [serverSlug, setServerSlug] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetSubmitting, setBudgetSubmitting] = useState(false);

  // Admin-Auth serverseitig prüfen (ADMIN_EMAILS nur auf dem Server verfügbar)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;

      if (!u || !session?.access_token) {
        router.replace("/login");
        return;
      }

      const { isAdmin } = await checkAdminAccess(session.access_token);

      if (!isAdmin) {
        router.replace("/dashboard");
        return;
      }

      setUser(u);
      setAccessToken(session.access_token);
      setAuthLoading(false);
    });
  }, [router]);

  const loadDashboard = useCallback(async (token: string) => {
    setDataLoading(true);
    setError(null);
    try {
      const result = await getAdminDashboardData(token);
      setData(result);
      if (result.serverBudgets.length > 0 && !serverSlug) {
        setServerSlug(result.serverBudgets[0].server_slug);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Daten konnten nicht geladen werden.";
      setError(message);
    } finally {
      setDataLoading(false);
    }
  }, [serverSlug]);

  useEffect(() => {
    if (accessToken) {
      loadDashboard(accessToken);
    }
  }, [accessToken, loadDashboard]);

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const amount = Number(budgetAmount);
    if (!serverSlug || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Bitte gültigen Server und Betrag angeben.");
      return;
    }

    setBudgetSubmitting(true);
    try {
      const result = await increaseServerBudget(accessToken, serverSlug, amount);
      toast.success(`Budget erhöht auf ${result.newBudget.toLocaleString("de-DE")} LC`);
      setBudgetAmount("");
      await loadDashboard(accessToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Budget konnte nicht erhöht werden.";
      toast.error(message);
    } finally {
      setBudgetSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Admin-Zugang wird geprüft…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
              Mission Control
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-Gesundheit, Logs & Economy-Budgets — eingeloggt als {user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={dataLoading || !accessToken}
          onClick={() => accessToken && loadDashboard(accessToken)}
          className="border-border/50 hover:border-primary/40 self-start"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${dataLoading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Health Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Plugin Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : data ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={data.pluginHealth.status} />
                    <Badge variant="outline" className={statusBadgeClass(data.pluginHealth.status)}>
                      {data.pluginHealth.label}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{data.pluginHealth.detail}</p>
                <p className="text-xs font-mono text-muted-foreground/80">
                  {formatTimestamp(data.pluginHealth.lastSeen)}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Bot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : data ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusIcon status={data.botHealth.status === "OK" ? "OK" : "CRITICAL"} />
                  <Badge
                    variant="outline"
                    className={
                      data.botHealth.status === "OK"
                        ? statusBadgeClass("OK")
                        : statusBadgeClass("CRITICAL")
                    }
                  >
                    {data.botHealth.status === "OK" ? "Online" : data.botHealth.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{data.botHealth.detail}</p>
                <p className="text-xs font-mono text-muted-foreground/80">
                  {formatTimestamp(data.botHealth.lastSeen)}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-primary/20 neon-glow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Umsatz-Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : data ? (
              <div>
                <div className="text-3xl font-bold neon-text">
                  {data.totalRevenue.toLocaleString("de-DE")}
                  <span className="text-base font-normal text-muted-foreground ml-2">LC</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Summe aller eingelösten Vault-Rewards (is_used = true)
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* ── Chart ──────────────────────────────────────────────────────── */}
        <Card className="xl:col-span-2 bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Einlösungen pro Tag
            </CardTitle>
            <CardDescription>Letzte 7 Tage basierend auf vault.claimed_at</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : data ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.redemptionsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      stroke="oklch(0.55 0 0)"
                      fontSize={11}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="oklch(0.55 0 0)"
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.11 0 0)",
                        border: "1px solid oklch(1 0 0 / 10%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) => formatChartDate(String(label))}
                      formatter={(value) => [`${value} Einlösungen`, "Anzahl"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="oklch(0.75 0.22 142)"
                      strokeWidth={2}
                      dot={{ fill: "oklch(0.82 0.25 142)", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* ── Budget Form ────────────────────────────────────────────────── */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-4 w-4 text-primary" />
              Economy-Budget erhöhen
            </CardTitle>
            <CardDescription>
              Schreibt in die Tabelle server_budgets (Plugin Anti-Inflation)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="server-slug" className="text-xs font-medium text-muted-foreground">
                  Minecraft-Server
                </label>
                <select
                  id="server-slug"
                  value={serverSlug}
                  onChange={(e) => setServerSlug(e.target.value)}
                  className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                >
                  <option value="" disabled>
                    Server wählen…
                  </option>
                  {(data?.serverBudgets ?? []).map((s) => (
                    <option key={s.id} value={s.server_slug}>
                      {s.server_name} ({s.economy_budget.toLocaleString("de-DE")} LC)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="budget-amount" className="text-xs font-medium text-muted-foreground">
                  Betrag erhöhen (LC)
                </label>
                <input
                  id="budget-amount"
                  type="number"
                  min={1}
                  step={1}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="z.B. 5000"
                  className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full neon-glow"
                disabled={budgetSubmitting || dataLoading}
              >
                {budgetSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Budget erhöhen"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ── System Logs ──────────────────────────────────────────────────── */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal className="h-4 w-4 text-primary" />
            System-Logs
          </CardTitle>
          <CardDescription>Letzte 20 Einträge aus system_logs</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {dataLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data && data.logs.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Zeitstempel</th>
                  <th className="pb-3 pr-4 font-medium">Quelle</th>
                  <th className="pb-3 pr-4 font-medium">Level</th>
                  <th className="pb-3 font-medium">Nachricht</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => {
                  const style = LEVEL_STYLES[log.level] ?? LEVEL_STYLES.INFO;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-border/30 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs border-border/50">
                          {log.source}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${style.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {log.level}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{log.message}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Keine Log-Einträge vorhanden.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
