import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Stamp, QrCode } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { useShop } from "@/hooks/shop-context";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "10 Stamps, One Reward – Loyalty Club" },
      { name: "description", content: "Collect ten daily visit stamps to complete your card and earn a free reward." },
      { property: "og:title", content: "10 Stamps, One Reward – Loyalty Club" },
      { property: "og:description", content: "Ten visits. Ten stamps. A free reward from your shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rewards,
});

function Rewards() {
  const { shopId } = useShop();
  const CARD_SIZE = useStore().card_size;
  return (
    <AppShell>
      <div className="animate-rise pb-6">
        <div className="flex items-center gap-3">
          <Gift className="h-7 w-7 text-primary" />
          <h2 className="text-3xl font-extrabold text-foreground">Rewards</h2>
        </div>
        <p className="mt-2 text-muted-foreground">A little thank you for coming back.</p>

        <section className="mt-7 border-y border-border py-6">
          <p className="text-sm font-semibold text-primary">Your reward journey</p>
          <h3 className="mt-2 text-2xl font-extrabold text-foreground">{CARD_SIZE} stamps. 1 free reward.</h3>
          <div className="mt-6 grid grid-cols-5 gap-x-3 gap-y-5" aria-label="Ten stamp milestones to earn a reward">
            {Array.from({ length: CARD_SIZE }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`flex aspect-square w-full items-center justify-center rounded-full border-2 border-gold ${i === CARD_SIZE - 1 ? "bg-wine text-gold" : "bg-gold text-wine"}`}>
                  {i === CARD_SIZE - 1 ? <Gift className="h-6 w-6" /> : <Stamp className="h-5 w-5" />}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted-foreground">One stamp per day. Complete all {CARD_SIZE} to earn your reward.</p>
        </section>

        <div className="flex items-start gap-4 py-7">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-wine">
            <Gift className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-foreground">A free item from your shop</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Once your card reaches {CARD_SIZE} stamps, show your completed card to the staff to claim your gift.</p>
          </div>
        </div>
        <div className="grid gap-3">
          <Button asChild className="h-12 rounded-full">
            <Link to="/" search={{ shop: shopId }}><Stamp className="h-4 w-4" /> My stamp card</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full">
            <Link to="/scan" search={{ shop: shopId }}><QrCode className="h-4 w-4" /> Collect today's stamp</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}