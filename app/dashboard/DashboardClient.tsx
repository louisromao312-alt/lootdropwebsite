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
  Copy,
  ExternalLink,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import RewardCard from "@/components/RewardCard";
import {
  ALL_SHOWCASE_REWARDS,
  type ShowcaseReward,
} from "@/lib/rewards";

interface Reward extends ShowcaseReward {
  code?: string;
  link?: string;
}

interface PlayerData {
  loot_coins: number;
  username?: string;
  total_earned?: number;
}

function isDemoReward(id: string) {
  return id.startsWith("d") || id.startsWith("r") || id.startsWith("demo-");
}

function isRaffleReward(reward: Reward) {
  return reward.category === "raffle";
}

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
      if (data?.length) {
        setRewards(
          data.map((r: Reward) => ({
            ...r,
            category: r.category ?? "direct",
          }))
        );
      } else {
        setRewards(ALL_SHOWCASE_REWARDS);
      }
    } catch {
      setRewards(ALL_SHOWCASE_REWARDS);
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
          code: isRaffleReward(reward) ? undefined : (result.code ?? result.content),
          link: result.link,
        },
      });

      if (!isRaffleReward(reward)) {
        setRewards((prev) => prev.filter((r) => r.id !== reward.id));
      }
    } catch (err: unknown) {
      if (isDemoReward(reward.id)) {
        setPlayerData((prev) =>
          prev ? { ...prev, loot_coins: prev.loot_coins - reward.cost_coins } : prev
        );
        setSuccessModal({
          open: true,
          reward: isRaffleReward(reward)
            ? { ...reward }
            : { ...reward, code: "DEMO-XXXX-YYYY-ZZZZ" },
        });
        if (!isRaffleReward(reward)) {
          setRewards((prev) => prev.filter((r) => r.id !== reward.id));
        }
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

  const directRewards = rewards.filter((r) => !isRaffleReward(r));
  const raffleRewards = rewards.filter((r) => isRaffleReward(r));

  const renderRewardGrid = (items: Reward[]) => (
    <div className={`grid sm:grid-cols-2 ${items.some(isRaffleReward) ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-5`}>
      {items.map((reward) => {
        const canAfford = !!playerData && playerData.loot_coins >= reward.cost_coins;
        const isClaiming = claimingId === reward.id;
        return (
          <RewardCard
            key={reward.id}
            reward={reward}
            onClaim={() => handleClaim(reward)}
            canAfford={canAfford}
            isClaiming={isClaiming}
            disabled={!!claimingId && !isClaiming}
          />
        );
      })}
    </div>
  );

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
      <div id="shop" className="scroll-mt-20 space-y-12">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Reward Shop</h2>
          {!loadingRewards && (
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
              {rewards.length} verfügbar
            </Badge>
          )}
        </div>

        {loadingRewards ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card/60 border-border/50">
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Direkt einlösen */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight">Guthaben & Rabatte</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sofort einlösbar — Steam-Guthaben, Rabatte und In-Game-Vorteile.
                </p>
              </div>
              {directRewards.length === 0 ? (
                <Card className="bg-card/40 border-border/40 text-center py-12">
                  <CardContent>
                    <Gift className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Keine direkten Rewards verfügbar.</p>
                  </CardContent>
                </Card>
              ) : (
                renderRewardGrid(directRewards)
              )}
            </div>

            {/* Verlosungs-Tickets */}
            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-6 sm:p-8">
              <div className="mb-6 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Ticket className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Verlosungs-Tickets
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kaufe günstige Tickets für die Chance auf begehrte Hauptpreise — z.&nbsp;B.
                    25€ Steam-Gutschein für nur 500 LC pro Ticket.
                  </p>
                </div>
              </div>
              {raffleRewards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aktuell keine Verlosungen aktiv.
                </p>
              ) : (
                renderRewardGrid(raffleRewards)
              )}
            </div>
          </>
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
              {successModal.reward && isRaffleReward(successModal.reward)
                ? "Ticket gekauft!"
                : "Reward erfolgreich eingelöst!"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {successModal.reward?.title}
              {successModal.reward && isRaffleReward(successModal.reward) && successModal.reward.draw_date && (
                <span className="block mt-1 text-amber-600 font-medium">
                  Ziehung: {successModal.reward.draw_date}
                </span>
              )}
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

            {/* Kein Code / Link — Verlosung oder In-Game */}
            {!successModal.reward?.code && !successModal.reward?.link && (
              <div className="rounded-lg border border-border/50 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground text-center">
                {successModal.reward && isRaffleReward(successModal.reward)
                  ? "Dein Ticket ist registriert. Du wirst per Discord benachrichtigt, falls du gewinnst. Viel Glück!"
                  : "Du erhältst deinen Reward innerhalb von 24 Stunden über Discord."}
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
