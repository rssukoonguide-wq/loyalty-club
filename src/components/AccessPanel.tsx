import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grantOwnerAccess, listOwnerAccess, revokeOwnerAccess } from "@/lib/loyalty.functions";

export function AccessPanel() {
  const qc = useQueryClient();
  const list = useServerFn(listOwnerAccess);
  const grant = useServerFn(grantOwnerAccess);
  const revoke = useServerFn(revokeOwnerAccess);
  const [email, setEmail] = useState("");
  const { data = [] } = useQuery({ queryKey: ["owner-access-list"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["owner-access-list"] });
  const add = useMutation({ mutationFn: (e: string) => grant({ data: { email: e } }), onSuccess: () => { setEmail(""); toast.success("Access given"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: (e: string) => revoke({ data: { email: e } }), onSuccess: () => { toast.success("Access removed"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  return (
    <div className="rounded-3xl bg-card p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground"><ShieldCheck className="h-5 w-5 text-primary" /> Admin panel – shop owner access</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add the Gmail of a shop owner who bought the app. Removing access locks their dashboard and pauses stamps at their shop.</p>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (email.trim()) add.mutate(email.trim()); }}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@gmail.com" />
        <Button type="submit" disabled={add.isPending}>Give access</Button>
      </form>
      <ul className="mt-4 divide-y">
        {data.map((a) => (
          <li key={a.email} className="flex items-center justify-between py-2 text-sm">
            <span className="font-semibold text-foreground">{a.email}</span>
            <Button variant="ghost" size="sm" disabled={remove.isPending} onClick={() => remove.mutate(a.email)}><Trash2 className="h-4 w-4" /> Remove</Button>
          </li>
        ))}
        {data.length === 0 && <li className="py-3 text-sm text-muted-foreground">No shop owners added yet.</li>}
      </ul>
    </div>
  );
}
