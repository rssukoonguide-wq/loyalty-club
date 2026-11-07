import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StampCard, RewardBanner } from "@/components/StampCard";
import { SocialButtons } from "@/components/SocialButtons";
import { JoinForm } from "@/components/JoinForm";
import { loadMe, saveMe, type Me } from "@/lib/customer-store";
import { collectStamp } from "@/lib/loyalty.functions";
import { useShop } from "@/hooks/shop-context";
import { cardProgress } from "@/lib/loyalty";
import { useStore } from "@/hooks/use-store";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Collect Your Stamp – Loyalty Club" },
      { name: "description", content: "Scanned the store QR? Collect today's stamp here." },
      { property: "og:title", content: "Collect Your Stamp – Loyalty Club" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:description", content: "One stamp per day. Ten stamps unlock a reward." },
    ],
  }),
  component: Scan,
});

type Result = { status: "added" | "already"; total: number };

function Scan() {
  const { shopId, ready: shopReady } = useShop();
  const cardSize = useStore().card_size;
  const collect = useServerFn(collectStamp);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const started = useRef("");

  async function run(m: Me) {
    setBusy(true);
    try {
      const r = await collect({ data: { ...m, shopId } });
      saveMe(m, shopId);
      setResult(r);
      if (r.status === "added") toast.success("Stamp added! ☕");
      else toast("You have already collected your stamp for today! Come back tomorrow");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!shopReady) return;
    setReady(true);
    setResult(null);
    const me = loadMe(shopId);
    if (me && started.current !== shopId) {
      started.current = shopId;
      void run(me);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, shopReady]);

  return (
    <AppShell>
      {!ready ? null : result ? (
        <>
          {result.status === "already" && (
            <div className="animate-rise mb-4 flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
              <CalendarCheck className="h-6 w-6 shrink-0" />
              <p className="text-sm font-semibold">You have already collected your stamp for today! Come back tomorrow.</p>
            </div>
          )}
          <StampCard total={result.total} justAdded={result.status === "added"} />
          {cardProgress(result.total, cardSize).rewardUnlocked && <RewardBanner />}
          <SocialButtons />
        </>
      ) : busy && loadMe(shopId) ? (
        <p className="py-20 text-center text-muted-foreground">Adding your stamp…</p>
      ) : (
        <JoinForm busy={busy} onSubmit={run} />
      )}
    </AppShell>
  );
}
