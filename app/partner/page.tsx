import Link from "next/link";
import { Check, Shield, Zap, TrendingUp, ArrowRight, Coins, Wallet, Users } from "lucide-react";

export const metadata = {
  title: "Partner werden — LootDrop",
};

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Mehr aktive Spieler",
    desc: "Das Coin-System motiviert Spieler, länger auf deinem Server zu bleiben und öfter zurückzukehren.",
  },
  {
    icon: Coins,
    title: "Umsatzbeteiligung",
    desc: "Du erhältst einen Anteil am Umsatz, den deine Spieler auf LootDrop generieren — pro aktivem Spieler, monatlich ausgezahlt.",
  },
  {
    icon: Shield,
    title: "Einfache Integration",
    desc: "Unser Minecraft-Plugin installierst du in unter 5 Minuten. Kein Code, kein Aufwand.",
  },
  {
    icon: Zap,
    title: "Echtzeit-Statistiken",
    desc: "Im Partner-Dashboard siehst du Live-Daten: aktive Spieler, verdiente Coins, Redemptions und deine Einnahmen.",
  },
];

const REVENUE_FLOW = [
  {
    step: "01",
    title: "Spieler sind aktiv",
    desc: "Deine Community spielt auf dem Server und sammelt LootCoins über das Plugin.",
  },
  {
    step: "02",
    title: "Umsatz entsteht",
    desc: "Wenn Spieler Rewards einlösen oder Tickets kaufen, fließt Umsatz über LootDrop.",
  },
  {
    step: "03",
    title: "Du profitierst mit",
    desc: "Als Partner-Server erhältst du eine anteilige Gewinnausschüttung — berechnet auf Basis deiner aktiven Spieler.",
  },
];

const FEATURES = [
  "Kostenloses LootDrop-Plugin für deinen Server",
  "Anteilige Umsatzbeteiligung pro aktivem Spieler",
  "Monatliche Gewinnausschüttung ins Partner-Dashboard",
  "Eigene Coin-Regeln & Multiplikatoren",
  "Branding deines Servers im LootDrop Shop",
  "Direkter Support via Discord",
  "Zugang zum Partner-Dashboard mit Einnahmen-Übersicht",
];

export default function PartnerPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="section-pad border-b border-border bg-[oklch(0.96_0_0)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill mb-6 mx-auto w-fit">Für Server-Betreiber</div>
          <h1 className="headline-xl mb-6">
            Werde<br /><span className="accent-text">Partner.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Steigere die Spielerbindung auf deinem Minecraft-Server — und verdiene
            anteilig mit, wenn deine Community LootCoins einlöst.
          </p>
          <a href="mailto:partner@lootdrop.gg" className="btn-cta inline-flex mx-auto">
            Jetzt Anfrage senden
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="headline-lg text-center mb-14">Warum <span className="accent-text">LootDrop?</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-soft p-8 flex flex-col gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-black text-xl uppercase tracking-tight leading-tight">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Umsatzbeteiligung */}
      <section className="section-pad bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-4 py-1.5 text-sm font-semibold mb-6">
                <Wallet className="h-4 w-4 text-primary" />
                Für Server-Besitzer
              </div>
              <h2 className="font-black text-4xl md:text-5xl uppercase tracking-tight leading-[0.95] mb-6">
                Nicht nur binden.<br />
                <span className="text-primary">Mitverdienen.</span>
              </h2>
              <p className="text-lg text-background/70 leading-relaxed mb-6">
                LootDrop ist kein reines Retention-Tool. Als Partner-Server partizipierst
                du am Umsatz deiner Spieler — ob Reward-Einlösungen, Shop-Käufe oder
                Verlosungs-Tickets. Je aktiver deine Community, desto höher dein Anteil.
              </p>
              <div className="flex items-start gap-3 rounded-xl border border-background/15 bg-background/5 p-4">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-background/80 leading-relaxed">
                  <span className="font-bold text-background">Fair & transparent:</span> Die
                  Ausschüttung basiert auf der Anzahl aktiver Spieler auf deinem Server und
                  dem von ihnen generierten Plattform-Umsatz. Auszahlung monatlich über das
                  Partner-Dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {REVENUE_FLOW.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex gap-5 rounded-2xl border border-background/15 bg-background/5 p-6"
                >
                  <div className="step-num shrink-0 bg-primary text-primary-foreground">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight mb-1">{title}</h3>
                    <p className="text-sm text-background/70 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature list + CTA */}
      <section className="section-pad bg-[oklch(0.96_0_0)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="pill mb-6 w-fit">Im Paket enthalten</div>
            <h2 className="headline-lg mb-8">
              Alles dabei.<br /><span className="accent-text">Sofort.</span>
            </h2>
            <ul className="flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-semibold">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact form placeholder */}
          <div className="card-soft p-8 flex flex-col gap-5">
            <h3 className="font-black text-2xl uppercase tracking-tight">Anfrage stellen</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Dein Discord-Username"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled
              />
              <input
                type="text"
                placeholder="Server-IP / Name"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled
              />
              <textarea
                placeholder="Kurze Beschreibung deines Servers..."
                rows={4}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                disabled
              />
            </div>
            <a href="mailto:partner@lootdrop.gg" className="btn-cta justify-center">
              Per E-Mail anfragen →
            </a>
            <p className="text-xs text-center text-muted-foreground">
              Formular kommt bald — kontaktiere uns direkt per Mail oder Discord
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
