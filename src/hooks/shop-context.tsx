import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { LEGACY_SHOP_ID } from "@/lib/store-links";

const ShopContext = createContext({ shopId: LEGACY_SHOP_ID, ready: false });
export function ShopProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState({ shopId: LEGACY_SHOP_ID, ready: false });
  useEffect(() => {
    const requested = new URLSearchParams(location.searchStr).get("shop");
    const shopId = requested || localStorage.getItem("loyalty-shop") || LEGACY_SHOP_ID;
    if (requested) localStorage.setItem("loyalty-shop", requested);
    setState({ shopId, ready: true });
  }, [location.searchStr]);
  return <ShopContext.Provider value={state}>{children}</ShopContext.Provider>;
}
export function useShop() { return useContext(ShopContext); }