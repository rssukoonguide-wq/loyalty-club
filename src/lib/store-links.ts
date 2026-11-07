// Printed customer QR codes must never point to a private editor/preview origin.
export const CUSTOMER_SCAN_URL = "https://loyalty-club.lovable.app/scan";
export const LEGACY_SHOP_ID = "11111111-1111-4111-8111-111111111111";
export function shopScanUrl(shopId: string) {
  return `${CUSTOMER_SCAN_URL}?shop=${encodeURIComponent(shopId)}`;
}