import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPartnerServers } from "@/utils/supabase";
import {
  Server,
  Users,
  Zap,
  ExternalLink,
  MessageSquare,
  Plus,
  Activity,
} from "lucide-react";

// Partner-Server serverseitig laden
async function getServers() {
  try {
    const data = await getPartnerServers();
    if (data?.length) return data;
    return FALLBACK_SERVERS;
  } catch {
    return FALLBACK_SERVERS;
  }
}

// Platzhalter-Daten bis die Supabase-Tabelle befüllt ist
const FALLBACK_SERVERS = [
  {
    id: "1",
    name: "CraftLand SMP",
    description: "Survival Multiplayer mit aktiver Community und wöchentlichen Events.",
    player_count: 2400,
    max_players: 5000,
    icon_emoji: "⚔️",
    tags: ["SMP", "Survival", "PvP"],
    discord_url: "https://discord.gg/example",
    is_active: true,
  },
  {
    id: "2",
    name: "SkyBlock Empire",
    description: "Der größte deutschsprachige SkyBlock-Server mit eigenem Wirtschaftssystem.",
    player_count: 1800,
    max_players: 3000,
    icon_emoji: "🌤️",
    tags: ["SkyBlock", "Economy", "Factions"],
    discord_url: "https://discord.gg/example",
    is_active: true,
  },
  {
    id: "3",
    name: "HypixelDE",
    description: "Mini-Games, BedWars, SkyWars und mehr auf deutschem High-Performance-Server.",
    player_count: 5100,
    max_players: 10000,
    icon_emoji: "🏆",
    tags: ["Mini-Games", "BedWars", "Competitive"],
    discord_url: "https://discord.gg/example",
    is_active: true,
  },
  {
    id: "4",
    name: "PixelFusion",
    description: "Kreativserver mit Builder-Community und monatlichen Baucontest.",
    player_count: 890,
    max_players: 2000,
    icon_emoji: "🎮",
    tags: ["Creative", "Building", "Community"],
    discord_url: "https://discord.gg/example",
    is_active: true,
  },
  {
    id: "5",
    name: "CubeCraft EU",
    description: "Europäischer Game-Server mit niedrigem Ping und Top-Ranking-System.",
    player_count: 3200,
    max_players: 6000,
    icon_emoji: "🟦",
    tags: ["Competitive", "Ranked", "EU"],
    discord_url: "https://discord.gg/example",
    is_active: true,
  },
  {
    id: "6",
    name: "Mineplex DE",
    description: "Klassische Mineplex-Spielmodi auf einem eigens gehosteten deutschen Server.",
    player_count: 1100,
    max_players: 3000,
    icon_emoji: "⚡",
    tags: ["Mini-Games", "Classic", "German"],
    discord_url: "https://discord.gg/example",
    is_active: true,
  },
];

export default async function ServersPage() {
  const servers = await getServers();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Server className="h-4 w-4 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="border-primary/40 text-primary bg-primary/10"
            >
              {servers.length} aktive Partner
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Partner-Server
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Alle Minecraft-Server, die das LootDrop-Plugin aktiv nutzen. Spiele
            dort und verdiene automatisch LootCoins für deinen Account.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-xl mt-2">
            Server-Besitzer: Bindet Spieler und erhaltet eine anteilige
            Gewinnausschüttung pro aktivem Spieler.{" "}
            <Link href="/partner" className="font-medium text-foreground hover:text-primary underline underline-offset-2">
              Mehr erfahren
            </Link>
          </p>
        </div>

        {/* CTA: Server anmelden */}
        <Button
          asChild
          size="lg"
          className="shrink-0 neon-glow"
        >
          <Link
            href="https://discord.gg/lootdrop"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Server hier anmelden
          </Link>
        </Button>
      </div>

      {/* Server Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {servers.map((server: {
          id: string;
          name: string;
          description: string;
          player_count: number;
          max_players: number;
          icon_emoji: string;
          tags: string[];
          discord_url: string;
          is_active: boolean;
        }) => {
          const capacityPercent = Math.min(
            Math.round((server.player_count / server.max_players) * 100),
            100
          );
          const isHighLoad = capacityPercent > 70;

          return (
            <Card
              key={server.id}
              className="bg-card/60 border-border/50 hover:border-primary/30 transition-all duration-300 group flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-2xl group-hover:neon-glow transition-all duration-300">
                      {server.icon_emoji}
                    </div>
                    <div>
                      <CardTitle className="text-base">{server.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Activity className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">
                          Online
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {server.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {server.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary border-0 px-2"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Player count + bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {server.player_count.toLocaleString("de-DE")} /{" "}
                        {server.max_players.toLocaleString("de-DE")} Spieler
                      </span>
                    </div>
                    <span
                      className={`font-medium ${
                        isHighLoad ? "text-orange-400" : "text-green-400"
                      }`}
                    >
                      {capacityPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighLoad ? "bg-orange-400" : "bg-primary"
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="flex gap-2 mt-auto pt-1">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border/50 hover:border-primary/40 text-xs"
                  >
                    <Link
                      href={server.discord_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                      Discord
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Link href="/login">
                      <Zap className="mr-1.5 h-3.5 w-3.5" />
                      Coins sammeln
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Server anmelden Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 scanline" />
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 neon-glow">
            <ExternalLink className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">
              Du betreibst einen Minecraft-Server?
            </h3>
            <p className="text-muted-foreground text-sm">
              Integriere das LootDrop-Plugin kostenlos und biete deinen Spielern
              echte Belohnungen für ihre Spielzeit. Mehr aktive Spieler, bessere
              Retention.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 neon-glow whitespace-nowrap">
            <Link
              href="https://discord.gg/lootdrop"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Server anmelden
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
