// packages/core/src/supabase/integration.test.ts
// Definition of Done: "integration test happy + error path".
//
// Runs against local Supabase, not mocks — this is what proves RLS actually
// accepts our writes and that the idempotency workarounds hold against real
// constraints. Skipped automatically when the stack isn't running, so a
// checkout without Docker still gets a green unit suite.
//
//   npx supabase start
//   npx supabase migration up --local
//   RUN_SUPABASE_INTEGRATION=1 pnpm --filter @flowos/core test

import { describe, it, expect, beforeAll } from "vitest";
import { createFlowOSClient, resetFlowOSClient } from "./client";
import { signUp, signOut, getCurrentUserId } from "./auth";
import { syncOnboarding } from "./onboarding";
import { saveWeekIntention, getWeekIntention, listRoles } from "./weekIntentions";
import {
  INITIAL_WIZARD_STATE,
  scoreUrgencyIndex,
  type WizardState,
} from "../models/onboarding";

declare const process: { env: Record<string, string | undefined> };

// Fixed defaults of the Supabase CLI's local demo stack — the same values
// `supabase start` prints on every machine. Not a credential: this key only
// signs tokens for a throwaway Postgres in local Docker, and the JWT secret
// it is derived from is the CLI's published default. Override via env if you
// point the suite at a different local instance.
const DEFAULT_LOCAL_URL = "http://127.0.0.1:54321";
const DEFAULT_LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9." +
  "CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const URL = process.env.SUPABASE_TEST_URL ?? DEFAULT_LOCAL_URL;
const ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY ?? DEFAULT_LOCAL_ANON_KEY;

// Opt-in: this suite needs `supabase start` running. Without the flag the
// unit suite still runs green on a checkout with no Docker.
const enabled = process.env.RUN_SUPABASE_INTEGRATION === "1";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: async (k: string) => map.get(k) ?? null,
    setItem: async (k: string, v: string) => void map.set(k, v),
    removeItem: async (k: string) => void map.delete(k),
  };
}

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
  urgencyResult: scoreUrgencyIndex([
    4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4,
  ]),
};

describe.skipIf(!enabled)("onboarding persistence against local Supabase", () => {
  let userId: string;
  let db: ReturnType<typeof createFlowOSClient>;

  beforeAll(async () => {
    resetFlowOSClient();
    db = createFlowOSClient({
      url: URL as string,
      anonKey: ANON_KEY as string,
      storage: memoryStorage(),
    });

    const email = `dev-b-${Date.now()}@flowos.test`;
    const created = await signUp(email, "correct-horse-battery");
    if (!created.ok) throw new Error(`signUp failed: ${created.error}`);
    userId = created.data.userId;
  });

  it("signs the user in and exposes their id", async () => {
    expect(await getCurrentUserId()).toBe(userId);
  });

  it("creates the profile row via the signup trigger", async () => {
    const { data } = await db
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    expect(data).not.toBeNull();
  });

  // --- happy path -------------------------------------------------------
  it("writes the completed wizard to every table", async () => {
    const result = await syncOnboarding(userId, fullState, NOW);
    expect(result).toEqual({ ok: true, data: undefined });

    const profile = await db
      .from("user_profiles")
      .select("chronotype, planning_day")
      .eq("user_id", userId)
      .maybeSingle();
    expect(profile.data).toMatchObject({ chronotype: "lion", planning_day: 5 });

    const chronotype = await db
      .from("chronotype_profiles")
      .select("assessed_type, peak_window_start, peak_window_end, data_source")
      .eq("user_id", userId);
    expect(chronotype.data).toHaveLength(1);
    expect(chronotype.data?.[0]).toMatchObject({
      assessed_type: "lion",
      peak_window_start: "08:00:00",
      peak_window_end: "12:00:00",
      data_source: "self_report",
    });

    const urgency = await db
      .from("urgency_index_assessments")
      .select("total_score, profile_type, q1_score, q16_score")
      .eq("user_id", userId);
    expect(urgency.data?.[0]).toMatchObject({
      total_score: 34,
      q1_score: 4,
      q16_score: 4,
    });

    const mission = await db
      .from("missions")
      .select("text")
      .eq("user_id", userId);
    expect(mission.data?.[0]?.text).toBe("Build things that matter");

    const roles = await db
      .from("roles")
      .select("name, order_index")
      .eq("user_id", userId)
      .order("order_index");
    expect(roles.data?.map((r) => r.name)).toEqual(["Build", "Sell"]);

    const goals = await db
      .from("goals")
      .select("text, timeframe, week_number, year, role_id")
      .eq("user_id", userId);
    expect(goals.data?.[0]).toMatchObject({
      text: "Ship persistence",
      timeframe: "week",
      week_number: 32,
      year: 2026,
    });
    // The goal must point at the "Build" role the sync just created.
    expect(goals.data?.[0]?.role_id).toBe(
      (await db.from("roles").select("id").eq("user_id", userId).eq("name", "Build").maybeSingle())
        .data?.id
    );
  });

  // --- idempotency ------------------------------------------------------
  // chronotype_profiles and roles have no unique constraint, so a naive
  // re-run would duplicate. This is the regression test for that workaround.
  it("leaves one row per table when run a second time", async () => {
    const second = await syncOnboarding(userId, fullState, NOW);
    expect(second.ok).toBe(true);

    const chronotype = await db
      .from("chronotype_profiles")
      .select("id")
      .eq("user_id", userId);
    expect(chronotype.data).toHaveLength(1);

    const roles = await db.from("roles").select("id").eq("user_id", userId);
    expect(roles.data).toHaveLength(2);

    const mission = await db.from("missions").select("id").eq("user_id", userId);
    expect(mission.data).toHaveLength(1);
  });

  // --- week intention (US-061) -----------------------------------------
  it("saves and reads back a week intention", async () => {
    const roles = await listRoles(userId);
    expect(roles.ok).toBe(true);
    const roleIds = roles.ok ? roles.data.map((r) => r.id) : [];

    const saved = await saveWeekIntention(
      userId,
      { q2TargetPct: 65, roleIds, intention: "Protect my mornings." },
      NOW
    );
    expect(saved.ok).toBe(true);

    const read = await getWeekIntention(userId, NOW);
    expect(read.ok).toBe(true);
    if (read.ok) {
      expect(read.data).toMatchObject({
        week_number: 32,
        year: 2026,
        one_sentence_intention: "Protect my mornings.",
      });
      expect(Number(read.data?.q2_target_pct)).toBe(65);
    }
  });

  it("updates rather than duplicating when the same week is saved twice", async () => {
    await saveWeekIntention(
      userId,
      { q2TargetPct: 75, roleIds: [], intention: "Fewer meetings." },
      NOW
    );

    const rows = await db
      .from("week_intentions")
      .select("id, one_sentence_intention")
      .eq("user_id", userId)
      .eq("week_number", 32)
      .eq("year", 2026);

    expect(rows.data).toHaveLength(1);
    expect(rows.data?.[0]?.one_sentence_intention).toBe("Fewer meetings.");
  });

  it("clamps an out-of-range Q2 target at the database, not just the UI", async () => {
    await saveWeekIntention(
      userId,
      { q2TargetPct: 999, roleIds: [], intention: "Overshoot." },
      NOW
    );
    const read = await getWeekIntention(userId, NOW);
    if (read.ok) expect(Number(read.data?.q2_target_pct)).toBe(80);
  });

  // --- error path -------------------------------------------------------
  it("returns an error result instead of throwing when RLS rejects the write", async () => {
    await signOut();
    expect(await getCurrentUserId()).toBeNull();

    const result = await syncOnboarding(userId, fullState, NOW);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });

  it("returns an error result from saveWeekIntention with no session", async () => {
    const result = await saveWeekIntention(
      userId,
      { q2TargetPct: 60, roleIds: [], intention: "No session." },
      NOW
    );
    expect(result.ok).toBe(false);
  });
});
