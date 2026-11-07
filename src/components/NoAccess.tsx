import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function NoAccess({ email }: { email?: string | undefined }) {
  return (
    <div className="mx-auto max-w-sm space-y-3 rounded-3xl bg-card p-6 text-center shadow-soft">
      <Lock className="mx-auto h-8 w-8 text-primary" />
      <h2 className="text-xl font-extrabold text-foreground">Owner have access</h2>
      <p className="text-sm text-muted-foreground">Only shop owners approved by the app owner can use this. Contact the app owner to get access{email ? ` for ${email}` : ""}.</p>
      <Button variant="outline" className="rounded-full" onClick={() => supabase.auth.signOut()}>Sign out</Button>
    </div>
  );
}
