import Link from "next/link";
import { Ticket, ShoppingBag } from "lucide-react";
import type { ShowcaseReward } from "@/lib/rewards";
import { getRewardTypeLabel } from "@/lib/rewards";

interface RewardCardProps {
  reward: ShowcaseReward;
  /** Wenn gesetzt, wird ein Link statt Button gerendert (Landingpage) */
  href?: string;
  /** Dashboard-Modus: interaktiver Button */
  onClaim?: () => void;
  canAfford?: boolean;
  isClaiming?: boolean;
  disabled?: boolean;
}

export default function RewardCard({
  reward,
  href = "/login",
  onClaim,
  canAfford = true,
  isClaiming = false,
  disabled = false,
}: RewardCardProps) {
  const isRaffle = reward.category === "raffle";
  const label = getRewardTypeLabel(reward);

  const actionLabel = isRaffle ? "Ticket kaufen" : "Einlösen";
  const ActionIcon = isRaffle ? Ticket : ShoppingBag;

  const badgeClass = isRaffle
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : reward.reward_type === "guthaben"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : reward.reward_type === "rabatt"
        ? "bg-violet-50 text-violet-700 border-violet-200"
        : "bg-primary/10 text-primary border-primary/20";

  return (
    <div
      className={`card-soft p-6 flex flex-col gap-3 hover:shadow-md transition-shadow ${
        isRaffle ? "border-amber-200/60 ring-1 ring-amber-100" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-black text-base uppercase tracking-tight leading-tight">
          {reward.title}
        </h3>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${badgeClass}`}
        >
          {label}
        </span>
      </div>

      {isRaffle && reward.prize_value && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-black text-2xl text-foreground">{reward.prize_value}</span>
          <span className="text-muted-foreground font-medium">Hauptpreis</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        {reward.description}
      </p>

      {isRaffle && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {reward.draw_date && (
            <span className="flex items-center gap-1">
              <span className="font-semibold text-foreground">Ziehung:</span> {reward.draw_date}
            </span>
          )}
          {reward.tickets_sold != null && (
            <span>
              <span className="font-semibold text-foreground">
                {reward.tickets_sold.toLocaleString("de-DE")}
              </span>{" "}
              Tickets verkauft
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          <span className="font-black text-lg text-foreground">
            {reward.cost_coins.toLocaleString("de-DE")}
            <span className="text-sm font-medium text-muted-foreground ml-1">LC</span>
          </span>
          {isRaffle && (
            <p className="text-xs text-muted-foreground mt-0.5">pro Ticket</p>
          )}
        </div>

        {onClaim ? (
          <button
            type="button"
            onClick={onClaim}
            disabled={disabled || !canAfford || isClaiming}
            className={`inline-flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-full transition-all ${
              isRaffle
                ? "bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                : "btn-green disabled:opacity-50"
            }`}
          >
            <ActionIcon className="h-3.5 w-3.5" />
            {isClaiming ? "..." : actionLabel}
          </button>
        ) : (
          <Link
            href={href}
            className={`inline-flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-full transition-all ${
              isRaffle
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "btn-green"
            }`}
          >
            <ActionIcon className="h-3.5 w-3.5" />
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
