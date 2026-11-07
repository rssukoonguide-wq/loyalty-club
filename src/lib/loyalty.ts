export const DEFAULT_CARD_SIZE = 10;
export const CARD_SIZE = DEFAULT_CARD_SIZE;
export const MIN_CARD_SIZE = 3;
export const MAX_CARD_SIZE = 30;

/** Build a full Instagram URL from a handle or link. */
export function instagramUrl(v: string) {
  const t = v.trim();
  if (!t) return "";
  if (/^https?:\/\//.test(t)) return t;
  return `https://instagram.com/${t.replace(/^@/, "").replace(/^(www\.)?instagram\.com\//, "")}`;
}

/** WhatsApp chat link; 10-digit Indian numbers get the 91 country code. */
export function whatsappUrl(v: string) {
  let d = v.replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) d = "91" + d;
  return `https://wa.me/${d}`;
}

/** Stamps on the current card (0-10) and completed cards from a lifetime total. */
export function cardProgress(total: number, CARD_SIZE: number = DEFAULT_CARD_SIZE) {
  const completedCards = Math.floor(total / CARD_SIZE);
  let onCard = total % CARD_SIZE;
  // A just-completed card stays full until the next stamp starts a new one.
  if (onCard === 0 && total > 0) onCard = CARD_SIZE;
  return {
    onCard,
    remaining: CARD_SIZE - onCard,
    rewardUnlocked: onCard === CARD_SIZE,
    completedCards,
  };
}

/** Calendar date (YYYY-MM-DD) in India time, used for the 1-stamp-per-day rule. */
export function storeDay(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function normalizePhone(p: string) {
  return p.replace(/[^\d+]/g, "");
}

/** Shop website link; adds https:// when missing. */
export function siteUrl(v: string) {
  const t = v.trim();
  if (!t) return "";
  if (/^https?:\/\//.test(t)) return t;
  return t.includes(".") ? `https://${t}` : "";
}

/** Full link for Facebook/YouTube; adds https:// when missing. */
export function webUrl(v: string, host: string) {
  const t = v.trim();
  if (!t) return "";
  if (/^https?:\/\//.test(t)) return t;
  if (t.includes(".")) return `https://${t}`;
  return `https://${host}/${host.includes("youtube") ? "@" + t.replace(/^@/, "") : t.replace(/^@/, "")}`;
}
