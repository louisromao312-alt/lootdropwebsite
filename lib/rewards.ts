export type RewardCategory = "direct" | "raffle";

export type DirectRewardType = "guthaben" | "rabatt" | "ingame" | "digital";

export interface ShowcaseReward {
  id: string;
  title: string;
  description: string;
  cost_coins: number;
  category: RewardCategory;
  /** Nur bei Direkt-Rewards */
  reward_type?: DirectRewardType;
  /** Nur bei Verlosungen: Wert des Hauptpreises */
  prize_value?: string;
  /** Nur bei Verlosungen: Ziehungsdatum (Anzeige) */
  draw_date?: string;
  /** Nur bei Verlosungen: bereits verkaufte Tickets */
  tickets_sold?: number;
}

export const DIRECT_REWARDS: ShowcaseReward[] = [
  {
    id: "d1",
    title: "Steam Guthaben 10€",
    description: "Sofort einlösbarer Steam-Wallet Code. Direkt auf dein Konto.",
    cost_coins: 8000,
    category: "direct",
    reward_type: "guthaben",
  },
  {
    id: "d2",
    title: "Steam Guthaben 5€",
    description: "5€ Steam-Wallet Guthaben — perfekt für Sales & DLCs.",
    cost_coins: 4500,
    category: "direct",
    reward_type: "guthaben",
  },
  {
    id: "d3",
    title: "Amazon Gift Card 15€",
    description: "Digitale Amazon-Geschenkkarte. Sofort per E-Mail.",
    cost_coins: 12000,
    category: "direct",
    reward_type: "guthaben",
  },
  {
    id: "d4",
    title: "Discord Nitro Classic",
    description: "1 Monat Discord Nitro Classic für dein Konto.",
    cost_coins: 5000,
    category: "direct",
    reward_type: "digital",
  },
  {
    id: "d5",
    title: "20% Shop-Rabatt",
    description: "20% Rabatt auf LootDrop Merch & Partner-Shop Artikel.",
    cost_coins: 1500,
    category: "direct",
    reward_type: "rabatt",
  },
  {
    id: "d6",
    title: "VIP Server-Rang",
    description: "Permanenter VIP-Rang auf einem Partner-Server deiner Wahl.",
    cost_coins: 3000,
    category: "direct",
    reward_type: "ingame",
  },
];

export const RAFFLE_REWARDS: ShowcaseReward[] = [
  {
    id: "r1",
    title: "25€ Steam Gutschein",
    description:
      "Kaufe Tickets für die Chance auf einen 25€ Steam-Gutschein — für einen Bruchteil der Kosten.",
    cost_coins: 500,
    category: "raffle",
    prize_value: "25€",
    draw_date: "Sonntag, 20:00 Uhr",
    tickets_sold: 847,
  },
  {
    id: "r2",
    title: "50€ Amazon Gift Card",
    description:
      "Begehrter Hauptpreis! Mehr Tickets = höhere Gewinnchance. Ziehung jeden Freitag.",
    cost_coins: 750,
    category: "raffle",
    prize_value: "50€",
    draw_date: "Freitag, 18:00 Uhr",
    tickets_sold: 412,
  },
  {
    id: "r3",
    title: "Minecraft Java Edition",
    description:
      "Gewinne einen vollständigen Minecraft Java Key. Nur 400 LC pro Ticket.",
    cost_coins: 400,
    category: "raffle",
    prize_value: "~27€",
    draw_date: "Monatlich (1. des Monats)",
    tickets_sold: 1203,
  },
  {
    id: "r4",
    title: "Gaming Headset (HyperX)",
    description:
      "HyperX Cloud II — eines der beliebtesten Gaming-Headsets. Limitierte Verlosung.",
    cost_coins: 600,
    category: "raffle",
    prize_value: "~80€",
    draw_date: "Letzter Sonntag im Monat",
    tickets_sold: 289,
  },
];

export const ALL_SHOWCASE_REWARDS: ShowcaseReward[] = [
  ...DIRECT_REWARDS,
  ...RAFFLE_REWARDS,
];

export function getRewardTypeLabel(reward: ShowcaseReward): string {
  if (reward.category === "raffle") return "Verlosung";
  switch (reward.reward_type) {
    case "guthaben":
      return "Guthaben";
    case "rabatt":
      return "Rabatt";
    case "ingame":
      return "In-Game";
    case "digital":
      return "Digital";
    default:
      return "Reward";
  }
}
