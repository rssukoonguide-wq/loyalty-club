import { Check, Gift, Coffee } from "lucide-react";
import { cardProgress } from "@/lib/loyalty";
import { useStore } from "@/hooks/use-store";

export function StampCard({ total, justAdded }: { total: number; justAdded?: boolean }) {
  const CARD_SIZE = useStore().card_size;
  const p = cardProgress(total, CARD_SIZE);
  return (
    <section className="bg-loyalty-card animate-rise rounded-3xl p-6 text-primary-foreground">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">Stamp card</p>
          <h2 className="mt-1 text-3xl font-extrabold">
            {p.onCard}
            <span className="text-lg opacity-60"> / {CARD_SIZE}</span>
          </h2>
        </div>
        <Coffee className="h-8 w-8 text-gold" />
      </div>
      <div className="mt-6 grid grid-cols-5 gap-3">
        {Array.from({ length: CARD_SIZE }).map((_, i) => {
          const filled = i < p.onCard;
          const last = i === CARD_SIZE - 1;
          const isNew = justAdded && i === p.onCard - 1;
          return (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-full border-2 ${
                filled ? "border-gold bg-gold text-wine" : "border-dashed border-primary-foreground/35"
              }`}
            >
              {filled ? (
                <Check className={`h-5 w-5 ${isNew ? "animate-stamp" : ""}`} strokeWidth={3} />
              ) : last ? (
                <Gift className="h-5 w-5 opacity-50" />
              ) : (
                <span className="text-xs opacity-50">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary-foreground/15">
        <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${(p.onCard / CARD_SIZE) * 100}%` }} />
      </div>
      <p className="mt-3 text-sm opacity-85">
        {p.rewardUnlocked
          ? "Card complete! Show this to staff to claim your gift."
          : `${p.onCard} stamps collected, ${p.remaining} remaining to complete the card`}
      </p>
    </section>
  );
}

export function RewardBanner() {
  return (
    <div className="animate-rise mt-4 flex items-center gap-4 rounded-2xl border-2 border-gold bg-card p-4 shadow-soft">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-wine">
        <Gift className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-lg font-extrabold text-foreground">Reward unlocked! 🎉</p>
        <p className="text-sm text-muted-foreground">Enjoy a free item on us. Your next stamp starts a new card.</p>
      </div>
    </div>
  );
}
