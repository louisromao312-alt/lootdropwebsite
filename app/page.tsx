import Link from "next/link";
import { getShowcaseRewards } from "@/utils/supabase";
import FloatingCoins from "@/components/FloatingCoins";
import { ArrowRight, Check, Star, Zap, Users, Trophy } from "lucide-react";

async function getRewards() {
  try {
    const data = await getShowcaseRewards();
    return data?.length ? data : FALLBACK_REWARDS;
  } catch {
    return FALLBACK_REWARDS;
  }
}

const FALLBACK_REWARDS = [
  { id: "1", title: "Discord Nitro Classic", description: "1 Monat Nitro für dein Konto.", cost_coins: 5000, reward_type: "digital" },
  { id: "2", title: "Steam Guthaben 10€", description: "10€ Steam-Wallet Guthaben.", cost_coins: 8000, reward_type: "digital" },
  { id: "3", title: "Amazon Gift Card 15€", description: "Digitale Amazon-Geschenkkarte.", cost_coins: 12000, reward_type: "digital" },
  { id: "4", title: "VIP Server-Rang", description: "Permanenter VIP-Rang auf einem Partner-Server.", cost_coins: 3000, reward_type: "in-game" },
  { id: "5", title: "LootDrop Mystery Box", description: "Überraschungs-Belohnung aus unserem Pool.", cost_coins: 2000, reward_type: "mystery" },
  { id: "6", title: "Minecraft Java Edition", description: "Vollständiger Key für einen Freund.", cost_coins: 15000, reward_type: "digital" },
];

const PARTNER_SERVERS = [
  { name: "CraftLand SMP",   players: "2.4K", tag: "Survival",   color: "bg-emerald-50  border-emerald-200" },
  { name: "SkyBlock Empire", players: "1.8K", tag: "SkyBlock",   color: "bg-sky-50      border-sky-200"     },
  { name: "HypixelDE",       players: "5.1K", tag: "Minigames",  color: "bg-purple-50   border-purple-200"  },
  { name: "PixelFusion",     players: "890",  tag: "Creative",   color: "bg-pink-50     border-pink-200"    },
  { name: "CubeCraft EU",    players: "3.2K", tag: "PvP",        color: "bg-orange-50   border-orange-200"  },
  { name: "LiteBans SMP",    players: "1.1K", tag: "Roleplay",   color: "bg-amber-50    border-amber-200"   },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Trete einem Partner-Server bei",
    desc: "Wähle aus unseren verifizierten Minecraft-Servern und verbinde deinen Discord-Account.",
    icon: Users,
  },
  {
    step: "02",
    title: "Spiele & verdiene LootCoins",
    desc: "Unser Plugin zeichnet dein Spielverhalten auf und gutschreibt dir automatisch LootCoins.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Löse echte Rewards ein",
    desc: "Tausche deine LootCoins gegen Steam-Guthaben, Discord Nitro, Amazon Gift Cards und mehr.",
    icon: Trophy,
  },
];

const STATS = [
  { value: "12,500+", label: "Aktive Spieler" },
  { value: "48",      label: "Partner-Server" },
  { value: "€85K",   label: "Rewards ausgezahlt" },
  { value: "4.9★",   label: "Bewertung" },
];

export default async function HomePage() {
  const rewards = await getRewards();

  return (
    <div className="bg-background">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Background tint */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,oklch(0.72_0.23_142_/_6%)_0%,transparent_70%)]" />

        {/* Floating 3D coins */}
        <FloatingCoins />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Pill */}
            <div className="pill mb-8 w-fit">
              <Zap className="h-3.5 w-3.5" />
              Gaming Loyalty Platform
            </div>

            {/* Headline */}
            <h1 className="headline-xl mb-8">
              Verdiene.<br />
              <span className="accent-text">Spiele.</span><br />
              Gewinne.
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Sammle LootCoins auf deinen Lieblingsservern und löse sie gegen
              echte Belohnungen ein — Steam-Guthaben, Discord Nitro, Amazon Gift Cards und mehr.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-cta">
                Jetzt starten
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/servers" className="btn-cta-outline">
                Partner-Server
              </Link>
            </div>

            {/* Trust bar */}
            <div className="mt-12 flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              {["Kostenlos mitmachen", "Sofort Rewards", "Sicher via Discord"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black tracking-tight mb-1">{value}</p>
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="pill mb-4 mx-auto w-fit">So funktioniert&apos;s</div>
            <h2 className="headline-lg">Drei Schritte.<br /><span className="accent-text">Echte Rewards.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="card-soft p-8 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="step-num">{step}</div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase tracking-tight">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNER SERVERS ──────────────────────────────────────────── */}
      <section className="section-pad bg-[oklch(0.96_0_0)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="pill mb-4 w-fit">Jetzt verfügbar</div>
              <h2 className="headline-lg">Partner<br /><span className="accent-text">Server</span></h2>
            </div>
            <Link href="/servers" className="btn-cta-outline text-sm py-2.5 px-5 self-start sm:self-auto">
              Alle Server →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PARTNER_SERVERS.map(({ name, players, tag, color }) => (
              <div key={name} className={`card-soft p-6 flex items-center justify-between border ${color} hover:scale-[1.02] transition-transform`}>
                <div>
                  <p className="font-black text-lg uppercase tracking-tight">{name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{players} Spieler online</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-current/20 text-muted-foreground">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REWARDS ──────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="pill mb-4 w-fit">Reward Shop</div>
              <h2 className="headline-lg">Deine<br /><span className="accent-text">Belohnungen</span></h2>
            </div>
            <Link href="/login" className="btn-cta text-sm py-2.5 px-5 self-start sm:self-auto">
              Shop öffnen →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewards.map((r) => (
              <div key={r.id} className="card-soft p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-base uppercase tracking-tight leading-tight">{r.title}</h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                    {r.reward_type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{r.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-black text-lg text-foreground">
                    {r.cost_coins.toLocaleString("de-DE")}
                    <span className="text-sm font-medium text-muted-foreground ml-1">LC</span>
                  </span>
                  <Link href="/login" className="btn-green text-xs py-2 px-4">
                    Einlösen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="section-pad bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Star className="h-10 w-10 text-primary fill-primary" />
          </div>
          <h2 className="font-black text-5xl md:text-7xl uppercase tracking-tight leading-[0.92] mb-6">
            Bereit zu starten?
          </h2>
          <p className="text-lg text-background/70 mb-10 max-w-lg mx-auto">
            Verbinde deinen Discord-Account, trete einem Partner-Server bei und verdiene deine ersten LootCoins — kostenlos und sofort.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="btn-green text-base px-8 py-3.5">
              Discord verbinden
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/partner" className="btn-cta-outline text-base px-8 py-3.5 border-background/30 text-background hover:border-background/60">
              Server anmelden
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
