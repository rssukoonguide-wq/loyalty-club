import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn(), query: { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), order: vi.fn(), upsert: vi.fn(), single: vi.fn(), insert: vi.fn() } }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => {
  let validate = (data: unknown) => data;
  const builder = { middleware: () => builder, inputValidator: (fn: typeof validate) => { validate = fn; return builder; }, handler: (fn: (args: unknown) => unknown) => (args: { data?: unknown; context?: unknown }) => fn({ ...args, data: args.data === undefined ? undefined : validate(args.data) }) };
  return builder;
} }));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: mocks.from, rpc: mocks.rpc } }));
import { getCard, collectStamp, adminCustomers } from "./loyalty.functions";
const shopA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const shopB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.from.mockReturnValue(mocks.query);
  mocks.rpc.mockResolvedValue({ data: true });
  for (const method of ["select", "eq", "upsert", "insert"] as const) mocks.query[method].mockReturnValue(mocks.query);
});
it("reads a customer's card only within the selected shop", async () => {
  mocks.query.maybeSingle.mockResolvedValue({ data: { id: "customer-a" }, error: null });
  mocks.query.order.mockResolvedValue({ data: [], error: null });
  await getCard({ data: { phone: "9876500000", shopId: shopB } });
  expect(mocks.query.eq).toHaveBeenCalledWith("shop_id", shopB);
  expect(mocks.query.eq).not.toHaveBeenCalledWith("shop_id", shopA);
});
it("records the scanned shop on both customer membership and stamp", async () => {
  mocks.query.maybeSingle.mockResolvedValue({ data: { id: shopA } });
  mocks.query.single.mockResolvedValue({ data: { id: "customer-a" }, error: null });
  mocks.query.insert.mockResolvedValue({ error: null });
  mocks.query.eq.mockImplementation((column: string) => column === "customer_id" ? Promise.resolve({ count: 1, error: null }) : mocks.query);
  await collectStamp({ data: { fullName: "Customer A", phone: "9876500000", shopId: shopA } });
  expect(mocks.query.upsert).toHaveBeenCalledWith({ shop_id: shopA, phone: "9876500000", full_name: "Customer A" }, { onConflict: "shop_id,phone" });
  expect(mocks.query.insert).toHaveBeenCalledWith(expect.objectContaining({ shop_id: shopA, customer_id: "customer-a" }));
});
it("resolves the dashboard's shop from the authenticated owner, not a client shop ID", async () => {
  mocks.query.maybeSingle.mockResolvedValue({ data: { id: shopB }, error: null });
  mocks.query.order.mockResolvedValue({ data: [], error: null });
  const invoke = adminCustomers as unknown as (args: { context: { userId: string; supabase: { from: typeof mocks.from; rpc: typeof mocks.rpc } } }) => Promise<unknown>;
  await invoke({ context: { userId: "owner-b", supabase: { from: mocks.from, rpc: mocks.rpc } } });
  expect(mocks.query.eq).toHaveBeenCalledWith("owner_id", "owner-b");
  expect(mocks.query.eq).toHaveBeenCalledWith("shop_id", shopB);
  expect(mocks.query.eq).not.toHaveBeenCalledWith("shop_id", shopA);
});
it("blocks stamps at a shop whose owner access was removed", async () => {
  mocks.query.maybeSingle.mockResolvedValue({ data: { id: shopA, owner_id: "owner-a" } });
  mocks.rpc.mockResolvedValue({ data: false });
  await expect(collectStamp({ data: { fullName: "Customer A", phone: "9876500000", shopId: shopA } })).rejects.toThrow(/paused/);
  expect(mocks.query.insert).not.toHaveBeenCalled();
});
it("blocks the owner dashboard for a user without access", async () => {
  mocks.rpc.mockResolvedValue({ data: false });
  const invoke = adminCustomers as unknown as (args: { context: unknown }) => Promise<unknown>;
  await expect(invoke({ context: { userId: "stranger", supabase: { from: mocks.from, rpc: mocks.rpc } } })).rejects.toThrow(/No owner access/);
});
