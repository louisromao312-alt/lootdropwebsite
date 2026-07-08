import type { ReactNode } from "react";
import { Trophy, Medal, Crown } from "lucide-react";

export const metadata = {
  title: "Leaderboard — LootDrop",
};

const MOCK_LEADERS = [
  { rank: 1,  name: "xX_DragonSlayer_Xx",  coins: 142_500, server: "HypixelDE",       avatar: "🐉" },
  { rank: 2,  name: "CraftKing99",          coins: 128_200, server: "CraftLand SMP",   avatar: "👑" },
  { rank: 3,  name: "SkyMaster_EU",         coins: 115_000, server: "SkyBlock Empire", avatar: "☁️" },
  { rank: 4,  name: "PixelHunter",          coins:  98_750, server: "PixelFusion",     avatar: "🎮" },
  { rank: 5,  name: "NightOwlGaming",       coins:  87_300, server: "CubeCraft EU",    avatar: "🦉" },
  { rank: 6,  name: "EpicBuilder2026",      coins:  76_100, server: "CraftLand SMP",   avatar: "🏗️" },
  { rank: 7,  name: "SpeedRunner_Pro",      coins:  65_500, server: "HypixelDE",       avatar: "⚡" },
  { rank: 8,  name: "Legolas_DE",           coins:  54_200, server: "LiteBans SMP",    avatar: "🏹" },
  { rank: 9,  name: "MineGod420",           coins:  48_800, server: "SkyBlock Empire", avatar: "⛏️" },
  { rank: 10, name: "StealthPvP",           coins:  42_100, server: "HypixelDE",       avatar: "🥷" },
];

const RANK_STYLE: Record<number, { bg: string; text: string; icon: ReactNode }> = {
  1: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: <Crown className="h-4 w-4 text-yellow-500" /> },
  2: { bg: "bg-slate-50  border-slate-200",  text: "text-slate-600",  icon: <Medal className="h-4 w-4 text-slate-500" />  },
  3: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: <Medal className="h-4 w-4 text-orange-400" /> },
};

export default function LeaderboardPage() {
  return (
    <div className="bg-background">
      {/* Header */}
      <section className="section-pad border-b border-border bg-[oklch(0.96_0_0)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="pill mb-6 mx-auto w-fit">Top-Spieler</div>
          <h1 className="headline-xl mb-4">
            Leader<span className="accent-text">board</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Die besten LootCoin-Sammler der Woche. Schaffst du es in die Top 10?
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="section-pad">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[MOCK_LEADERS[1], MOCK_LEADERS[0], MOCK_LEADERS[2]].map((p, idx) => {
              const visualRank = [2, 1, 3][idx];
              const style = RANK_STYLE[visualRank] ?? { bg: "bg-white border-border", text: "", icon: null };
              const heights = ["h-28", "h-36", "h-24"];
              return (
                <div key={p.rank} className={`card-soft border ${style.bg} flex flex-col items-center justify-end p-4 ${heights[idx]}`}>
                  <span className="text-2xl mb-1">{p.avatar}</span>
                  <p className="font-black text-sm uppercase truncate max-w-full text-center">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.coins.toLocaleString("de-DE")} LC</p>
                  <div className={`mt-1 font-black text-xl ${style.text} flex items-center gap-1`}>
                    {style.icon}#{visualRank}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          <div className="flex flex-col gap-2">
            {MOCK_LEADERS.map((p) => {
              const style = RANK_STYLE[p.rank] ?? { bg: "bg-white border-border", text: "text-muted-foreground", icon: <Trophy className="h-4 w-4 text-muted-foreground" /> };
              return (
                <div key={p.rank} className={`card-soft border ${style.bg} flex items-center gap-4 px-5 py-4`}>
                  <span className={`font-black text-xl w-8 text-center ${style.text} flex items-center gap-1`}>
                    {p.rank <= 3 ? style.icon : <span className="text-muted-foreground text-base">#{p.rank}</span>}
                  </span>
                  <span className="text-xl">{p.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm uppercase truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.server}</p>
                  </div>
                  <p className="font-black text-base">
                    {p.coins.toLocaleString("de-DE")}
                    <span className="text-muted-foreground font-medium text-xs ml-1">LC</span>
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Leaderboard wird täglich um Mitternacht aktualisiert.
          </p>
        </div>
      </section>
    </div>
  );
}
