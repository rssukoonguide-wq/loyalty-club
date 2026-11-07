import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, getOwnerShop } from "@/lib/loyalty.functions";

export function useOwner() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_, s) => { setSession(s); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  const fetchAccess = useServerFn(getMyAccess);
  const access = useQuery({ queryKey: ["owner-access", session?.user.id], queryFn: () => fetchAccess(), enabled: !!session });
  const fetch = useServerFn(getOwnerShop);
  const hasAccess = !!access.data?.hasAccess;
  const query = useQuery({ queryKey: ["owner-shop", session?.user.id], queryFn: () => fetch(), enabled: !!session && hasAccess });
  return {
    session, ready,
    hasAccess, isSuperAdmin: !!access.data?.isSuperAdmin, accessLoading: !!session && access.isLoading,
    shop: session && hasAccess ? query.data : null,
    isLoading: !!session && (access.isLoading || (hasAccess && query.isLoading)),
  };
}
