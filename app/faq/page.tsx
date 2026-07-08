export const metadata = {
  title: "FAQ — LootDrop",
};

const FAQS = [
  {
    q: "Was ist LootDrop?",
    a: "LootDrop ist eine Gaming Loyalty Plattform für Minecraft-Server. Du verbindest deinen Discord-Account, spielst auf Partner-Servern und verdienst dabei automatisch LootCoins — die du gegen echte Belohnungen eintauschen kannst.",
  },
  {
    q: "Wie verdiene ich LootCoins?",
    a: "Unser Minecraft-Plugin ist auf allen Partner-Servern aktiv. Es zeichnet dein Spielverhalten auf (Spielzeit, Kills, Quests etc.) und gutschreibt dir automatisch LootCoins basierend auf den Regeln des jeweiligen Servers.",
  },
  {
    q: "Welche Belohnungen gibt es?",
    a: "Im Reward-Shop gibt es zwei Kategorien: Direkt einlösbare Rewards (Steam-Guthaben, Amazon Gift Cards, Rabatte, In-Game-Ränge) und Verlosungs-Tickets. Bei Verlosungen kaufst du günstige Tickets für die Chance auf begehrte Hauptpreise — z. B. einen 25€ Steam-Gutschein für nur 500 LC pro Ticket.",
  },
  {
    q: "Kostet die Nutzung etwas?",
    a: "Nein! LootDrop ist für Spieler komplett kostenlos. Du registrierst dich mit deinem Discord-Account und kannst sofort loslegen.",
  },
  {
    q: "Wie lange sind meine LootCoins gültig?",
    a: "LootCoins verfallen nicht, solange dein Account aktiv ist (mindestens eine Aktivität in den letzten 12 Monaten).",
  },
  {
    q: "Wie funktionieren Verlosungs-Tickets?",
    a: "Du kaufst Tickets mit LootCoins für eine aktive Verlosung. Jeder Ticket-Kauf erhöht deine Gewinnchance. Nach der Ziehung wird ein Gewinner per Zufallsgenerator ermittelt und per Discord benachrichtigt. Tickets sind nicht erstattungsfähig — du kaufst eine Chance, nicht den garantierten Preis.",
  },
  {
    q: "Kann ich LootCoins verkaufen oder übertragen?",
    a: "Nein. LootCoins sind nicht übertragbar und können nicht gegen Echtgeld verkauft werden. Sie sind ausschließlich im LootDrop Reward-Shop einlösbar.",
  },
  {
    q: "Wie melde ich meinen Server als Partner an?",
    a: "Besuche unsere \"Partner werden\"-Seite und fülle das Formular aus. Unser Team meldet sich innerhalb von 48 Stunden bei dir.",
  },
  {
    q: "Sind meine Daten sicher?",
    a: "Ja. Wir speichern nur deine Discord-ID, deinen Nutzernamen und deine Spielstatistiken. Wir geben keine Daten an Dritte weiter. Details findest du in unserer Datenschutzerklärung.",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-background">
      <section className="section-pad border-b border-border bg-[oklch(0.96_0_0)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill mb-6 mx-auto w-fit">FAQ</div>
          <h1 className="headline-xl mb-4">
            Häufige<br /><span className="accent-text">Fragen</span>
          </h1>
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="card-soft p-7">
                <h2 className="font-black text-lg uppercase tracking-tight mb-3">{q}</h2>
                <p className="text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
