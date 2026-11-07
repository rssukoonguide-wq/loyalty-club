import { beforeEach, expect, it } from "vitest";
import { clearMe, loadMe, saveMe } from "./customer-store";
beforeEach(() => localStorage.clear());
it("keeps the same customer's shop memberships separate", () => {
  saveMe({ fullName: "Customer A", phone: "9876500000" }, "shop-a");
  expect(loadMe("shop-b")).toBeNull();
  saveMe({ fullName: "Customer B", phone: "9876500000" }, "shop-b");
  clearMe("shop-a");
  expect(loadMe("shop-a")).toBeNull();
  expect(loadMe("shop-b")?.fullName).toBe("Customer B");
});