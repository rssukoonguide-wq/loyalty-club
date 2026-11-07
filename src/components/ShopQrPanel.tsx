import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shopScanUrl } from "@/lib/store-links";
import type { Shop } from "@/lib/loyalty.functions";

export function ShopQrPanel({ store }: { store: Shop }) {
  const ref = useRef<HTMLDivElement>(null);
  function download() {
    const qr = ref.current?.querySelector("canvas");
    if (!qr) return;
    // Printable poster: shop name, QR, phone.
    const W = 1000, H = 1300;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    if (!g) return;
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--wine").trim() || "maroon"; g.fillRect(0, 0, W, H);
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "white"; g.textAlign = "center";
    g.font = "bold 64px Fraunces, serif"; g.fillText(store.name || "Scan & collect", W / 2, 140, 900);
    g.font = "600 34px Manrope, sans-serif"; g.fillText("Scan to collect your stamp", W / 2, 200);
    g.fillRect(150, 260, 700, 700);
    g.drawImage(qr, 175, 285, 650, 650);
    if (store.phone) { g.font = "bold 44px Manrope, sans-serif"; g.fillText(`📞 ${store.phone}`, W / 2, 1060); }
    g.font = "600 30px Manrope, sans-serif"; g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "gold";
    g.fillText("Collect 10 stamps • Get a free reward", W / 2, 1160);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `shop-${store.id}-qr.png`;
    a.click();
  }
  return (
    <div className="bg-loyalty-card flex flex-col items-center rounded-3xl p-6 text-center text-primary-foreground">
      <p className="text-xs uppercase tracking-[0.2em] opacity-70">Scan to collect your stamp</p>
      <h2 className="mt-1 text-2xl font-extrabold">{store.name}</h2>
      <div ref={ref} className="mt-4 rounded-2xl bg-card p-3">
        <QRCodeCanvas value={shopScanUrl(store.id)} size={600} fgColor="#5a1220" marginSize={4} style={{ width: 200, height: 200 }} />
      </div>
      {store.phone && <p className="mt-3 font-semibold">{store.phone}</p>}
      <Button variant="secondary" className="mt-4 rounded-full" onClick={download}><Download className="h-4 w-4" /> Download QR poster</Button>
      <p className="mt-2 text-xs opacity-70">Print it and keep it at your counter.</p>
    </div>
  );
}

