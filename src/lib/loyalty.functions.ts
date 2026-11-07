import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizePhone, storeDay } from "./loyalty";
import { LEGACY_SHOP_ID } from "./store-links";

const shopIdSchema = z.string().uuid().default(LEGACY_SHOP_ID);
const phoneSchema = z.string().trim().transform(normalizePhone).refine(p => /^\+?\d{8,15}$/.test(p), "Enter a valid mobile number");
const settingsSchema = z.object({ name: z.string().trim().min(1).max(80), phone: z.string().trim().max(20), instagram: z.string().trim().max(200), whatsapp: z.string().trim().max(20), facebook: z.string().trim().max(300).default(""), youtube: z.string().trim().max(300).default(""), website: z.string().trim().max(300).default(""), card_size: z.coerce.number().int().min(3).max(30).default(10) });
export type StoreSettings = z.infer<typeof settingsSchema>;
export type Shop = StoreSettings & { id: string };

export const getStoreSettings = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ shopId: shopIdSchema }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: shop, error } = await supabaseAdmin.from("shops").select("id, name, phone, instagram, whatsapp, facebook, youtube, website, card_size").eq("id", data.shopId).maybeSingle();
    if (error) throw new Error("Could not load this shop");
    return shop;
  });

export const getOwnerShop = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: ok } = await context.supabase.rpc("has_owner_access", { _user_id: context.userId });
  if (!ok) throw new Error("No owner access");
  const { data, error } = await context.supabase.from("shops").select("id, name, phone, instagram, whatsapp, facebook, youtube, website, card_size").eq("owner_id", context.userId).maybeSingle();
  if (error) throw new Error("Could not load your shop");
  return data;
});

export const saveStoreSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => settingsSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("has_owner_access", { _user_id: context.userId });
    if (!ok) throw new Error("No owner access");
    const { data: shop, error } = await context.supabase.from("shops").upsert({ owner_id: context.userId, ...data }, { onConflict: "owner_id" }).select("id, name, phone, instagram, whatsapp, facebook, youtube, website, card_size").single();
    if (error) throw new Error("Could not save your shop");
    return shop;
  });

export const getCard = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ phone: phoneSchema, shopId: shopIdSchema }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: c, error } = await supabaseAdmin.from("shop_customers").select("id").eq("shop_id", data.shopId).eq("phone", data.phone).maybeSingle();
    if (error) throw new Error("Could not load your card");
    if (!c) return { total: 0, stampedToday: false, lastScan: null as string | null };
    const { data: rows, error: stampsError } = await supabaseAdmin.from("shop_stamps").select("stamp_date, created_at").eq("shop_id", data.shopId).eq("customer_id", c.id).order("created_at", { ascending: false });
    if (stampsError) throw new Error("Could not load your stamps");
    return { total: rows.length, stampedToday: rows.some(r => r.stamp_date === storeDay()), lastScan: rows[0]?.created_at ?? null };
  });

export const collectStamp = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ shopId: shopIdSchema, fullName: z.string().trim().min(2).max(100), phone: phoneSchema }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: shop } = await supabaseAdmin.from("shops").select("id, owner_id").eq("id", data.shopId).maybeSingle();
    if (!shop) throw new Error("Shop not found. Scan the QR at your shop.");
    const { data: active } = await supabaseAdmin.rpc("has_owner_access", { _user_id: shop.owner_id });
    if (!active) throw new Error("This shop's loyalty card is currently paused.");
    const { data: c, error } = await supabaseAdmin.from("shop_customers").upsert({ shop_id: shop.id, phone: data.phone, full_name: data.fullName }, { onConflict: "shop_id,phone" }).select("id").single();
    if (error || !c) throw new Error("Could not save your details");
    const { error: stampError } = await supabaseAdmin.from("shop_stamps").insert({ shop_id: shop.id, customer_id: c.id, stamp_date: storeDay() });
    if (stampError && stampError.code !== "23505") throw new Error("Could not add stamp");
    const { count, error: countError } = await supabaseAdmin.from("shop_stamps").select("id", { count: "exact", head: true }).eq("shop_id", shop.id).eq("customer_id", c.id);
    if (countError) throw new Error("Could not load your stamp total");
    return { status: stampError ? "already" as const : "added" as const, total: count ?? 0 };
  });

export const adminCustomers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: ok } = await context.supabase.rpc("has_owner_access", { _user_id: context.userId });
  if (!ok) throw new Error("No owner access");
  const { data: shop, error } = await context.supabase.from("shops").select("id").eq("owner_id", context.userId).maybeSingle();
  if (error) throw new Error("Could not load your shop");
  if (!shop) return { isAdmin: true, customers: [] };
  const { data: customers, error: customerError } = await context.supabase.from("shop_customers").select("id, full_name, phone, created_at, shop_stamps(created_at)").eq("shop_id", shop.id).order("created_at", { ascending: false });
  if (customerError) throw new Error("Could not load your customers");
  return { isAdmin: true, customers: (customers ?? []).map(c => { const times = c.shop_stamps.map(s => s.created_at).sort(); return { id: c.id, name: c.full_name, phone: c.phone, total: times.length, lastScan: times[times.length - 1] ?? null }; }) };
});

const emailSchema = z.string().trim().toLowerCase().email().max(200);

async function isSuperAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return !!data;
}

export const getMyAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data } = await context.supabase.rpc("has_owner_access", { _user_id: context.userId });
  return { hasAccess: !!data, isSuperAdmin: await isSuperAdmin(context.supabase, context.userId) };
});

export const listOwnerAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  if (!(await isSuperAdmin(context.supabase, context.userId))) throw new Error("Forbidden");
  const { data, error } = await context.supabase.from("owner_access").select("email, created_at").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load access list");
  return data;
});

export const grantOwnerAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ email: emailSchema }).parse(i))
  .handler(async ({ data, context }) => {
    if (!(await isSuperAdmin(context.supabase, context.userId))) throw new Error("Forbidden");
    const { error } = await context.supabase.from("owner_access").upsert({ email: data.email }, { onConflict: "email" });
    if (error) throw new Error("Could not give access");
    return { ok: true };
  });

export const revokeOwnerAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ email: emailSchema }).parse(i))
  .handler(async ({ data, context }) => {
    if (!(await isSuperAdmin(context.supabase, context.userId))) throw new Error("Forbidden");
    const { error } = await context.supabase.from("owner_access").delete().eq("email", data.email);
    if (error) throw new Error("Could not remove access");
    return { ok: true };
  });
