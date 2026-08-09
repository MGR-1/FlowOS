import { describe, it, expect, vi, beforeEach } from "vitest";

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

const EMPTY: QueryResult = { data: null, error: null };

const queued: QueryResult[] = [];
const calls: string[] = [];

function nextResult(): QueryResult {
  return queued.shift() ?? EMPTY;
}

function makeBuilder() {
  const record = (name: string) => {
    calls.push(name);
    return builder;
  };

  const builder = {
    select: () => record("select"),
    insert: () => record("insert"),
    update: () => record("update"),
    delete: () => record("delete"),
    eq: () => record("eq"),
    order: () => record("order"),
    maybeSingle: () => {
      calls.push("maybeSingle");
      return Promise.resolve(nextResult());
    },
    then: (
      resolve: (v: QueryResult) => unknown,
      reject?: (e: unknown) => unknown
    ) => Promise.resolve(nextResult()).then(resolve, reject),
  };

  return builder;
}

const insertPayloads: unknown[] = [];
const from = vi.fn(() => {
  const builder = makeBuilder();
  const originalInsert = builder.insert;
  builder.insert = ((payload: unknown) => {
    insertPayloads.push(payload);
    return originalInsert();
  }) as typeof builder.insert;
  return builder;
});

vi.mock("./client", () => ({ getFlowOSClient: () => ({ from }) }));

import {
  saveWeekIntention,
  getWeekIntention,
  listRoles,
  clampQ2Target,
  capRoleIds,
} from "./weekIntentions";

const NOW = new Date("2026-08-06T09:00:00.000Z"); // ISO week 32 of 2026

beforeEach(() => {
  queued.length = 0;
  calls.length = 0;
  insertPayloads.length = 0;
  from.mockClear();
});

describe("clampQ2Target", () => {
  it("clamps below the 40% floor", () => expect(clampQ2Target(12)).toBe(40));
  it("clamps above the 80% ceiling", () => expect(clampQ2Target(95)).toBe(80));
  it("leaves an in-range value alone", () => expect(clampQ2Target(60)).toBe(60));
  it("rounds a fractional value", () => expect(clampQ2Target(60.6)).toBe(61));
});

describe("capRoleIds", () => {
  it("keeps at most three roles", () => {
    expect(capRoleIds(["a", "b", "c", "d"])).toEqual(["a", "b", "c"]);
  });

  it("drops duplicates", () => {
    expect(capRoleIds(["a", "a", "b"])).toEqual(["a", "b"]);
  });

  it("handles an empty selection", () => {
    expect(capRoleIds([])).toEqual([]);
  });
});

describe("saveWeekIntention", () => {
  it("inserts with the current ISO week and year", async () => {
    queued.push(EMPTY); // maybeSingle -> no existing row

    const result = await saveWeekIntention(
      "user-1",
      { q2TargetPct: 65, roleIds: ["r1", "r2"], intention: "Protect mornings" },
      NOW
    );

    expect(result.ok).toBe(true);
    expect(insertPayloads[0]).toEqual({
      user_id: "user-1",
      week_number: 32,
      year: 2026,
      q2_target_pct: 65,
      role_intentions_json: ["r1", "r2"],
      one_sentence_intention: "Protect mornings",
    });
  });

  it("updates instead of inserting when this week already has a row", async () => {
    queued.push({ data: { id: "wi-1" }, error: null });

    await saveWeekIntention(
      "user-1",
      { q2TargetPct: 70, roleIds: [], intention: "Fewer meetings" },
      NOW
    );

    expect(calls).toContain("update");
    expect(calls).not.toContain("insert");
  });

  it("clamps and caps before writing", async () => {
    queued.push(EMPTY);

    await saveWeekIntention(
      "user-1",
      { q2TargetPct: 200, roleIds: ["a", "b", "c", "d"], intention: "  x  " },
      NOW
    );

    expect(insertPayloads[0]).toMatchObject({
      q2_target_pct: 80,
      role_intentions_json: ["a", "b", "c"],
      one_sentence_intention: "x",
    });
  });

  it("returns an error result rather than throwing", async () => {
    queued.push(EMPTY); // maybeSingle
    queued.push({
      data: null,
      error: { message: "new row violates row-level security policy" },
    });

    const result = await saveWeekIntention(
      "user-1",
      { q2TargetPct: 60, roleIds: [], intention: "x" },
      NOW
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/row-level security/);
  });

  it("never throws when the client blows up", async () => {
    from.mockImplementationOnce(() => {
      throw new Error("Network request failed");
    });

    const result = await saveWeekIntention(
      "user-1",
      { q2TargetPct: 60, roleIds: [], intention: "x" },
      NOW
    );

    expect(result.ok).toBe(false);
  });
});

describe("getWeekIntention", () => {
  it("returns null when this week has no intention yet", async () => {
    queued.push(EMPTY);
    expect(await getWeekIntention("user-1", NOW)).toEqual({
      ok: true,
      data: null,
    });
  });

  it("returns the row when one exists", async () => {
    const row = {
      user_id: "user-1",
      week_number: 32,
      year: 2026,
      q2_target_pct: 60,
      role_intentions_json: ["r1"],
      one_sentence_intention: "Protect mornings",
    };
    queued.push({ data: row, error: null });

    const result = await getWeekIntention("user-1", NOW);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(row);
  });
});

describe("listRoles", () => {
  it("returns the user's active roles", async () => {
    queued.push({
      data: [
        { id: "r1", name: "Build" },
        { id: "r2", name: "Sell" },
      ],
      error: null,
    });

    const result = await listRoles("user-1");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(2);
  });

  it("returns an empty list rather than null when there are no roles", async () => {
    queued.push(EMPTY);
    const result = await listRoles("user-1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual([]);
  });
});
