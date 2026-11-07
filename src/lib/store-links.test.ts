import { describe, expect, it } from "vitest";
import { CUSTOMER_SCAN_URL, shopScanUrl } from "./store-links";

describe("customer QR destination", () => {
  it("opens the public published scan page instead of the editor origin", () => {
    expect(CUSTOMER_SCAN_URL).toBe("https://loyalty-club.lovable.app/scan");
  });
  it("gives different shops different printable QR links", () => {
    expect(shopScanUrl("shop-a")).toBe("https://loyalty-club.lovable.app/scan?shop=shop-a");
    expect(shopScanUrl("shop-b")).not.toBe(shopScanUrl("shop-a"));
  });
});