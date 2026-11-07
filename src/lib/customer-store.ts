export type Me = { fullName: string; phone: string };
const KEY = "loyalty-me";

export function loadMe(shopId?: string): Me | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(shopId ? `${KEY}:${shopId}` : KEY) || (shopId === "11111111-1111-4111-8111-111111111111" ? localStorage.getItem(KEY) : null) || "null");
  } catch {
    return null;
  }
}
export function saveMe(me: Me, shopId?: string) {
  localStorage.setItem(shopId ? `${KEY}:${shopId}` : KEY, JSON.stringify(me));
}
export function clearMe(shopId?: string) {
  localStorage.removeItem(shopId ? `${KEY}:${shopId}` : KEY);
  if (shopId === "11111111-1111-4111-8111-111111111111") localStorage.removeItem(KEY);
}
