import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveStoreSettings, type StoreSettings, type Shop } from "@/lib/loyalty.functions";

export function ShopSettingsForm({ store }: { store?: Shop | undefined }) {
  const qc = useQueryClient();
  const save = useServerFn(saveStoreSettings);
  const [f, setF] = useState<StoreSettings>({ name: "", phone: "", instagram: "", whatsapp: "", facebook: "", youtube: "", website: "", card_size: 10 });
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (store) setF({ name: store.name, phone: store.phone, instagram: store.instagram, whatsapp: store.whatsapp, facebook: store.facebook ?? "", youtube: store.youtube ?? "", website: store.website ?? "", card_size: store.card_size ?? 10 }); }, [store?.name, store?.phone, store?.instagram, store?.whatsapp, store?.facebook, store?.youtube, store?.website, store?.card_size]); // eslint-disable-line react-hooks/exhaustive-deps
  const field = (k: "name" | "phone" | "instagram" | "whatsapp" | "facebook" | "youtube" | "website", label: string, ph: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={f[k]} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );
  return (
    <form
      className="space-y-4 rounded-3xl bg-card p-6 shadow-soft"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.name.trim()) { toast.error("Shop name is required"); return; }
        setBusy(true);
        try {
          await save({ data: f });
          await qc.invalidateQueries({ queryKey: ["store"] });
          await qc.invalidateQueries({ queryKey: ["owner-shop"] });
          await qc.invalidateQueries({ queryKey: ["admin"] });
          toast.success("Shop details saved");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="text-xl font-extrabold text-foreground">{store ? "Shop details" : "Create your shop"}</h2>
      <p className="-mt-2 text-sm text-muted-foreground">Shown to customers at the top of the app and on the buttons.</p>
      {field("name", "Shop name", "Maison Rouge Café")}
      {field("phone", "Shop phone number", "98765 43210", "tel")}
      {field("instagram", "Instagram (handle or link)", "@yourshop")}
      {field("whatsapp", "WhatsApp number", "98765 43210", "tel")}
      {field("facebook", "Facebook page link", "facebook.com/yourshop")}
      {field("youtube", "YouTube channel link", "youtube.com/@yourshop")}
      {field("website", "Website link", "yourshop.com")}
      <div className="space-y-1.5">
        <Label htmlFor="card_size">Stamps needed for reward</Label>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" className="h-11 w-11 rounded-full text-lg" onClick={() => setF({ ...f, card_size: Math.max(3, f.card_size - 1) })}>−</Button>
          <Input id="card_size" type="number" min={3} max={30} className="w-20 text-center text-lg font-bold" value={f.card_size} onChange={(e) => setF({ ...f, card_size: Math.min(30, Math.max(3, Number(e.target.value) || 3)) })} />
          <Button type="button" variant="outline" className="h-11 w-11 rounded-full text-lg" onClick={() => setF({ ...f, card_size: Math.min(30, f.card_size + 1) })}>+</Button>
        </div>
        <p className="text-xs text-muted-foreground">Between 3 and 30 stamps per card.</p>
      </div>
      <Button disabled={busy} className="h-11 w-full rounded-full">{busy ? "Saving…" : "Save details"}</Button>
    </form>
  );
}
