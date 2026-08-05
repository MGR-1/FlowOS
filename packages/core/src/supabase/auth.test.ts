import { describe, it, expect, vi, beforeEach } from "vitest";

const signInWithPassword = vi.fn();
const signUpFn = vi.fn();
const signOutFn = vi.fn();
const getUser = vi.fn();

vi.mock("./client", () => ({
  getFlowOSClient: () => ({
    auth: {
      signInWithPassword,
      signUp: signUpFn,
      signOut: signOutFn,
      getUser,
    },
  }),
}));

import { signIn, signUp, signOut, getCurrentUserId } from "./auth";

beforeEach(() => vi.clearAllMocks());

describe("signIn", () => {
  it("returns the user id on success", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const result = await signIn("a@b.com", "pw");
    expect(result).toEqual({ ok: true, data: { userId: "user-1" } });
  });

  it("returns a readable error on bad credentials", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });
    const result = await signIn("a@b.com", "wrong");
    expect(result).toEqual({ ok: false, error: "Invalid login credentials" });
  });

  it("never throws when the network fails", async () => {
    signInWithPassword.mockRejectedValue(new Error("Network request failed"));
    const result = await signIn("a@b.com", "pw");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Network request failed/);
  });
});

describe("signUp", () => {
  it("returns the user id on success", async () => {
    signUpFn.mockResolvedValue({
      data: { user: { id: "user-2" } },
      error: null,
    });
    expect(await signUp("a@b.com", "pw")).toEqual({
      ok: true,
      data: { userId: "user-2" },
    });
  });

  it("errors when confirmation is required and no user comes back", async () => {
    signUpFn.mockResolvedValue({ data: { user: null }, error: null });
    const result = await signUp("a@b.com", "pw");
    expect(result.ok).toBe(false);
  });
});

describe("signOut", () => {
  it("returns ok when the SDK succeeds", async () => {
    signOutFn.mockResolvedValue({ error: null });
    expect((await signOut()).ok).toBe(true);
  });

  it("returns an error result when the SDK fails", async () => {
    signOutFn.mockResolvedValue({ error: { message: "no session" } });
    const result = await signOut();
    expect(result.ok).toBe(false);
  });
});

describe("getCurrentUserId", () => {
  it("returns null when there is no session", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await getCurrentUserId()).toBeNull();
  });

  it("returns the id when signed in", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-3" } }, error: null });
    expect(await getCurrentUserId()).toBe("user-3");
  });

  it("returns null rather than throwing when the client blows up", async () => {
    getUser.mockRejectedValue(new Error("Network request failed"));
    expect(await getCurrentUserId()).toBeNull();
  });
});
