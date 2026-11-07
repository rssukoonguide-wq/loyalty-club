import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Me } from "@/lib/customer-store";

export function JoinForm({ onSubmit, busy, cta = "Collect my stamp" }: { onSubmit: (m: Me) => void; busy?: boolean; cta?: string }) {
  const [fullName, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className="animate-rise space-y-4 rounded-3xl bg-card p-6 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        if (fullName.trim().length < 2) return setErr("Please enter your full name");
        if (!/^\+?\d{8,15}$/.test(phone.replace(/[^\d+]/g, ""))) return setErr("Please enter a valid mobile number");
        setErr("");
        onSubmit({ fullName: fullName.trim(), phone: phone.replace(/[^\d+]/g, "") });
      }}
    >
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Welcome! 👋</h2>
        <p className="text-sm text-muted-foreground">Enter your details to start collecting stamps.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" maxLength={100} value={fullName} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Mobile number</Label>
        <Input id="phone" type="tel" inputMode="tel" maxLength={16} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" disabled={busy} className="h-12 w-full rounded-full text-base">
        {busy ? "Please wait…" : cta}
      </Button>
    </form>
  );
}
