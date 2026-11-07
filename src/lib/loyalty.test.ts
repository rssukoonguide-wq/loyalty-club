import { describe, it, expect } from "vitest";
import { cardProgress, storeDay } from "./loyalty";

describe("stamp card", () => {
  it("has 10 slots: 3 stamps leaves 7 remaining", () => {
    expect(cardProgress(3)).toMatchObject({ onCard: 3, remaining: 7, rewardUnlocked: false });
  });
  it("unlocks reward at 10 stamps", () => {
    expect(cardProgress(10)).toMatchObject({ onCard: 10, rewardUnlocked: true });
  });
  it("starts a new card on the 11th stamp", () => {
    expect(cardProgress(11)).toMatchObject({ onCard: 1, completedCards: 1, rewardUnlocked: false });
  });
  it("same calendar day in India maps to one date", () => {
    expect(storeDay(new Date("2026-11-01T19:00:00Z"))).toBe("2026-11-02");
    expect(storeDay(new Date("2026-11-01T17:00:00Z"))).toBe("2026-11-01");
  });
});

import { instagramUrl, whatsappUrl } from "./loyalty";
describe("social links", () => {
  it("turns @handle into an Instagram link", () => {
    expect(instagramUrl("@mycafe")).toBe("https://instagram.com/mycafe");
  });
  it("adds India code to a 10-digit WhatsApp number", () => {
    expect(whatsappUrl("98765 43210")).toBe("https://wa.me/919876543210");
  });
});

describe("custom card size", () => {
  it("a 5-stamp card unlocks the reward at 5", () => {
    expect(cardProgress(5, 5)).toMatchObject({ onCard: 5, rewardUnlocked: true });
    expect(cardProgress(6, 5)).toMatchObject({ onCard: 1, completedCards: 1 });
  });
  it("a 15-stamp card leaves 5 remaining after 10", () => {
    expect(cardProgress(10, 15)).toMatchObject({ remaining: 5, rewardUnlocked: false });
  });
});

import { webUrl } from "./loyalty";
describe("facebook/youtube links", () => {
  it("adds https to a pasted Facebook link", () => {
    expect(webUrl("facebook.com/mycafe", "facebook.com")).toBe("https://facebook.com/mycafe");
  });
  it("turns a YouTube handle into a channel link", () => {
    expect(webUrl("@mycafe", "youtube.com")).toBe("https://youtube.com/@mycafe");
  });
});

import { siteUrl } from "./loyalty";
describe("website link", () => {
  it("adds https to a pasted website link", () => {
    expect(siteUrl("mycafe.com/menu")).toBe("https://mycafe.com/menu");
  });
  it("keeps a full website link as it is", () => {
    expect(siteUrl("https://mycafe.com")).toBe("https://mycafe.com");
  });
  it("gives no link for a blank or word-only entry", () => {
    expect(siteUrl("")).toBe("");
    expect(siteUrl("mycafe")).toBe("");
  });
});
