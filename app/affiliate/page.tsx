import Link from "next/link";
import { ArrowRight, Share2, DollarSign, BarChart2, Users } from "lucide-react";

export const metadata = {
  title: "LootDrop Affiliate — Verdiene mit deinem Netzwerk",
};

const PERKS = [
  { icon: DollarSign, title: "Bis zu 20% Provision", desc: "Erhalte einen Prozentsatz aller LootCoins, die deine Referrals auf Partner-Servern verdienen." },
  { icon: Users,      title: "Unbegrenzte Referrals", desc: "Lade so viele Spieler ein wie du möchtest — es gibt kein Limit für deine Einnahmen." },
  { icon: BarChart2,  title: "Echtzeit-Dashboard", desc: "Verfolge deine Klicks, Registrierungen und Provisionen in deinem persönlichen Affiliate-Dashboard." },
  { icon: Share2,     title: "Individueller Link", desc: "Du erhältst deinen eigenen Tracking-Link, den du überall teilen kannst." },
];

export default function AffiliatePage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="section-pad border-b border-border bg-[oklch(0.96_0_0)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill mb-6 mx-auto w-fit">Affiliate Programm</div>
          <h1 className="headline-xl mb-6">
            Teile.<br /><span className="accent-text">Verdiene.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Empfehle LootDrop an deine Community und verdiene Provisionen für
            jeden Spieler, den du mitbringst.
          </p>
          <Link href="/login" className="btn-cta mx-auto inline-flex">
            Jetzt Affiliate werden
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Perks */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="headline-lg text-center mb-14">Deine <span className="accent-text">Vorteile</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-soft p-7 flex flex-col gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-black text-lg uppercase tracking-tight leading-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-foreground text-background">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-black text-5xl uppercase tracking-tight mb-6">Bereit?</h2>
          <p className="text-background/70 text-lg mb-8">
            Registriere dich kostenlos und erhalte sofort deinen persönlichen Affiliate-Link.
          </p>
          <Link href="/login" className="btn-green inline-flex mx-auto">
            Discord verbinden & starten
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
