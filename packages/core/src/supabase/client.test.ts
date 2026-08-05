import { describe, it, expect, beforeEach } from "vitest";
import {
  createFlowOSClient,
  getFlowOSClient,
  resetFlowOSClient,
  type SupabaseAuthStorage,
} from "./client";

const memoryStorage = (): SupabaseAuthStorage => {
  const map = new Map<string, string>();
  return {
    getItem: async (k) => map.get(k) ?? null,
    setItem: async (k, v) => void map.set(k, v),
    removeItem: async (k) => void map.delete(k),
  };
};

const config = {
  url: "http://127.0.0.1:54321",
  anonKey: "test-anon-key",
  storage: memoryStorage(),
};

describe("createFlowOSClient", () => {
  beforeEach(() => resetFlowOSClient());

  it("returns the same instance on repeat calls", () => {
    const a = createFlowOSClient(config);
    const b = createFlowOSClient(config);
    expect(a).toBe(b);
  });

  it("throws a named error when url is missing", () => {
    expect(() => createFlowOSClient({ ...config, url: "" })).toThrow(
      /EXPO_PUBLIC_SUPABASE_URL/
    );
  });

  it("throws a named error when anonKey is missing", () => {
    expect(() => createFlowOSClient({ ...config, anonKey: "" })).toThrow(
      /EXPO_PUBLIC_SUPABASE_ANON_KEY/
    );
  });

  it("getFlowOSClient throws before the client is created", () => {
    expect(() => getFlowOSClient()).toThrow(/createFlowOSClient/);
  });

  it("getFlowOSClient returns the instance after creation", () => {
    const created = createFlowOSClient(config);
    expect(getFlowOSClient()).toBe(created);
  });
});
