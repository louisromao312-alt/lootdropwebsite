import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getShowcaseRewards } from "@/utils/supabase";
import {
  Zap,
  Shield,
  TrendingUp,
  Users,
  ChevronRight,
  Gift,
  Coins,
  Star,
  ArrowRight,
} from "lucide-react";

async function getShowcaseRewardsWithFallback() {
  try {
    const data = await getShowcaseRewards();
    if (data?.length) return data;
    return FALLBACK_REWARDS;
  } catch {
    return FALLBACK_REWARDS;
  }
}

// Fallback-Daten falls Supabase noch nicht konfiguriert ist
const FALLBACK_REWARDS = [
  {
    id: "1",
    title: "Discord Nitro Classic",
    description: "1 Monat Discord Nitro Classic für dein Konto.",
    cost_coins: 5000,
    reward_type: "digital",
  },
  {
    id: "2",
    title: "Steam Guthaben 10€",
    description: "10€ Steam-Wallet Guthaben als digitaler Code.",
    cost_coins: 8000,
    reward_type: "digital",
  },
  {
    id: "3",
    title: "Exclusive Server-Rang",
    description: "Permanenter VIP-Rang auf dem Partner-Server deiner Wahl.",
    cost_coins: 3000,
    reward_type: "ingame",
  },
];

const PARTNER_SERVERS = [
  { name: "CraftLand SMP", players: "2.4K", icon: "⚔️" },
  { name: "SkyBlock Empire", players: "1.8K", icon: "🌤️" },
  { name: "HypixelDE", players: "5.1K", icon: "🏆" },
  { name: "PixelFusion", players: "890", icon: "🎮" },
  { name: "CubeCraft EU", players: "3.2K", icon: "🟦" },
  { name: "Mineplex DE", players: "1.1K", icon: "⚡" },
];

const FEATURES = [
  {
    icon: Coins,
    title: "Coins verdienen",
    description:
      "Spiele auf Partner-Servern und sammle LootCoins automatisch durch das Minecraft-Plugin.",
  },
  {
    icon: Gift,
    title: "Rewards einlösen",
    description:
      "Tausche deine Coins gegen echte digitale Rewards: Steam-Guthaben, Discord Nitro und mehr.",
  },
  {
    icon: Shield,
    title: "Sicher & Transparent",
    description:
      "Alle Transaktionen über Supabase gesichert. Dein Kontostand ist immer aktuell und nachvollziehbar.",
  },
  {
    icon: TrendingUp,
    title: "Live-Statistiken",
    description:
      "Verfolge deinen Fortschritt und die Rangliste im Dashboard in Echtzeit.",
  },
];

export default async function LandingPage() {
  const showcaseRewards = await getShowcaseRewardsWithFallback();

  return (
    <div className="flex flex-col">
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.75 0.22 142 / 15%) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.75 0.22 142 / 15%) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Neon glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
          <Badge
            variant="outline"
            className="mb-6 border-primary/40 text-primary bg-primary/10 px-4 py-1 text-sm"
          >
            <Zap className="h-3 w-3 mr-1.5" />
            Gaming Loyalty Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            <span className="neon-text">Dein Gameplay.</span>
            <br />
            <span className="text-foreground">Echte Rewards.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
            Verdiene LootCoins auf deinen Lieblingsservern und löse sie gegen
            echte Belohnungen ein — alles über Discord, Minecraft und dein
            persönliches Dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="neon-glow text-base h-12 px-8">
              <Link href="/login">
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.133 18.112a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Mit Discord einloggen
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base h-12 px-8 border-border/50 hover:border-primary/40"
            >
              <Link href="/servers">
                Server entdecken
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { label: "Partner-Server", value: "12+" },
              { label: "Aktive Spieler", value: "8.4K" },
              { label: "Rewards vergeben", value: "2.1K" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold neon-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNER-SERVER ──────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-card/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Unsere Partner-Server
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PARTNER_SERVERS.map((server) => (
              <div
                key={server.name}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="text-3xl">{server.icon}</div>
                <div className="text-sm font-medium text-center leading-tight">
                  {server.name}
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0 bg-primary/10 text-primary border-0"
                >
                  {server.players} online
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
            >
              <Link href="/servers">
                Alle Server ansehen
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wie LootDrop funktioniert
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Drei einfache Schritte von deinem Gameplay zu echten Belohnungen.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300 group"
              >
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:neon-glow transition-all duration-300">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="opacity-30" />

      {/* ── REWARD SHOWCASE ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 text-primary bg-primary/10"
            >
              <Star className="h-3 w-3 mr-1.5" />
              Top Rewards
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Was kannst du gewinnen?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Einige der aktuell verfügbaren Rewards im LootDrop-Shop. Logge
              dich ein und sieh alle.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {showcaseRewards.map((reward: {
              id: string;
              title: string;
              description: string;
              cost_coins: number;
              reward_type: string;
            }) => (
              <Card
                key={reward.id}
                className="bg-card border-border/50 hover:border-primary/40 hover:neon-glow transition-all duration-300 group overflow-hidden"
              >
                <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/20" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-snug">
                      {reward.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-primary/30 text-primary text-xs"
                    >
                      {reward.reward_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-bold neon-text">
                        {reward.cost_coins.toLocaleString("de-DE")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Coins
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-500/10 text-green-400 border-0"
                    >
                      Verfügbar
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" className="neon-glow">
              <Link href="/login">
                Jetzt einloggen & alle Rewards sehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 scanline" />
            <Zap className="mx-auto h-10 w-10 text-primary mb-5 neon-glow" />
            <h2 className="text-3xl font-bold mb-4">
              Bereit, loszulegen?
            </h2>
            <p className="text-muted-foreground mb-8">
              Verbinde deinen Discord-Account und starte sofort damit, LootCoins
              zu verdienen.
            </p>
            <Button asChild size="lg" className="neon-glow text-base h-12 px-10">
              <Link href="/login">
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.133 18.112a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Mit Discord einloggen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
