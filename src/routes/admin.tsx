import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LogOut, Users, Stamp, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { adminCustomers } from "@/lib/loyalty.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOwner } from "@/hooks/use-owner";
import { ShopQrPanel } from "@/components/ShopQrPanel";
import { ShopSettingsForm } from "@/components/ShopSettingsForm";
import { NoAccess } from "@/components/NoAccess";
import { AccessPanel } from "@/components/AccessPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard – Loyalty Club" },
      { name: "description", content: "Track customers, stamps and download your store QR code." },
      { property: "og:title", content: "Owner Dashboard – Loyalty Club" },
      { property: "og:description", content: "Track customers and stamps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { session, ready } = useOwner();

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Customer app</Link>
      {!ready ? null : session ? <Dashboard /> : <OwnerAuth />}
    </div>
  );
}

function OwnerAuth() {
  const [busy, setBusy] = useState(false);
  async function withGoogle() {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
      extraParams: { prompt: "select_account" },
    });
    setBusy(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    if (res.redirected) return;
  }
  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-3xl bg-card p-6 shadow-soft">
      <h1 className="text-2xl font-extrabold text-foreground">Store owner</h1>
      <p className="text-sm text-muted-foreground">
        Sign in with your Gmail account — no password to remember. Create your own shop and get a unique customer QR.
      </p>
      <Button disabled={busy} className="h-12 w-full rounded-full text-base" onClick={withGoogle}>
        <GoogleG />
        {busy ? "Opening Google…" : "Continue with Google"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Use the Gmail address you want on this shop's account.
      </p>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function Dashboard() {
  const { shop, isLoading: shopLoading, session, hasAccess, isSuperAdmin } = useOwner();
  const list = useServerFn(adminCustomers);
  const { data, isLoading } = useQuery({ queryKey: ["admin", session?.user.id, shop?.id], queryFn: () => list(), enabled: !!shop });
  const [q, setQ] = useState("");
  if (shopLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!hasAccess) return <NoAccess email={session?.user.email} />;
  if (!shop) return <div className="space-y-6">{isSuperAdmin && <AccessPanel />}<ShopSettingsForm /></div>;
  if (isLoading || !data) return <p>Loading…</p>;
  const rows = data.customers.filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()));
  const totalStamps = data.customers.reduce((s, c) => s + c.total, 0);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-foreground">Owner dashboard</h1>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" /> Sign out</Button>
      </div>
      {isSuperAdmin && <AccessPanel />}
      <div className="grid grid-cols-2 gap-4">
        <Stat icon={Users} label="Customers" value={data.customers.length} />
        <Stat icon={Stamp} label="Stamps given" value={totalStamps} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ShopQrPanel store={shop} />
        <ShopSettingsForm store={shop} />
      </div>
      <div className="rounded-3xl bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2 rounded-full bg-muted px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" className="h-10 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="p-2">Name</th><th className="p-2">Mobile</th><th className="p-2">Last scan</th><th className="p-2 text-right">Stamps</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2 font-semibold text-foreground">{c.name}</td>
                  <td className="p-2"><a className="text-primary" href={`tel:${c.phone}`}>{c.phone}</a></td>
                  <td className="p-2 text-muted-foreground">{c.lastScan ? new Date(c.lastScan).toLocaleString() : "—"}</td>
                  <td className="p-2 text-right font-display text-lg font-extrabold text-primary">{c.total}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="bg-loyalty-card rounded-3xl p-6 text-primary-foreground">
      <Icon className="h-6 w-6 text-gold" />
      <p className="mt-4 font-display text-4xl font-extrabold">{value}</p>
      <p className="text-sm opacity-75">{label}</p>
    </div>
  );
}

