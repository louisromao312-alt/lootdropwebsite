"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  supabase,
  getAvailableRewards,
  getMyPlayer,
  purchaseReward,
} from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap,
  Coins,
  Gift,
  ShoppingBag,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

// Typen
interface Reward {
  id: string;
  title: string;
  description: string;
  cost_coins: number;
  reward_type: string;
  code?: string;
  link?: string;
}

interface PlayerData {
  loot_coins: number;
  username?: string;
  total_earned?: number;
}

// Fallback-Rewards für Demo-Modus (ohne Supabase-Connection)
const DEMO_REWARDS: Reward[] = [
  {
    id: "demo-1",
    title: "Discord Nitro Classic",
    description: "1 Monat Discord Nitro Classic. Gib den Code direkt in Discord ein.",
    cost_coins: 5000,
    reward_type: "digital",
  },
  {
    id: "demo-2",
    title: "Steam Guthaben 10€",
    description: "10€ Steam-Wallet Guthaben als digitaler Einlösecode.",
    cost_coins: 8000,
    reward_type: "digital",
  },
  {
    id: "demo-3",
    title: "VIP Server-Rang",
    description: "Permanenter VIP-Rang auf CraftLand SMP (30 Tage).",
    cost_coins: 3000,
    reward_type: "in-game",
  },
  {
    id: "demo-4",
    title: "Minecraft Java Edition",
    description: "Ein vollständiger Minecraft Java Edition Key für einen Freund.",
    cost_coins: 15000,
    reward_type: "digital",
  },
  {
    id: "demo-5",
    title: "LootDrop Mystery Box",
    description: "Eine zufällige Überraschungs-Belohnung aus unserem Pool.",
    cost_coins: 2000,
    reward_type: "mystery",
  },
  {
    id: "demo-6",
    title: "Exclusive Skin Pack",
    description: "Exklusives LootDrop-gebrandetes Minecraft Skin Pack.",
    cost_coins: 1500,
    reward_type: "in-game",
  },
];

export default function DashboardClient() {
  const router = useRouter();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Modal-State
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    reward: Reward | null;
  }>({ open: false, reward: null });

  // Auth-Check: Session aus Cookies lesen (nicht bei INITIAL_SESSION sofort redirecten)
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoadingAuth(false);
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        router.push("/login");
        return;
      }

      if (session?.user) {
        setUser(session.user);
        setLoadingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Spielerdaten laden (Kontostand aus players-Tabelle)
  const loadPlayerData = useCallback(async () => {
    try {
      const data = await getMyPlayer();
      setPlayerData({
        loot_coins: data.loot_coins,
        total_earned: data.total_earned,
        username: data.username,
      });
    } catch {
      // Spieler noch nicht verknüpft – Demo-Wert anzeigen
      setPlayerData({ loot_coins: 12500, total_earned: 45000 });
    }
  }, []);

  // Rewards aus Vault laden
  const loadRewards = useCallback(async () => {
    setLoadingRewards(true);
    try {
      const data = await getAvailableRewards();
      setRewards(data?.length ? data : DEMO_REWARDS);
    } catch {
      setRewards(DEMO_REWARDS);
    } finally {
      setLoadingRewards(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPlayerData();
      loadRewards();
    }
  }, [user, loadPlayerData, loadRewards]);

  // ── Reward einlösen ──────────────────────────────────────────────────────
  const handleClaim = async (reward: Reward) => {
    if (!user || !playerData) return;

    // Kontostand prüfen
    if (playerData.loot_coins < reward.cost_coins) {
      toast.error("Nicht genügend LootCoins!", {
        description: `Du brauchst ${(reward.cost_coins - playerData.loot_coins).toLocaleString("de-DE")} Coins mehr.`,
      });
      return;
    }

    setClaimingId(reward.id);

    try {
      // Atomischer Kauf via DB-RPC (Coins + Vault in einer Transaktion)
      const result = await purchaseReward(reward.id);

      setPlayerData((prev) =>
        prev
          ? {
              ...prev,
              loot_coins: result.new_balance ?? prev.loot_coins - reward.cost_coins,
            }
          : prev
      );

      setSuccessModal({
        open: true,
        reward: {
          ...reward,
          title: result.title ?? reward.title,
          code: result.code ?? result.content,
          link: result.link,
        },
      });

      setRewards((prev) => prev.filter((r) => r.id !== reward.id));
    } catch (err: unknown) {
      // Demo-Modus: Coins lokal abziehen
      const isDemoReward = reward.id.startsWith("demo-");
      if (isDemoReward) {
        setPlayerData((prev) =>
          prev ? { ...prev, loot_coins: prev.loot_coins - reward.cost_coins } : prev
        );
        setSuccessModal({ open: true, reward: { ...reward, code: "DEMO-XXXX-YYYY-ZZZZ" } });
        setRewards((prev) => prev.filter((r) => r.id !== reward.id));
      } else {
        const message = err instanceof Error ? err.message : "Unbekannter Fehler";
        toast.error("Einlösen fehlgeschlagen", { description: message });
      }
    } finally {
      setClaimingId(null);
    }
  };

  // Reward-Code kopieren
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code kopiert!");
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Authentifizierung prüfen...
          </span>
        </div>
      </div>
    );
  }

  const userAvatarUrl =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "Spieler";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/30 neon-glow">
            <AvatarImage src={userAvatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              Willkommen zurück
            </div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void loadPlayerData();
            void loadRewards();
          }}
          className="border-border/50 hover:border-primary/40 self-start sm:self-auto"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Aktualisieren
        </Button>
      </div>

      {/* ── STATS CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {/* LootCoins Guthaben — Hauptkarte */}
        <Card className="sm:col-span-1 bg-card border-primary/20 neon-glow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Mein LootCoins Guthaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            {playerData ? (
              <div className="text-4xl font-bold neon-text tracking-tight">
                {playerData.loot_coins.toLocaleString("de-DE")}
                <span className="text-lg font-normal text-muted-foreground ml-2">
                  LC
                </span>
              </div>
            ) : (
              <Skeleton className="h-10 w-32" />
            )}
          </CardContent>
        </Card>

        {/* Rewards verfügbar */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Verfügbare Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRewards ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-3xl font-bold">
                {rewards.length}
                <span className="text-base font-normal text-muted-foreground ml-2">
                  im Shop
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gesamt verdient */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Gesamt verdient
            </CardTitle>
          </CardHeader>
          <CardContent>
            {playerData ? (
              <div className="text-3xl font-bold">
                {(playerData.total_earned ?? 0).toLocaleString("de-DE")}
                <span className="text-base font-normal text-muted-foreground ml-2">
                  LC
                </span>
              </div>
            ) : (
              <Skeleton className="h-10 w-24" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── SHOP ────────────────────────────────────────────────────────── */}
      <div id="shop" className="scroll-mt-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Reward Shop</h2>
          {!loadingRewards && (
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/10"
            >
              {rewards.length} verfügbar
            </Badge>
          )}
        </div>

        {loadingRewards ? (
          // Loading Skeletons
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card/60 border-border/50">
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4 mt-1" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rewards.length === 0 ? (
          // Empty State
          <Card className="bg-card/40 border-border/40 text-center py-16">
            <CardContent>
              <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Alle Rewards eingelöst
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aktuell sind keine weiteren Rewards verfügbar. Schau bald wieder
                vorbei!
              </p>
              <Button
                variant="outline"
                onClick={loadRewards}
                className="border-primary/30 hover:border-primary/60"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Neu laden
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewards.map((reward) => {
              const canAfford =
                !!playerData && playerData.loot_coins >= reward.cost_coins;
              const isClaiming = claimingId === reward.id;

              return (
                <Card
                  key={reward.id}
                  className={`bg-card/60 border-border/50 flex flex-col transition-all duration-300 ${
                    canAfford
                      ? "hover:border-primary/40 hover:bg-card"
                      : "opacity-60"
                  }`}
                >
                  {/* Top accent bar */}
                  <div
                    className={`h-0.5 w-full rounded-t-xl ${
                      canAfford
                        ? "bg-gradient-to-r from-primary/60 to-primary/20"
                        : "bg-gradient-to-r from-muted/60 to-muted/20"
                    }`}
                  />

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-snug">
                        {reward.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs ${
                          canAfford
                            ? "border-primary/30 text-primary bg-primary/10"
                            : "border-muted text-muted-foreground"
                        }`}
                      >
                        {reward.reward_type}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4 flex-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {reward.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                      {/* Preis */}
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-primary" />
                        <span
                          className={`text-base font-bold ${
                            canAfford ? "neon-text" : "text-muted-foreground"
                          }`}
                        >
                          {reward.cost_coins.toLocaleString("de-DE")}
                        </span>
                        <span className="text-xs text-muted-foreground">LC</span>
                      </div>

                      {/* Einlösen-Button */}
                      <Button
                        size="sm"
                        disabled={!canAfford || !!claimingId}
                        onClick={() => handleClaim(reward)}
                        className={`text-xs h-8 px-4 ${
                          canAfford ? "neon-glow" : ""
                        }`}
                        title={
                          !canAfford
                            ? `Du brauchst noch ${(reward.cost_coins - (playerData?.loot_coins ?? 0)).toLocaleString("de-DE")} LC`
                            : "Reward einlösen"
                        }
                      >
                        {isClaiming ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : !canAfford ? (
                          <>
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Zu wenig LC
                          </>
                        ) : (
                          <>
                            <Zap className="mr-1 h-3 w-3" />
                            Einlösen
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ERFOLGS-MODAL ───────────────────────────────────────────────── */}
      <Dialog
        open={successModal.open}
        onOpenChange={(open) =>
          setSuccessModal((s) => ({ ...s, open }))
        }
      >
        <DialogContent className="bg-card border-primary/30 max-w-md">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-t-xl" />

          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/30 neon-glow flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Reward erfolgreich eingelöst!
            </DialogTitle>
            <DialogDescription className="text-center">
              {successModal.reward?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Code / Link anzeigen */}
            {successModal.reward?.code && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="text-xs text-muted-foreground mb-1.5 text-center">
                  Dein Einlöse-Code
                </div>
                <div className="flex items-center justify-between gap-2 bg-background/50 rounded-md px-3 py-2 border border-border/50">
                  <code className="font-mono text-sm font-medium text-primary tracking-wider">
                    {successModal.reward.code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(successModal.reward!.code!)}
                    className="h-7 px-2 hover:text-primary"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {successModal.reward?.link && (
              <Button asChild className="w-full neon-glow">
                <Link
                  href={successModal.reward.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Reward öffnen
                </Link>
              </Button>
            )}

            {/* Kein Code / Link vorhanden */}
            {!successModal.reward?.code && !successModal.reward?.link && (
              <div className="rounded-lg border border-border/50 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground text-center">
                Du erhältst deinen Reward innerhalb von 24 Stunden über Discord.
              </div>
            )}

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2.5">
              <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <span>
                Dein Kontostand wurde aktualisiert. Bei Problemen wende dich an
                unseren Discord-Support.
              </span>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setSuccessModal({ open: false, reward: null })}
            >
              Schließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
