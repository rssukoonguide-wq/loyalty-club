import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { clearMe, loadMe, type Me } from "@/lib/customer-store";
import { getCard } from "@/lib/loyalty.functions";
import { useShop } from "@/hooks/shop-context";
import { cardProgress } from "@/lib/loyalty";
import { useStore } from "@/hooks/use-store";
import { useOwner } from "@/hooks/use-owner";
import { ShopQrPanel } from "@/components/ShopQrPanel";
import { ShopSettingsForm } from "@/components/ShopSettingsForm";
import { NoAccess } from "@/components/NoAccess";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile – Loyalty Club" },
      { name: "description", content: "Your loyalty details and stamp history." },
      { property: "og:title", content: "My Profile – Loyalty Club" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:description", content: "Your loyalty details and stamp history." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const owner = useOwner();
  const { shopId, ready: shopReady } = useShop();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => { if (shopReady) setMe(loadMe(shopId)); }, [shopId, shopReady]);
  const fetchCard = useServerFn(getCard);
  const { data } = useQuery({ queryKey: ["card", shopId, me?.phone], queryFn: () => { if (!me) throw new Error("Enter your details"); return fetchCard({ data: { phone: me.phone, shopId } }); }, enabled: shopReady && !!me });
  const cardSize = useStore().card_size;
  const p = cardProgress(data?.total ?? 0, cardSize);
  if (owner.ready && owner.session) {
    return (
      <AppShell ownerShop={owner.shop ?? undefined}>
        <h2 className="mb-5 text-2xl font-extrabold text-foreground">Shop owner profile</h2>
        {owner.isLoading ? <p>Loading your shop…</p> : !owner.hasAccess ? <NoAccess email={owner.session.user.email} /> : (
          <div className="space-y-5">
            {owner.shop && <ShopQrPanel store={owner.shop} />}
            <ShopSettingsForm store={owner.shop ?? undefined} />
            <Button asChild variant="outline" className="w-full"><Link to="/admin">Customers & stamps</Link></Button>
          </div>
        )}
      </AppShell>
    );
  }
  return (
    <AppShell>
      {me ? (
        <div className="animate-rise space-y-4">
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-2xl font-extrabold text-primary-foreground">{me.fullName[0]}</div>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">{me.fullName}</h2>
            <p className="text-muted-foreground">{me.phone}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[["Total stamps", data?.total ?? 0], ["Cards done", p.completedCards], ["On card", p.onCard]].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-muted p-3">
                  <p className="font-display text-2xl font-extrabold text-primary">{v}</p>
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            {data?.lastScan && <p className="mt-4 text-xs text-muted-foreground">Last visit: {new Date(data.lastScan).toLocaleString()}</p>}
          </div>
          <Button variant="outline" className="w-full rounded-full" onClick={() => { clearMe(shopId); setMe(null); }}>Not you? Switch account</Button>
        </div>
      ) : (
        <p className="rounded-2xl bg-card p-6 text-muted-foreground shadow-soft">Scan the store QR code or open Home to join the loyalty club.</p>
      )}
      <Link to="/admin" className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Store className="h-4 w-4" /> Store owner login
      </Link>
    </AppShell>
  );
}
