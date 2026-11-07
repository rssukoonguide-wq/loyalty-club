import { Link } from "@tanstack/react-router";
import { Home, Compass, Gift, User } from "lucide-react";
import type { ReactNode } from "react";
import { useShop } from "@/hooks/shop-context";
import { useStore } from "@/hooks/use-store";
import type { Shop } from "@/lib/loyalty.functions";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children, ownerShop }: { children: ReactNode; ownerShop?: Shop | undefined }) {
  const activeStore = useStore();
  const store = ownerShop ?? activeStore;
  const { shopId } = useShop();
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-28">
      <header className="px-6 pt-8 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Loyalty Club</p>
        <h1 className="min-h-8 text-2xl font-extrabold text-foreground">{store.name}</h1>
      </header>
      <main className="px-5">{children}</main>
      <footer className="px-5 pt-8 text-center">
        <Link to="/terms" search={{ shop: shopId }} className="text-xs font-semibold text-muted-foreground underline underline-offset-4">
          Terms &amp; Conditions
        </Link>
      </footer>
      <nav className="fixed inset-x-0 bottom-4 z-20 mx-auto w-[calc(100%-2rem)] max-w-sm rounded-full bg-wine p-2 shadow-soft">
        <ul className="flex justify-between">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                search={{ shop: shopId }}
                activeOptions={{ exact: true }}
                className="flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[11px] font-semibold text-primary-foreground/60 transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
