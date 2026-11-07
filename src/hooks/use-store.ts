import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStoreSettings } from "@/lib/loyalty.functions";
import { useShop } from "./shop-context";

export function useStore() {
  const { shopId, ready } = useShop();
  const fetch = useServerFn(getStoreSettings);
  const { data, isLoading } = useQuery({ queryKey: ["store", shopId], queryFn: () => fetch({ data: { shopId } }), enabled: ready, staleTime: 60_000 });
  return { ...(data ?? { name: "Loyalty Club", phone: "", instagram: "", whatsapp: "", facebook: "", youtube: "", website: "", card_size: 10 }), found: !!data, loading: !ready || isLoading };
}
