import { createFileRoute } from "@tanstack/react-router";
import { Gift, CalendarDays, QrCode } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SocialButtons } from "@/components/SocialButtons";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "How It Works – Loyalty Club" },
      { name: "description", content: "Scan, collect one stamp a day, and unlock rewards." },
      { property: "og:title", content: "How It Works – Loyalty Club" },
      { property: "og:description", content: "Scan, collect, get rewarded." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explore,
});

const steps = [
  { icon: QrCode, title: "Scan the store QR", text: "Find it at the counter on every visit." },
  { icon: CalendarDays, title: "One stamp per day", text: "Each visit day earns you one stamp." },
  { icon: Gift, title: "10 stamps = reward", text: "Complete your card to unlock a free gift." },
];

function Explore() {
  return (
    <AppShell>
      <h2 className="mb-4 text-xl font-extrabold text-foreground">How it works</h2>
      <div className="space-y-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="animate-rise flex gap-4 rounded-2xl bg-card p-4 shadow-soft" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-xl font-extrabold text-foreground">Stay connected</h2>
      <SocialButtons />
    </AppShell>
  );
}
