import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Minimal PostgREST query-builder double -----------------------------
// Every builder method returns the builder, and the builder is thenable, so
// both `await db.from(t).insert(row)` and
// `await db.from(t).select().eq().maybeSingle()` resolve.

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

const EMPTY: QueryResult = { data: null, error: null };

/** table -> queued results, consumed in order; falls back to EMPTY. */
const queued: Record<string, QueryResult[]> = {};
/** table -> list of method names called on it, in order. */
const calls: Record<string, string[]> = {};

function nextResult(table: string): QueryResult {
  return queued[table]?.shift() ?? EMPTY;
}

function makeBuilder(table: string) {
  calls[table] = calls[table] ?? [];

  const record = (name: string) => {
    calls[table].push(name);
    return builder;
  };

  const builder = {
    select: () => record("select"),
    insert: () => record("insert"),
    update: () => record("update"),
    upsert: () => record("upsert"),
    delete: () => record("delete"),
    eq: () => record("eq"),
    order: () => record("order"),
    maybeSingle: () => {
      calls[table].push("maybeSingle");
      return Promise.resolve(nextResult(table));
    },
    then: (
      resolve: (v: QueryResult) => unknown,
      reject?: (e: unknown) => unknown
    ) => Promise.resolve(nextResult(table)).then(resolve, reject),
  };

  return builder;
}

const from = vi.fn((table: string) => makeBuilder(table));

vi.mock("./client", () => ({ getFlowOSClient: () => ({ from }) }));

import { syncOnboarding } from "./onboarding";
import {
  INITIAL_WIZARD_STATE,
  scoreUrgencyIndex,
  type WizardState,
} from "../models/onboarding";

const NOW = new Date("2026-08-06T09:00:00.000Z"); // ISO week 32 of 2026

const fullState: WizardState = {
  ...INITIAL_WIZARD_STATE,
  chronotype: "lion",
  planningDay: 5,
  mission: "Build things that matter",
  roles: [
    { monogram: "B", name: "Build", color: "#2563EB" },
    { monogram: "S", name: "Sell", color: "#0D9488" },
  ],
  firstWeekGoal: { roleIndex: 0, text: "Ship persistence" },
  urgencyResult: scoreUrgencyIndex(new Array(16).fill(2)),
};

beforeEach(() => {
  for (const k of Object.keys(queued)) delete queued[k];
  for (const k of Object.keys(calls)) delete calls[k];
  from.mockClear();
});

describe("syncOnboarding", () => {
  it("writes to every table for a fully completed wizard", async () => {
    queued["roles"] = [
      EMPTY, // delete
      { data: [{ id: "role-1" }, { id: "role-2" }], error: null }, // insert
    ];

    const result = await syncOnboarding("user-1", fullState, NOW);

    expect(result.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("chronotype_profiles");
    expect(from).toHaveBeenCalledWith("user_profiles");
    expect(from).toHaveBeenCalledWith("urgency_index_assessments");
    expect(from).toHaveBeenCalledWith("missions");
    expect(from).toHaveBeenCalledWith("roles");
    expect(from).toHaveBeenCalledWith("goals");
  });

  it("inserts a new chronotype row when none exists", async () => {
    await syncOnboarding("user-1", fullState, NOW);
    expect(calls["chronotype_profiles"]).toContain("insert");
    expect(calls["chronotype_profiles"]).not.toContain("update");
  });

  it("updates instead of inserting when a chronotype row already exists", async () => {
    queued["chronotype_profiles"] = [{ data: { id: "cp-1" }, error: null }];

    await syncOnboarding("user-1", fullState, NOW);

    expect(calls["chronotype_profiles"]).toContain("update");
    expect(calls["chronotype_profiles"]).not.toContain("insert");
  });

  it("deletes existing roles before inserting, so a retry cannot duplicate them", async () => {
    queued["roles"] = [
      EMPTY,
      { data: [{ id: "role-1" }, { id: "role-2" }], error: null },
    ];

    await syncOnboarding("user-1", fullState, NOW);

    const roleCalls = calls["roles"];
    expect(roleCalls).toContain("delete");
    expect(roleCalls).toContain("insert");
    expect(roleCalls.indexOf("delete")).toBeLessThan(roleCalls.indexOf("insert"));
  });

  it("always updates user_profiles rather than inserting, since the signup trigger creates it", async () => {
    await syncOnboarding("user-1", fullState, NOW);
    expect(calls["user_profiles"]).toContain("update");
    expect(calls["user_profiles"]).not.toContain("insert");
  });

  it("skips the urgency table when the user skipped the assessment", async () => {
    await syncOnboarding("user-1", { ...fullState, urgencyResult: null }, NOW);
    expect(from).not.toHaveBeenCalledWith("urgency_index_assessments");
  });

  it("skips missions when no mission was written", async () => {
    await syncOnboarding("user-1", { ...fullState, mission: "   " }, NOW);
    expect(from).not.toHaveBeenCalledWith("missions");
  });

  it("skips goals when the first-week goal is blank", async () => {
    queued["roles"] = [EMPTY, { data: [{ id: "role-1" }], error: null }];

    await syncOnboarding(
      "user-1",
      { ...fullState, firstWeekGoal: { roleIndex: 0, text: "" } },
      NOW
    );

    expect(from).not.toHaveBeenCalledWith("goals");
  });

  it("returns an error result when a write fails, without throwing", async () => {
    queued["user_profiles"] = [
      { data: null, error: { message: "new row violates row-level security policy" } },
    ];

    const result = await syncOnboarding("user-1", fullState, NOW);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/row-level security/);
  });

  it("stops before later writes once one fails", async () => {
    queued["user_profiles"] = [
      { data: null, error: { message: "permission denied" } },
    ];

    await syncOnboarding("user-1", fullState, NOW);

    expect(from).not.toHaveBeenCalledWith("roles");
  });

  it("never throws when the client itself blows up", async () => {
    from.mockImplementationOnce(() => {
      throw new Error("Network request failed");
    });

    const result = await syncOnboarding("user-1", fullState, NOW);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Network request failed/);
  });

  it("succeeds on a minimal wizard where everything optional was skipped", async () => {
    const minimal: WizardState = {
      ...INITIAL_WIZARD_STATE,
      chronotype: null,
      mission: "",
      roles: [],
      urgencyResult: null,
    };

    const result = await syncOnboarding("user-1", minimal, NOW);

    expect(result.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("user_profiles");
    expect(from).not.toHaveBeenCalledWith("chronotype_profiles");
  });
});
