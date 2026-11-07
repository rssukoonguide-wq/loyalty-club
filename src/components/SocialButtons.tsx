import { Instagram, MessageCircle, Facebook, Youtube, Globe } from "lucide-react";
import { instagramUrl, whatsappUrl, webUrl, siteUrl } from "@/lib/loyalty";
import { useStore } from "@/hooks/use-store";

export function SocialButtons() {
  const store = useStore();
  const links = [
    { href: instagramUrl(store.instagram), label: "Instagram", Icon: Instagram },
    { href: webUrl(store.facebook ?? "", "facebook.com"), label: "Facebook", Icon: Facebook },
    { href: webUrl(store.youtube ?? "", "youtube.com"), label: "YouTube", Icon: Youtube },
    { href: siteUrl(store.website ?? ""), label: "Website", Icon: Globe },
    { href: whatsappUrl(store.whatsapp), label: "WhatsApp", Icon: MessageCircle },
  ].filter(l => l.href);
  if (!links.length) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-sm font-semibold text-muted-foreground">Follow us</p>
      <div className="grid grid-cols-2 gap-3 [&>a:last-child:nth-child(odd)]:col-span-2">
        {links.map(({ href, label, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-card p-4 font-semibold text-primary shadow-soft transition-transform active:scale-95">
            <Icon className="h-5 w-5" /> {label}
          </a>
        ))}
      </div>
    </div>
  );
}
