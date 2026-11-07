import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { QrCode } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StampCard, RewardBanner } from "@/components/StampCard";
import { SocialButtons } from "@/components/SocialButtons";
import { JoinForm } from "@/components/JoinForm";
import { loadMe, saveMe, type Me } from "@/lib/customer-store";
import { getCard } from "@/lib/loyalty.functions";
import { useShop } from "@/hooks/shop-context";
import { cardProgress } from "@/lib/loyalty";
import { useStore } from "@/hooks/use-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Stamp Card – Loyalty Club" },
      { name: "description", content: "See your stamps, progress and rewards at a glance." },
      { property: "og:title", content: "My Stamp Card – Loyalty Club" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:description", content: "Collect 10 stamps and unlock a free reward." },
    ],
  }),
  component: Index,
});

function Index() {
  const { shopId, ready: shopReady } = useShop();
  const cardSize = useStore().card_size;
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!shopReady) return;
    setMe(loadMe(shopId));
    setReady(true);
  }, [shopId, shopReady]);
  const fetchCard = useServerFn(getCard);
  const { data } = useQuery({
    queryKey: ["card", shopId, me?.phone],
    queryFn: () => { if (!me) throw new Error("Enter your details"); return fetchCard({ data: { phone: me.phone, shopId } }); },
    enabled: shopReady && !!me,
  });

  return (
    <AppShell>
      <SocialButtons />
      {!ready ? null : !me ? (
        <div className="mt-5">
          <JoinForm cta="Continue" onSubmit={(m) => { saveMe(m, shopId); setMe(m); }} />
        </div>
      ) : (
        <>
          <p className="mb-4 mt-5 text-muted-foreground">Hi <span className="font-semibold text-foreground">{me.fullName.split(" ")[0]}</span>, welcome back.</p>
          <StampCard total={data?.total ?? 0} />
          {data && cardProgress(data.total, cardSize).rewardUnlocked && <RewardBanner />}
          <Link to="/scan" search={{ shop: shopId }} className="mt-5 flex items-center justify-between rounded-2xl bg-secondary p-4 text-secondary-foreground">
            <span className="font-semibold">{data?.stampedToday ? "Today's stamp collected ✓" : "Collect today's stamp"}</span>
            <QrCode className="h-5 w-5" />
          </Link>
        </>
      )}
    </AppShell>
  );
}
