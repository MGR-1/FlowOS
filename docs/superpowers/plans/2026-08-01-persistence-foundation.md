# Persistence Foundation + Week Intention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give FlowOS a working sign-in, persist onboarding results to Supabase, land the repo's first test suite, and ship the Week Intention capture screen (US-061).

**Architecture:** All Supabase access lives in `packages/core/src/supabase/`; no screen imports the client. `core` stays free of native dependencies — the app injects AsyncStorage into the client factory. Onboarding writes batch once at wizard completion and retry on next launch if they fail, using the wizard state already persisted in AsyncStorage. Pure mapping functions are separated from I/O so the bulk of the logic is unit-testable without a database.

**Tech Stack:** TypeScript (strict), Expo Router, React Native, `@supabase/supabase-js` v2, Vitest, local Supabase via Docker.

Design spec: `docs/superpowers/specs/2026-08-01-persistence-foundation-week-intention-design.md`

## Global Constraints

- Supabase queries only in `packages/core/src/supabase/`. No screen imports `@supabase/supabase-js`.
- No `any` types in `packages/core`. `strict: true` is already set in `packages/core/tsconfig.json`.
- `packages/*` must never take a native dependency. AsyncStorage is injected from the app. Violating this reintroduces the documented `PlatformConstants` Metro failure.
- All user-facing strings go through i18next with keys in **both** `en` and `nl` in `packages/core/src/i18n/resources.ts`.
- No hardcoded colors, spacing, or fonts. Import `colors`, `spacing`, `typography` from `@flowos/ui-shared`.
- No schema changes. Do not edit any file in `supabase/migrations/`. Constraint gaps are handled in application code.
- Tests import from module paths (`../supabase/auth`), never from the package index — `packages/core/src/index.ts` re-exports i18n, which pulls React into a Node test environment.
- Coverage target: >80% statements in `packages/core`.
- Node 20 LTS. pnpm workspace — install with `pnpm --filter <pkg> add <dep>`.
- Branch: `feat/persistence-foundation`. Commit after every task.

---

### Task 0: Branch and Vitest setup

**Files:**
- Create: `packages/core/vitest.config.ts`
- Modify: `packages/core/package.json`

**Interfaces:**
- Consumes: nothing
- Produces: `pnpm --filter @flowos/core test` runs Vitest

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feat/persistence-foundation
```

- [ ] **Step 2: Install Vitest**

```bash
pnpm --filter @flowos/core add -D vitest @vitest/coverage-v8
```

- [ ] **Step 3: Create `packages/core/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/supabase/**", "src/models/**"],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
});
```

- [ ] **Step 4: Replace the placeholder test script**

In `packages/core/package.json`, change `"test": "echo \"no tests yet\""` to:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 5: Verify the runner starts**

Run: `pnpm --filter @flowos/core test`
Expected: exits 0 with "No test files found" — the runner is wired, no tests yet.

- [ ] **Step 6: Commit**

```bash
git add packages/core/vitest.config.ts packages/core/package.json pnpm-lock.yaml
git commit -m "chore: add vitest to packages/core"
```

---

### Task 1: Supabase client factory

**Files:**
- Create: `packages/core/src/supabase/client.ts`
- Create: `packages/core/src/supabase/client.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `interface FlowOSClientConfig { url: string; anonKey: string; storage: SupabaseAuthStorage }`
  - `interface SupabaseAuthStorage { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void>; removeItem(k: string): Promise<void> }`
  - `createFlowOSClient(config: FlowOSClientConfig): SupabaseClient`
  - `getFlowOSClient(): SupabaseClient` — throws if not yet created
  - `resetFlowOSClient(): void` — test-only

- [ ] **Step 1: Install the SDK**

```bash
pnpm --filter @flowos/core add @supabase/supabase-js
```

- [ ] **Step 2: Write the failing test**

Create `packages/core/src/supabase/client.test.ts`:

```ts
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
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm --filter @flowos/core test`
Expected: FAIL — `Cannot find module './client'`

- [ ] **Step 4: Implement `packages/core/src/supabase/client.ts`**

```ts
// packages/core/src/supabase/client.ts
// Single Supabase client for the whole app.
//
// Storage is INJECTED rather than imported. AsyncStorage is a native module,
// and packages/* must stay free of native dependencies — see README "Duplicate
// React Native resolution". Injection also lets this be tested under plain Node.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseAuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface FlowOSClientConfig {
  url: string;
  anonKey: string;
  storage: SupabaseAuthStorage;
}

let client: SupabaseClient | null = null;

export function createFlowOSClient(config: FlowOSClientConfig): SupabaseClient {
  if (client) return client;

  if (!config.url) {
    throw new Error(
      "Supabase URL is empty. Set EXPO_PUBLIC_SUPABASE_URL in .env.local."
    );
  }
  if (!config.anonKey) {
    throw new Error(
      "Supabase anon key is empty. Set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  client = createClient(config.url, config.anonKey, {
    auth: {
      storage: config.storage,
      autoRefreshToken: true,
      persistSession: true,
      // React Native has no URL bar to parse a session out of.
      detectSessionInUrl: false,
    },
  });

  return client;
}

export function getFlowOSClient(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase client not initialised. Call createFlowOSClient() at app start."
    );
  }
  return client;
}

/** Test-only. Clears the singleton between test cases. */
export function resetFlowOSClient(): void {
  client = null;
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @flowos/core test`
Expected: 5 passing.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/supabase/ packages/core/package.json pnpm-lock.yaml
git commit -m "feat(core): add Supabase client factory with injected storage"
```

---

### Task 2: Result type and auth wrappers

**Files:**
- Create: `packages/core/src/supabase/result.ts`
- Create: `packages/core/src/supabase/auth.ts`
- Create: `packages/core/src/supabase/auth.test.ts`

**Interfaces:**
- Consumes: `getFlowOSClient` from Task 1
- Produces:
  - `type Result<T = void> = { ok: true; data: T } | { ok: false; error: string }`
  - `ok<T>(data: T): Result<T>` / `err(error: string): Result<never>`
  - `signUp(email: string, password: string): Promise<Result<{ userId: string }>>`
  - `signIn(email: string, password: string): Promise<Result<{ userId: string }>>`
  - `signOut(): Promise<Result>`
  - `getCurrentUserId(): Promise<string | null>`

- [ ] **Step 1: Create `packages/core/src/supabase/result.ts`**

```ts
// packages/core/src/supabase/result.ts
// Every data-layer call returns a Result instead of throwing, so screens never
// need try/catch and an unhandled rejection can't take down the UI.

export type Result<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok(): Result<void>;
export function ok<T>(data: T): Result<T>;
export function ok<T>(data?: T): Result<T | void> {
  return { ok: true, data: data as T };
}

export function err(error: string): Result<never> {
  return { ok: false, error };
}
```

- [ ] **Step 2: Write the failing test**

Create `packages/core/src/supabase/auth.test.ts`:

```ts
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
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm --filter @flowos/core test auth`
Expected: FAIL — `Cannot find module './auth'`

- [ ] **Step 4: Implement `packages/core/src/supabase/auth.ts`**

```ts
// packages/core/src/supabase/auth.ts
// Thin typed wrappers over Supabase Auth. Email + password: no deep linking,
// which keeps the team's Expo Go QR workflow working (design spec §3).

import { getFlowOSClient } from "./client";
import { ok, err, type Result } from "./result";

function message(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return fallback;
}

export async function signUp(
  email: string,
  password: string
): Promise<Result<{ userId: string }>> {
  try {
    const { data, error } = await getFlowOSClient().auth.signUp({
      email,
      password,
    });
    if (error) return err(message(error, "Could not create the account."));
    if (!data.user) {
      return err("Account created but no session returned. Check your email to confirm, then sign in.");
    }
    return ok({ userId: data.user.id });
  } catch (e) {
    return err(message(e, "Could not create the account."));
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<Result<{ userId: string }>> {
  try {
    const { data, error } = await getFlowOSClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) return err(message(error, "Could not sign in."));
    if (!data.user) return err("Could not sign in.");
    return ok({ userId: data.user.id });
  } catch (e) {
    return err(message(e, "Could not sign in."));
  }
}

export async function signOut(): Promise<Result> {
  try {
    const { error } = await getFlowOSClient().auth.signOut();
    if (error) return err(message(error, "Could not sign out."));
    return ok();
  } catch (e) {
    return err(message(e, "Could not sign out."));
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await getFlowOSClient().auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @flowos/core test`
Expected: all passing (5 client + 9 auth).

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/supabase/
git commit -m "feat(core): add Result type and Supabase auth wrappers"
```

---

### Task 3: Model additions — peak windows and raw urgency scores

**Files:**
- Modify: `packages/core/src/models/onboarding.ts`
- Create: `packages/core/src/models/onboarding.test.ts`

**Interfaces:**
- Consumes: existing `ChronotypeName`, `UrgencyResult`, `scoreUrgencyIndex`
- Produces:
  - `PEAK_WINDOWS: Record<ChronotypeName, { start: string; end: string } | null>`
  - `UrgencyResult.scores: number[]` — the 16 raw answers, required by `urgency_index_assessments.q1..q16`

**Why:** `CHRONOTYPE_PROFILES[x].peakWindow` is a display string and dolphin's is `"Variable"`, which cannot be written to a `time` column. Separately, `UrgencyResult` currently discards the 16 raw scores that `scoreUrgencyIndex` receives, but the DB requires them.

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/models/onboarding.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PEAK_WINDOWS, scoreUrgencyIndex } from "./onboarding";

describe("PEAK_WINDOWS", () => {
  it("gives lion an 08:00-12:00 window", () => {
    expect(PEAK_WINDOWS.lion).toEqual({ start: "08:00", end: "12:00" });
  });

  it("gives bear a 10:00-14:00 window", () => {
    expect(PEAK_WINDOWS.bear).toEqual({ start: "10:00", end: "14:00" });
  });

  it("gives wolf a 17:00-21:00 window", () => {
    expect(PEAK_WINDOWS.wolf).toEqual({ start: "17:00", end: "21:00" });
  });

  it("gives dolphin no fixed window, per ADR-013", () => {
    expect(PEAK_WINDOWS.dolphin).toBeNull();
  });
});

describe("scoreUrgencyIndex", () => {
  it("keeps the 16 raw scores for the database", () => {
    const scores = [4, 0, 4, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(scoreUrgencyIndex(scores).scores).toEqual(scores);
  });

  it("totals the scores", () => {
    const scores = new Array(16).fill(2);
    expect(scoreUrgencyIndex(scores).totalScore).toBe(32);
  });

  it("maps a low total to prioritizer", () => {
    const result = scoreUrgencyIndex(new Array(16).fill(0));
    expect(result.profile).toBe("prioritizer");
    expect(result.dbProfileType).toBe("prioritizer");
  });

  it("maps a high total with a dominant Q1 to procrastinator", () => {
    const scores = new Array(16).fill(4);
    expect(scoreUrgencyIndex(scores).dbProfileType).toBe("procrastinator");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm --filter @flowos/core test onboarding`
Expected: FAIL — `PEAK_WINDOWS` is not exported.

- [ ] **Step 3: Add `PEAK_WINDOWS` beside `CHRONOTYPE_PROFILES`**

Insert into `packages/core/src/models/onboarding.ts` immediately after the `CHRONOTYPE_PROFILES` declaration (around line 54):

```ts
// Machine-readable counterpart to CHRONOTYPE_PROFILES[x].peakWindow, which is
// display copy ("08:00 – 12:00") and, for dolphin, the unparseable "Variable".
// These values are written to chronotype_profiles.peak_window_start/_end (time
// columns). Dolphin is null — ADR-013 gives dolphins no fixed window and
// distributes work by detected peaks instead.
export const PEAK_WINDOWS: Record<
  ChronotypeName,
  { start: string; end: string } | null
> = {
  lion: { start: "08:00", end: "12:00" },
  bear: { start: "10:00", end: "14:00" },
  wolf: { start: "17:00", end: "21:00" },
  dolphin: null,
};
```

- [ ] **Step 4: Add `scores` to `UrgencyResult`**

In the `UrgencyResult` interface (around line 263), add:

```ts
  // The 16 raw answers, retained for urgency_index_assessments.q1..q16.
  // The DB stores every individual score, not just the total (US-059).
  scores: number[];
```

Then in `scoreUrgencyIndex`, add `scores` to the returned object:

```ts
  return {
    totalScore: total,
    profile,
    ...profileData[profile],
    dbProfileType: mapToDbProfileType(total, scores),
    scores,
  };
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @flowos/core test`
Expected: all passing.

- [ ] **Step 6: Typecheck the app still compiles**

Run: `pnpm --filter @flowos/core build`
Expected: no errors. (`UrgencyResult` gained a required field, but it is only ever constructed inside `scoreUrgencyIndex`.)

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/models/
git commit -m "feat(core): add PEAK_WINDOWS and retain raw urgency scores"
```

---

### Task 4: Row types and pure onboarding row builders

**Files:**
- Create: `packages/core/src/supabase/types.ts`
- Create: `packages/core/src/supabase/onboardingRows.ts`
- Create: `packages/core/src/supabase/onboardingRows.test.ts`

**Interfaces:**
- Consumes: `WizardState`, `PEAK_WINDOWS`, `UrgencyResult` from Task 3
- Produces:
  - `buildChronotypeRow(userId, state, now): ChronotypeProfileRow | null`
  - `buildUserProfilePatch(state): UserProfilePatch`
  - `buildUrgencyRow(userId, state, now): UrgencyAssessmentRow | null`
  - `buildRoleRows(userId, state): RoleRow[]`
  - `buildGoalRow(userId, state, roleId, isoWeek): GoalRow | null`

**Why separate:** these are pure functions with no I/O, so they carry the bulk of the coverage without needing a database.

- [ ] **Step 1: Create `packages/core/src/supabase/types.ts`**

```ts
// packages/core/src/supabase/types.ts
// Hand-written row types for the tables this package writes. Narrower than a
// generated schema on purpose — only the columns we actually set appear here.

export interface ChronotypeProfileRow {
  user_id: string;
  assessed_type: "lion" | "bear" | "wolf" | "dolphin";
  peak_window_start: string | null;
  peak_window_end: string | null;
  last_assessed_at: string;
  data_source: "self_report" | "behaviour";
}

export interface UserProfilePatch {
  chronotype: "lion" | "bear" | "wolf" | "dolphin" | null;
  planning_day: number;
}

export interface UrgencyAssessmentRow {
  user_id: string;
  assessed_at: string;
  total_score: number;
  profile_type: "prioritizer" | "procrastinator" | "yes_man" | "slacker";
  [key: `q${number}_score`]: number | string | undefined;
}

export interface RoleRow {
  user_id: string;
  name: string;
  color: string;
  emoji: string;
  order_index: number;
  active: boolean;
}

export interface GoalRow {
  user_id: string;
  role_id: string | null;
  text: string;
  timeframe: "week" | "month" | "year" | "3year" | "longterm";
  done: boolean;
  week_number: number;
  year: number;
}

export interface WeekIntentionRow {
  user_id: string;
  week_number: number;
  year: number;
  q2_target_pct: number;
  role_intentions_json: string[];
  one_sentence_intention: string;
}
```

- [ ] **Step 2: Write the failing test**

Create `packages/core/src/supabase/onboardingRows.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  buildChronotypeRow,
  buildUserProfilePatch,
  buildUrgencyRow,
  buildRoleRows,
  buildGoalRow,
} from "./onboardingRows";
import { INITIAL_WIZARD_STATE, scoreUrgencyIndex } from "../models/onboarding";
import type { WizardState } from "../models/onboarding";

const NOW = "2026-08-01T09:00:00.000Z";
const USER = "user-1";

function stateWith(patch: Partial<WizardState>): WizardState {
  return { ...INITIAL_WIZARD_STATE, ...patch };
}

describe("buildChronotypeRow", () => {
  it("writes the peak window for a lion", () => {
    const row = buildChronotypeRow(USER, stateWith({ chronotype: "lion" }), NOW);
    expect(row).toEqual({
      user_id: USER,
      assessed_type: "lion",
      peak_window_start: "08:00",
      peak_window_end: "12:00",
      last_assessed_at: NOW,
      data_source: "self_report",
    });
  });

  it("writes null windows for a dolphin", () => {
    const row = buildChronotypeRow(USER, stateWith({ chronotype: "dolphin" }), NOW);
    expect(row?.peak_window_start).toBeNull();
    expect(row?.peak_window_end).toBeNull();
  });

  it("returns null when no chronotype was chosen", () => {
    expect(buildChronotypeRow(USER, stateWith({ chronotype: null }), NOW)).toBeNull();
  });
});

describe("buildUserProfilePatch", () => {
  it("carries chronotype and planning day", () => {
    const patch = buildUserProfilePatch(
      stateWith({ chronotype: "bear", planningDay: 2 })
    );
    expect(patch).toEqual({ chronotype: "bear", planning_day: 2 });
  });

  it("defaults planning day to Friday when untouched", () => {
    expect(buildUserProfilePatch(INITIAL_WIZARD_STATE).planning_day).toBe(5);
  });
});

describe("buildUrgencyRow", () => {
  it("spreads all 16 scores into q1..q16", () => {
    const scores = [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4];
    const row = buildUrgencyRow(
      USER,
      stateWith({ urgencyResult: scoreUrgencyIndex(scores) }),
      NOW
    );
    expect(row?.q1_score).toBe(4);
    expect(row?.q16_score).toBe(4);
    expect(row?.total_score).toBe(34);
    expect(row?.assessed_at).toBe(NOW);
  });

  it("returns null when the user skipped the assessment", () => {
    expect(buildUrgencyRow(USER, stateWith({ urgencyResult: null }), NOW)).toBeNull();
  });
});

describe("buildRoleRows", () => {
  it("preserves order and marks roles active", () => {
    const rows = buildRoleRows(
      USER,
      stateWith({
        roles: [
          { monogram: "B", name: "Build", color: "#2563EB" },
          { monogram: "S", name: "Sell", color: "#0D9488" },
        ],
      })
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      user_id: USER,
      name: "Build",
      color: "#2563EB",
      emoji: "B",
      order_index: 0,
      active: true,
    });
    expect(rows[1].order_index).toBe(1);
  });

  it("caps at the 12-role application limit", () => {
    const roles = Array.from({ length: 20 }, (_, i) => ({
      monogram: "X",
      name: `Role ${i}`,
      color: "#6B7280",
    }));
    expect(buildRoleRows(USER, stateWith({ roles }))).toHaveLength(12);
  });
});

describe("buildGoalRow", () => {
  it("builds a weekly goal tied to a role", () => {
    const row = buildGoalRow(
      USER,
      stateWith({ firstWeekGoal: { roleIndex: 0, text: "Ship the wizard" } }),
      "role-abc",
      { week: 31, year: 2026 }
    );
    expect(row).toEqual({
      user_id: USER,
      role_id: "role-abc",
      text: "Ship the wizard",
      timeframe: "week",
      done: false,
      week_number: 31,
      year: 2026,
    });
  });

  it("returns null when the goal text is blank", () => {
    const row = buildGoalRow(
      USER,
      stateWith({ firstWeekGoal: { roleIndex: 0, text: "   " } }),
      "role-abc",
      { week: 31, year: 2026 }
    );
    expect(row).toBeNull();
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm --filter @flowos/core test onboardingRows`
Expected: FAIL — `Cannot find module './onboardingRows'`

- [ ] **Step 4: Implement `packages/core/src/supabase/onboardingRows.ts`**

```ts
// packages/core/src/supabase/onboardingRows.ts
// Pure WizardState -> row mappers. No I/O, so the mapping logic is fully
// unit-testable without a database. sync.ts does the writing.

import {
  PEAK_WINDOWS,
  type WizardState,
} from "../models/onboarding";
import type {
  ChronotypeProfileRow,
  GoalRow,
  RoleRow,
  UrgencyAssessmentRow,
  UserProfilePatch,
} from "./types";

/** Handbook: max 12 active roles per user, enforced in the application layer. */
const MAX_ROLES = 12;

export function buildChronotypeRow(
  userId: string,
  state: WizardState,
  nowIso: string
): ChronotypeProfileRow | null {
  if (!state.chronotype) return null;
  const window = PEAK_WINDOWS[state.chronotype];
  return {
    user_id: userId,
    assessed_type: state.chronotype,
    peak_window_start: window?.start ?? null,
    peak_window_end: window?.end ?? null,
    last_assessed_at: nowIso,
    data_source: "self_report",
  };
}

export function buildUserProfilePatch(state: WizardState): UserProfilePatch {
  return {
    chronotype: state.chronotype,
    planning_day: state.planningDay,
  };
}

export function buildUrgencyRow(
  userId: string,
  state: WizardState,
  nowIso: string
): UrgencyAssessmentRow | null {
  const result = state.urgencyResult;
  if (!result) return null;

  const row: UrgencyAssessmentRow = {
    user_id: userId,
    assessed_at: nowIso,
    total_score: result.totalScore,
    profile_type: result.dbProfileType,
  };

  // q1_score .. q16_score
  result.scores.forEach((score, i) => {
    row[`q${i + 1}_score`] = score;
  });

  return row;
}

export function buildRoleRows(userId: string, state: WizardState): RoleRow[] {
  return state.roles.slice(0, MAX_ROLES).map((role, index) => ({
    user_id: userId,
    name: role.name,
    color: role.color,
    emoji: role.monogram,
    order_index: index,
    active: true,
  }));
}

export function buildGoalRow(
  userId: string,
  state: WizardState,
  roleId: string | null,
  isoWeek: { week: number; year: number }
): GoalRow | null {
  const text = state.firstWeekGoal.text.trim();
  if (!text) return null;
  return {
    user_id: userId,
    role_id: roleId,
    text,
    timeframe: "week",
    done: false,
    week_number: isoWeek.week,
    year: isoWeek.year,
  };
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @flowos/core test`
Expected: all passing.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/supabase/
git commit -m "feat(core): add row types and pure onboarding row builders"
```

---

### Task 5: ISO week helper

**Files:**
- Create: `packages/core/src/models/isoWeek.ts`
- Create: `packages/core/src/models/isoWeek.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `getIsoWeek(date: Date): { week: number; year: number }`

**Why now:** both `buildGoalRow` (Task 4) and Week Intention (Task 9) key rows by ISO week and year. Getting the year boundary wrong silently misfiles a row into the wrong year.

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/models/isoWeek.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getIsoWeek } from "./isoWeek";

describe("getIsoWeek", () => {
  it("returns week 1 for 4 January, which is always in week 1", () => {
    expect(getIsoWeek(new Date("2026-01-04T12:00:00Z"))).toEqual({
      week: 1,
      year: 2026,
    });
  });

  it("puts 1 January 2027 (a Friday) in week 53 of 2026", () => {
    expect(getIsoWeek(new Date("2027-01-01T12:00:00Z"))).toEqual({
      week: 53,
      year: 2026,
    });
  });

  it("puts 31 December 2024 (a Tuesday) in week 1 of 2025", () => {
    expect(getIsoWeek(new Date("2024-12-31T12:00:00Z"))).toEqual({
      week: 1,
      year: 2025,
    });
  });

  it("handles a mid-year date", () => {
    expect(getIsoWeek(new Date("2026-08-01T12:00:00Z"))).toEqual({
      week: 31,
      year: 2026,
    });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm --filter @flowos/core test isoWeek`
Expected: FAIL — `Cannot find module './isoWeek'`

- [ ] **Step 3: Implement `packages/core/src/models/isoWeek.ts`**

```ts
// packages/core/src/models/isoWeek.ts
// ISO-8601 week number. Weeks start Monday; week 1 is the week containing the
// first Thursday of the year. The ISO year is not always the calendar year —
// 31 Dec 2024 belongs to week 1 of 2025 — so week and year are returned
// together and must always be stored together.

export function getIsoWeek(date: Date): { week: number; year: number } {
  // Copy to UTC midnight so local timezones can't shift the day.
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  // Shift to the Thursday of this week; the ISO year is that Thursday's year.
  const dayNum = d.getUTCDay() || 7; // Sunday 0 -> 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return { week, year };
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @flowos/core test isoWeek`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/models/isoWeek.ts packages/core/src/models/isoWeek.test.ts
git commit -m "feat(core): add ISO-8601 week helper"
```

---

### Task 6: syncOnboarding orchestration

**Files:**
- Create: `packages/core/src/supabase/onboarding.ts`
- Create: `packages/core/src/supabase/onboarding.test.ts`

**Interfaces:**
- Consumes: builders from Task 4, `getIsoWeek` from Task 5, `Result` from Task 2
- Produces: `syncOnboarding(userId: string, state: WizardState, now?: Date): Promise<Result>`

**Idempotency requirement:** `chronotype_profiles` has no `UNIQUE (user_id)` and `roles` has no unique constraint, so a naive re-run duplicates rows. Chronotype uses select-then-insert-or-update; roles are deleted for this user before insert. Do **not** fix this by editing migrations.

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/supabase/onboarding.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

type Table = ReturnType<typeof makeTable>;

function makeTable() {
  const api = {
    select: vi.fn(() => api),
    eq: vi.fn(() => api),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    insert: vi.fn(async () => ({ data: null, error: null })),
    update: vi.fn(() => api),
    upsert: vi.fn(async () => ({ data: null, error: null })),
    delete: vi.fn(() => api),
    then: undefined as unknown,
  };
  return api;
}

const tables: Record<string, Table> = {};
const from = vi.fn((name: string) => {
  tables[name] = tables[name] ?? makeTable();
  return tables[name];
});

vi.mock("./client", () => ({ getFlowOSClient: () => ({ from }) }));

import { syncOnboarding } from "./onboarding";
import { INITIAL_WIZARD_STATE, scoreUrgencyIndex } from "../models/onboarding";

const NOW = new Date("2026-08-01T09:00:00.000Z");

const fullState = {
  ...INITIAL_WIZARD_STATE,
  chronotype: "lion" as const,
  planningDay: 5 as const,
  mission: "Build things that matter",
  roles: [{ monogram: "B", name: "Build", color: "#2563EB" }],
  firstWeekGoal: { roleIndex: 0, text: "Ship persistence" },
  urgencyResult: scoreUrgencyIndex(new Array(16).fill(2)),
};

beforeEach(() => {
  for (const key of Object.keys(tables)) delete tables[key];
  from.mockClear();
});

describe("syncOnboarding", () => {
  it("writes to every table for a fully completed wizard", async () => {
    const result = await syncOnboarding("user-1", fullState, NOW);
    expect(result.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("chronotype_profiles");
    expect(from).toHaveBeenCalledWith("user_profiles");
    expect(from).toHaveBeenCalledWith("urgency_index_assessments");
    expect(from).toHaveBeenCalledWith("missions");
    expect(from).toHaveBeenCalledWith("roles");
  });

  it("deletes existing roles before inserting, so a retry cannot duplicate them", async () => {
    await syncOnboarding("user-1", fullState, NOW);
    expect(tables["roles"].delete).toHaveBeenCalled();
    expect(tables["roles"].insert).toHaveBeenCalled();
  });

  it("skips the urgency table when the user skipped the assessment", async () => {
    await syncOnboarding("user-1", { ...fullState, urgencyResult: null }, NOW);
    expect(from).not.toHaveBeenCalledWith("urgency_index_assessments");
  });

  it("returns an error result when a write fails, without throwing", async () => {
    const result = await syncOnboarding("user-1", fullState, NOW).then((r) => r);
    // Force the mission write to fail on a second run.
    tables["missions"].upsert.mockResolvedValueOnce({
      data: null,
      error: { message: "new row violates row-level security policy" },
    });
    const failed = await syncOnboarding("user-1", fullState, NOW);
    expect(result.ok).toBe(true);
    expect(failed.ok).toBe(false);
    if (!failed.ok) expect(failed.error).toMatch(/row-level security/);
  });

  it("never throws when the client itself blows up", async () => {
    from.mockImplementationOnce(() => {
      throw new Error("Network request failed");
    });
    const result = await syncOnboarding("user-1", fullState, NOW);
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm --filter @flowos/core test supabase/onboarding`
Expected: FAIL — `Cannot find module './onboarding'`

- [ ] **Step 3: Implement `packages/core/src/supabase/onboarding.ts`**

```ts
// packages/core/src/supabase/onboarding.ts
// Batch-writes the finished wizard to Supabase. Called once from the wizard's
// completion screen, retried on next launch if it failed (design spec §5.2).
//
// Writes are sequential — PostgREST has no client-side transaction — so the
// function is written to be idempotent instead: running it twice leaves one
// row per table, not two. That is what makes retry safe.

import { getFlowOSClient } from "./client";
import { ok, err, type Result } from "./result";
import { getIsoWeek } from "../models/isoWeek";
import type { WizardState } from "../models/onboarding";
import {
  buildChronotypeRow,
  buildGoalRow,
  buildRoleRows,
  buildUrgencyRow,
  buildUserProfilePatch,
} from "./onboardingRows";

function message(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return fallback;
}

export async function syncOnboarding(
  userId: string,
  state: WizardState,
  now: Date = new Date()
): Promise<Result> {
  const nowIso = now.toISOString();
  const isoWeek = getIsoWeek(now);

  try {
    const db = getFlowOSClient();

    // --- chronotype_profiles -------------------------------------------
    // No UNIQUE (user_id) on this table, so upsert would insert a duplicate.
    // Select first, then update or insert. Raised with Dev C as a migration.
    const chronotypeRow = buildChronotypeRow(userId, state, nowIso);
    if (chronotypeRow) {
      const existing = await db
        .from("chronotype_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (existing.error) return err(existing.error.message);

      const written = existing.data
        ? await db
            .from("chronotype_profiles")
            .update(chronotypeRow)
            .eq("user_id", userId)
        : await db.from("chronotype_profiles").insert(chronotypeRow);
      if (written.error) return err(written.error.message);
    }

    // --- user_profiles --------------------------------------------------
    // The row already exists: Dev C's on_auth_user_created trigger creates it
    // at signup, which is why the table has no INSERT policy. Always update.
    const profilePatch = buildUserProfilePatch(state);
    const profile = await db
      .from("user_profiles")
      .update(profilePatch)
      .eq("user_id", userId);
    if (profile.error) return err(profile.error.message);

    // --- urgency_index_assessments --------------------------------------
    // Many rows per user is correct here — this table also stores the weekly
    // drift score — so a plain insert is right. Skipped if the user skipped.
    const urgencyRow = buildUrgencyRow(userId, state, nowIso);
    if (urgencyRow) {
      const urgency = await db
        .from("urgency_index_assessments")
        .insert(urgencyRow);
      if (urgency.error) return err(urgency.error.message);
    }

    // --- missions -------------------------------------------------------
    // Has UNIQUE (user_id), so a real upsert works.
    const mission = state.mission.trim();
    if (mission) {
      const written = await db
        .from("missions")
        .upsert(
          { user_id: userId, text: mission, updated_at: nowIso },
          { onConflict: "user_id" }
        );
      if (written.error) return err(written.error.message);
    }

    // --- roles ----------------------------------------------------------
    // No unique constraint, so clear this user's roles before inserting.
    const roleRows = buildRoleRows(userId, state);
    if (roleRows.length > 0) {
      const cleared = await db.from("roles").delete().eq("user_id", userId);
      if (cleared.error) return err(cleared.error.message);

      const inserted = await db.from("roles").insert(roleRows).select("id");
      if (inserted.error) return err(inserted.error.message);

      // --- goals --------------------------------------------------------
      const insertedIds = (inserted.data ?? []) as { id: string }[];
      const roleIndex = state.firstWeekGoal.roleIndex;
      const roleId =
        roleIndex !== null && insertedIds[roleIndex]
          ? insertedIds[roleIndex].id
          : null;

      const goalRow = buildGoalRow(userId, state, roleId, isoWeek);
      if (goalRow) {
        const goal = await db.from("goals").insert(goalRow);
        if (goal.error) return err(goal.error.message);
      }
    }

    return ok();
  } catch (e) {
    return err(message(e, "Could not save your setup."));
  }
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @flowos/core test`
Expected: all passing.

- [ ] **Step 5: Check coverage**

Run: `pnpm --filter @flowos/core test:coverage`
Expected: `src/supabase` and `src/models` above the 80% statement threshold.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/supabase/
git commit -m "feat(core): add idempotent syncOnboarding batch write"
```

---

### Task 7: Week Intention data layer

**Files:**
- Create: `packages/core/src/supabase/weekIntentions.ts`
- Create: `packages/core/src/supabase/weekIntentions.test.ts`

**Interfaces:**
- Consumes: `Result` (Task 2), `WeekIntentionRow` (Task 4), `getIsoWeek` (Task 5)
- Produces:
  - `interface WeekIntentionInput { q2TargetPct: number; roleIds: string[]; intention: string }`
  - `saveWeekIntention(userId: string, input: WeekIntentionInput, now?: Date): Promise<Result>`
  - `getWeekIntention(userId: string, now?: Date): Promise<Result<WeekIntentionRow | null>>`
  - `clampQ2Target(pct: number): number` — clamps to 40–80 (US-061)
  - `capRoleIds(ids: string[]): string[]` — max 3 (US-061)

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/supabase/weekIntentions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const maybeSingle = vi.fn(async () => ({ data: null, error: null }));
const insert = vi.fn(async () => ({ data: null, error: null }));
const update = vi.fn(() => chain);
const eq = vi.fn(() => chain);
const select = vi.fn(() => chain);

const chain = { select, eq, maybeSingle, insert, update } as never;
const from = vi.fn(() => chain);

vi.mock("./client", () => ({ getFlowOSClient: () => ({ from }) }));

import {
  saveWeekIntention,
  getWeekIntention,
  clampQ2Target,
  capRoleIds,
} from "./weekIntentions";

const NOW = new Date("2026-08-01T09:00:00.000Z"); // ISO week 31 of 2026

beforeEach(() => vi.clearAllMocks());

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
});

describe("saveWeekIntention", () => {
  it("inserts with the current ISO week and year", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const result = await saveWeekIntention(
      "user-1",
      { q2TargetPct: 65, roleIds: ["r1", "r2"], intention: "Protect mornings" },
      NOW
    );
    expect(result.ok).toBe(true);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        week_number: 31,
        year: 2026,
        q2_target_pct: 65,
        role_intentions_json: ["r1", "r2"],
        one_sentence_intention: "Protect mornings",
      })
    );
  });

  it("updates instead of inserting when this week already has a row", async () => {
    maybeSingle.mockResolvedValueOnce({ data: { id: "wi-1" }, error: null });
    await saveWeekIntention(
      "user-1",
      { q2TargetPct: 70, roleIds: [], intention: "Fewer meetings" },
      NOW
    );
    expect(update).toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("clamps and caps before writing", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    await saveWeekIntention(
      "user-1",
      { q2TargetPct: 200, roleIds: ["a", "b", "c", "d"], intention: "x" },
      NOW
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        q2_target_pct: 80,
        role_intentions_json: ["a", "b", "c"],
      })
    );
  });

  it("returns an error result rather than throwing", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    insert.mockResolvedValueOnce({
      data: null,
      error: { message: "new row violates row-level security policy" },
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
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const result = await getWeekIntention("user-1", NOW);
    expect(result).toEqual({ ok: true, data: null });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm --filter @flowos/core test weekIntentions`
Expected: FAIL — `Cannot find module './weekIntentions'`

- [ ] **Step 3: Implement `packages/core/src/supabase/weekIntentions.ts`**

```ts
// packages/core/src/supabase/weekIntentions.ts
// US-061 Week Intention storage.
//
// week_intentions has no UNIQUE (user_id, week_number, year), so editing an
// intention twice in one week would create two rows. Read-then-update, same
// pattern as chronotype_profiles. Raised with Dev C as a migration.

import { getFlowOSClient } from "./client";
import { ok, err, type Result } from "./result";
import { getIsoWeek } from "../models/isoWeek";
import type { WeekIntentionRow } from "./types";

/** US-061: slider range is 40–80%. */
const Q2_MIN = 40;
const Q2_MAX = 80;
/** US-061: top 3 roles to invest in. */
const MAX_ROLES = 3;

export interface WeekIntentionInput {
  q2TargetPct: number;
  roleIds: string[];
  intention: string;
}

export function clampQ2Target(pct: number): number {
  return Math.min(Q2_MAX, Math.max(Q2_MIN, Math.round(pct)));
}

export function capRoleIds(ids: string[]): string[] {
  return Array.from(new Set(ids)).slice(0, MAX_ROLES);
}

function message(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return fallback;
}

export async function saveWeekIntention(
  userId: string,
  input: WeekIntentionInput,
  now: Date = new Date()
): Promise<Result> {
  const { week, year } = getIsoWeek(now);

  const row: WeekIntentionRow = {
    user_id: userId,
    week_number: week,
    year,
    q2_target_pct: clampQ2Target(input.q2TargetPct),
    role_intentions_json: capRoleIds(input.roleIds),
    one_sentence_intention: input.intention.trim(),
  };

  try {
    const db = getFlowOSClient();

    const existing = await db
      .from("week_intentions")
      .select("id")
      .eq("user_id", userId)
      .eq("week_number", week)
      .eq("year", year)
      .maybeSingle();
    if (existing.error) return err(existing.error.message);

    const written = existing.data
      ? await db
          .from("week_intentions")
          .update(row)
          .eq("user_id", userId)
          .eq("week_number", week)
          .eq("year", year)
      : await db.from("week_intentions").insert(row);

    if (written.error) return err(written.error.message);
    return ok();
  } catch (e) {
    return err(message(e, "Could not save your intention."));
  }
}

export async function getWeekIntention(
  userId: string,
  now: Date = new Date()
): Promise<Result<WeekIntentionRow | null>> {
  const { week, year } = getIsoWeek(now);
  try {
    const { data, error } = await getFlowOSClient()
      .from("week_intentions")
      .select("*")
      .eq("user_id", userId)
      .eq("week_number", week)
      .eq("year", year)
      .maybeSingle();
    if (error) return err(error.message);
    return ok((data as WeekIntentionRow | null) ?? null);
  } catch (e) {
    return err(message(e, "Could not load your intention."));
  }
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @flowos/core test`
Expected: all passing.

- [ ] **Step 5: Export the supabase module from the package index**

Add to `packages/core/src/index.ts`:

```ts
export * from "./models/isoWeek";
export * from "./supabase";
```

And create `packages/core/src/supabase/index.ts`:

```ts
export * from "./client";
export * from "./result";
export * from "./auth";
export * from "./onboarding";
export * from "./weekIntentions";
export * from "./types";
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/
git commit -m "feat(core): add week intention storage with clamping and caps"
```

---

### Task 8: i18n keys for sign-in and week intention

**Files:**
- Modify: `packages/core/src/i18n/resources.ts`

**Interfaces:**
- Produces: `auth.*` and `weekIntention.*` keys in both `en` and `nl`

**Constraint:** the DoD requires every string in EN and NL. NL must mirror the EN key structure exactly.

- [ ] **Step 1: Add the `auth` block to `en`**

Insert as a new top-level key alongside `onboarding` in the `en` object:

```ts
  auth: {
    heading: "Sign in to FlowOS",
    subheadingSignIn: "Welcome back. Your setup and plan are waiting.",
    subheadingSignUp: "Create your account to save your setup across devices.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    signInCta: "Sign in",
    signUpCta: "Create account",
    toggleToSignUp: "No account yet? Create one",
    toggleToSignIn: "Already have an account? Sign in",
    working: "One moment…",
    errorEmptyFields: "Enter your email and password.",
    errorPasswordTooShort: "Use at least 8 characters.",
  },
  weekIntention: {
    heading: "Set your intention for the week",
    subheading:
      "A deliberate commitment before the week starts. On your next planning day you'll see how it went.",
    q2Label: "Q2 target",
    q2Hint: "Share of your week spent on important, non-urgent work.",
    rolesLabel: "Top 3 roles to invest in",
    rolesHint: "Pick up to three.",
    rolesEmpty: "No roles yet — add them in your workspace first.",
    intentionLabel: "Your intention in one sentence",
    intentionPlaceholder: "Protect my mornings for deep work.",
    saveCta: "Start the week",
    saving: "Saving…",
    errorGeneric: "Could not save your intention. It will retry.",
  },
```

- [ ] **Step 2: Add the mirrored `nl` block**

Insert the same structure into the `nl` object:

```ts
  auth: {
    heading: "Log in bij FlowOS",
    subheadingSignIn: "Welkom terug. Je setup en planning staan klaar.",
    subheadingSignUp: "Maak een account om je setup op al je apparaten te bewaren.",
    emailLabel: "E-mail",
    emailPlaceholder: "jij@bedrijf.nl",
    passwordLabel: "Wachtwoord",
    passwordPlaceholder: "Minimaal 8 tekens",
    signInCta: "Inloggen",
    signUpCta: "Account aanmaken",
    toggleToSignUp: "Nog geen account? Maak er een",
    toggleToSignIn: "Heb je al een account? Log in",
    working: "Een moment…",
    errorEmptyFields: "Vul je e-mailadres en wachtwoord in.",
    errorPasswordTooShort: "Gebruik minimaal 8 tekens.",
  },
  weekIntention: {
    heading: "Bepaal je intentie voor deze week",
    subheading:
      "Een bewuste keuze vóór de week begint. Op je volgende planningsdag zie je hoe het ging.",
    q2Label: "Q2-doel",
    q2Hint: "Deel van je week aan belangrijk, niet-urgent werk.",
    rolesLabel: "Top 3 rollen om in te investeren",
    rolesHint: "Kies er maximaal drie.",
    rolesEmpty: "Nog geen rollen — voeg ze eerst toe aan je werkruimte.",
    intentionLabel: "Je intentie in één zin",
    intentionPlaceholder: "Mijn ochtenden beschermen voor diep werk.",
    saveCta: "Start de week",
    saving: "Opslaan…",
    errorGeneric: "Kon je intentie niet opslaan. We proberen het opnieuw.",
  },
```

- [ ] **Step 3: Verify both locales have identical key structure**

Run: `pnpm --filter @flowos/core build`
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/i18n/resources.ts
git commit -m "feat(core): add EN/NL keys for sign-in and week intention"
```

---

### Task 9: AuthContext and client bootstrap

**Files:**
- Create: `apps/mobile/context/AuthContext.tsx`
- Modify: `apps/mobile/app/_layout.tsx`
- Modify: `.env.example`
- Modify: `apps/mobile/package.json`

**Interfaces:**
- Consumes: `createFlowOSClient`, `signIn`, `signUp`, `signOut`, `getCurrentUserId` from `@flowos/core`
- Produces: `useAuth(): { userId: string | null; hydrated: boolean; signIn; signUp; signOut }`

- [ ] **Step 1: Install the SDK in the app**

```bash
pnpm --filter mobile add @supabase/supabase-js react-native-url-polyfill
```

- [ ] **Step 2: Add the Expo-visible env vars**

Append to `.env.example` (keep the existing unprefixed names — the desktop app and Edge Functions read those):

```
# Expo only exposes EXPO_PUBLIC_* to client code
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Then set both in your local `.env` to the values printed by `supabase start`.

- [ ] **Step 3: Create `apps/mobile/context/AuthContext.tsx`**

```tsx
// apps/mobile/context/AuthContext.tsx
// Session state for the app. All Supabase calls are delegated to
// @flowos/core — this file holds React state and nothing else.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createFlowOSClient,
  getCurrentUserId,
  signIn as coreSignIn,
  signUp as coreSignUp,
  signOut as coreSignOut,
  type Result,
} from "@flowos/core";

// AsyncStorage is native, so it is injected here rather than imported inside
// packages/core — see README "Duplicate React Native resolution".
createFlowOSClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  storage: AsyncStorage,
});

const WIZARD_STORAGE_KEY = "flowos.onboarding.wizardProgress";

interface AuthContextValue {
  userId: string | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<Result<{ userId: string }>>;
  signUp: (email: string, password: string) => Promise<Result<{ userId: string }>>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getCurrentUserId()
      .then(setUserId)
      .finally(() => setHydrated(true));
  }, []);

  async function signIn(email: string, password: string) {
    const result = await coreSignIn(email, password);
    if (result.ok) setUserId(result.data.userId);
    return result;
  }

  async function signUp(email: string, password: string) {
    const result = await coreSignUp(email, password);
    if (result.ok) setUserId(result.data.userId);
    return result;
  }

  async function signOut() {
    await coreSignOut();
    setUserId(null);
    // The wizard progress key is device-global, so without this a second user
    // on the same device resumes the first user's half-finished wizard.
    await AsyncStorage.removeItem(WIZARD_STORAGE_KEY).catch(() => {});
  }

  const value = useMemo(
    () => ({ userId, hydrated, signIn, signUp, signOut }),
    [userId, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
```

- [ ] **Step 4: Wrap the root layout**

In `apps/mobile/app/_layout.tsx`, import `AuthProvider` and wrap `RootStack`. Add the two new routes to the stack:

```tsx
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18next}>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
      <DevLocaleToggle />
    </I18nextProvider>
  );
}
```

And inside `RootStack`'s `<Stack>`, alongside the existing `index` screen:

```tsx
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="week-intention" options={{ title: "Week Intention" }} />
```

- [ ] **Step 5: Verify the app still boots**

Run: `pnpm --filter mobile start`, then open in Expo Go.
Expected: the app loads as before. No sign-in gate yet — that is Task 10.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/ .env.example pnpm-lock.yaml
git commit -m "feat(mobile): add AuthProvider and Supabase client bootstrap"
```

---

### Task 10: Sign-in screen and routing gate

**Files:**
- Create: `apps/mobile/app/sign-in.tsx`
- Modify: `apps/mobile/app/index.tsx`

**Interfaces:**
- Consumes: `useAuth` from Task 9, `auth.*` i18n keys from Task 8

- [ ] **Step 1: Create `apps/mobile/app/sign-in.tsx`**

```tsx
// apps/mobile/app/sign-in.tsx
// Email + password. No deep linking, which keeps the team's Expo Go QR
// workflow working (design spec §3).

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import { useAuth } from "../context/AuthContext";

const MIN_PASSWORD_LENGTH = 8;

export default function SignInScreen() {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !password) {
      setError(t("auth.errorEmptyFields"));
      return;
    }
    if (mode === "signUp" && password.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.errorPasswordTooShort"));
      return;
    }

    setBusy(true);
    const result =
      mode === "signIn"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.body}>
        <Text style={styles.heading}>{t("auth.heading")}</Text>
        <Text style={styles.subheading}>
          {mode === "signIn"
            ? t("auth.subheadingSignIn")
            : t("auth.subheadingSignUp")}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.emailLabel")}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t("auth.emailPlaceholder")}
            placeholderTextColor={colors.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.passwordLabel")}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t("auth.passwordPlaceholder")}
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.actions}>
        <Button
          label={
            busy
              ? t("auth.working")
              : mode === "signIn"
                ? t("auth.signInCta")
                : t("auth.signUpCta")
          }
          onPress={handleSubmit}
          disabled={busy}
        />
        <Pressable
          onPress={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>
            {mode === "signIn"
              ? t("auth.toggleToSignUp")
              : t("auth.toggleToSignIn")}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  body: { gap: spacing.md, paddingTop: spacing.xxl },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as never,
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.5,
    marginBottom: spacing.md,
  },
  field: { gap: spacing.xs },
  label: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as never,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.size.base,
  },
  error: {
    color: colors.accent.danger,
    fontSize: typography.size.sm,
  },
  actions: { gap: spacing.md },
  toggle: { alignItems: "center", paddingVertical: spacing.sm },
  toggleText: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
  },
});
```

- [ ] **Step 2: Turn `index.tsx` into the routing gate**

Replace the body of `apps/mobile/app/index.tsx` with a redirect based on session and onboarding state. Keep the existing imports for tokens.

```tsx
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@flowos/ui-shared";
import { useAuth } from "../context/AuthContext";

const WIZARD_STORAGE_KEY = "flowos.onboarding.wizardProgress";

export default function IndexScreen() {
  const { userId, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    if (!userId) {
      router.replace("/sign-in");
      return;
    }

    AsyncStorage.getItem(WIZARD_STORAGE_KEY)
      .then((raw) => {
        const done = raw ? Boolean(JSON.parse(raw)?.wizardState?.completedAt) : false;
        router.replace(done ? "/timeline" : "/onboarding");
      })
      .catch(() => router.replace("/onboarding"));
  }, [hydrated, userId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

- [ ] **Step 3: Manually verify the gate**

Run: `pnpm --filter mobile start`
Expected sequence:
1. App opens on the sign-in screen.
2. "Create account" with a new email → lands in the onboarding wizard.
3. Kill and reopen the app → goes straight to onboarding (session persisted), not sign-in.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/
git commit -m "feat(mobile): add sign-in screen and session routing gate"
```

---

### Task 11: Wire onboarding completion to the database

**Files:**
- Modify: `apps/mobile/app/onboarding/complete.tsx`
- Modify: `apps/mobile/app/onboarding/chronotype.tsx:44` (remove the stale TODO)
- Modify: `apps/mobile/context/WizardContext.tsx:9-10` (update the stale comment)

**Interfaces:**
- Consumes: `syncOnboarding` from `@flowos/core`, `useAuth` from Task 9

- [ ] **Step 1: Add the sync call to `complete.tsx`**

Replace the existing `useEffect` in `apps/mobile/app/onboarding/complete.tsx` with:

```tsx
  const { userId } = useAuth();
  const { wizardState, updateWizardState, clearProgress } = useWizard();

  useEffect(() => {
    updateWizardState({ completedAt: new Date().toISOString() });

    if (!userId) return;

    // Fire and forget: the user is never blocked on the network here. Their
    // answers are already in AsyncStorage, so a failure is recoverable on the
    // next launch (design spec §5.2).
    syncOnboarding(userId, wizardState).then((result) => {
      if (result.ok) {
        clearProgress();
      } else {
        console.warn("[onboarding] sync failed, will retry on next launch:", result.error);
        AsyncStorage.setItem(PENDING_SYNC_KEY, "1").catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
```

Add the imports and constant at the top of the file:

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncOnboarding } from "@flowos/core";
import { useAuth } from "../../context/AuthContext";

const PENDING_SYNC_KEY = "flowos.onboarding.pendingSync";
```

Note: `clearProgress()` now only runs on success — the wizard state must survive so the retry has something to send.

- [ ] **Step 2: Add the retry on next launch**

In `apps/mobile/context/AuthContext.tsx`, extend the hydration effect:

```tsx
  useEffect(() => {
    getCurrentUserId()
      .then(async (id) => {
        setUserId(id);
        if (id) await retryPendingSync(id);
      })
      .finally(() => setHydrated(true));
  }, []);
```

And add above the provider:

```tsx
import { syncOnboarding, type WizardState } from "@flowos/core";

const PENDING_SYNC_KEY = "flowos.onboarding.pendingSync";

// One retry per launch. If onboarding failed to save (offline, or the session
// hadn't landed yet), replay it from the wizard state still in AsyncStorage.
async function retryPendingSync(userId: string): Promise<void> {
  try {
    const pending = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    if (!pending) return;

    const raw = await AsyncStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.removeItem(PENDING_SYNC_KEY);
      return;
    }

    const state = JSON.parse(raw)?.wizardState as WizardState | undefined;
    if (!state) return;

    const result = await syncOnboarding(userId, state);
    if (result.ok) {
      await AsyncStorage.multiRemove([PENDING_SYNC_KEY, WIZARD_STORAGE_KEY]);
    }
  } catch {
    // Retry again next launch.
  }
}
```

- [ ] **Step 3: Remove the two stale comments**

- `apps/mobile/app/onboarding/chronotype.tsx:44` — delete the line
  `// TODO: store to chronotype_profiles.assessed_type via Supabase`
- `apps/mobile/context/WizardContext.tsx:9-10` — replace "this is purely local/device
  state — it does NOT touch Supabase, since the onboarding data writes are still blocked
  on the auth session + DB migrations landing" with:
  "This is local/device state only. The batch write to Supabase happens once at
  wizard completion — see app/onboarding/complete.tsx and core/supabase/onboarding.ts."

- [ ] **Step 4: Verify end to end against local Supabase**

```bash
supabase start
supabase db reset
pnpm --filter mobile start
```

Complete the wizard, then check the rows landed:

```bash
supabase db query "select user_id, chronotype, planning_day from user_profiles;"
supabase db query "select assessed_type, peak_window_start from chronotype_profiles;"
supabase db query "select total_score, profile_type, q1_score, q16_score from urgency_index_assessments;"
supabase db query "select text from missions;"
supabase db query "select name, order_index from roles order by order_index;"
```

Expected: one row per table, matching what you entered in the wizard.

- [ ] **Step 5: Verify the offline path**

Put the device in airplane mode, complete the wizard for a new account, confirm the app still reaches the completion screen without hanging. Re-enable networking, kill and relaunch, then re-run the queries above.
Expected: rows appear after relaunch.

- [ ] **Step 6: Verify idempotency**

Run the wizard twice for the same account.
Expected: still one row in `chronotype_profiles` and one set of `roles` — not two.

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/
git commit -m "feat(mobile): persist onboarding results on completion with retry"
```

---

### Task 12: Week Intention screen (US-061 capture)

**Files:**
- Create: `apps/mobile/app/week-intention.tsx`

**Interfaces:**
- Consumes: `saveWeekIntention`, `getWeekIntention` from `@flowos/core`; `weekIntention.*` i18n keys from Task 8; `useAuth` from Task 9

**Scope note:** this delivers the capture half of US-061 only. The Intention vs Reality readback and the 4-week revised-target suggestion depend on the Weekly Performance Report, which is Sprint 3. Do not close the ticket on this branch.

- [ ] **Step 1: Create the screen**

```tsx
// apps/mobile/app/week-intention.tsx
// US-061 — Week Intention capture. Shown on the user's planning day before
// the weekly planning grid.
//
// Voice input on the intention field is deferred: the speech infrastructure
// arrives with the Morning Protocol in a later Sprint 2 workstream.

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import { saveWeekIntention, getWeekIntention } from "@flowos/core";
import { useAuth } from "../context/AuthContext";

const Q2_MIN = 40;
const Q2_MAX = 80;
const Q2_STEP = 5;
const Q2_DEFAULT = 60;
const MAX_ROLES = 3;

interface RoleChip {
  id: string;
  name: string;
}

export default function WeekIntentionScreen() {
  const { t } = useTranslation();
  const { userId } = useAuth();

  const [q2Target, setQ2Target] = useState(Q2_DEFAULT);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [intention, setIntention] = useState("");
  const [roles, setRoles] = useState<RoleChip[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill if an intention already exists for this ISO week, so reopening
  // the screen edits rather than silently starting over.
  useEffect(() => {
    if (!userId) return;
    getWeekIntention(userId).then((result) => {
      if (result.ok && result.data) {
        setQ2Target(Number(result.data.q2_target_pct));
        setSelectedRoles(result.data.role_intentions_json ?? []);
        setIntention(result.data.one_sentence_intention ?? "");
      }
    });
  }, [userId]);

  function toggleRole(id: string) {
    setSelectedRoles((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= MAX_ROLES) return prev;
      return [...prev, id];
    });
  }

  async function handleSave() {
    if (!userId) return;
    setBusy(true);
    setError(null);

    const result = await saveWeekIntention(userId, {
      q2TargetPct: q2Target,
      roleIds: selectedRoles,
      intention,
    });
    setBusy(false);

    if (!result.ok) {
      setError(t("weekIntention.errorGeneric"));
      return;
    }
    router.replace("/timeline");
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.heading}>{t("weekIntention.heading")}</Text>
        <Text style={styles.subheading}>{t("weekIntention.subheading")}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.label}>{t("weekIntention.q2Label")}</Text>
          <Text style={styles.value}>{q2Target}%</Text>
        </View>
        <Text style={styles.hint}>{t("weekIntention.q2Hint")}</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepButton}
            onPress={() => setQ2Target((v) => Math.max(Q2_MIN, v - Q2_STEP))}
            accessibilityLabel="-5%"
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${((q2Target - Q2_MIN) / (Q2_MAX - Q2_MIN)) * 100}%` },
              ]}
            />
          </View>
          <Pressable
            style={styles.stepButton}
            onPress={() => setQ2Target((v) => Math.min(Q2_MAX, v + Q2_STEP))}
            accessibilityLabel="+5%"
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("weekIntention.rolesLabel")}</Text>
        <Text style={styles.hint}>{t("weekIntention.rolesHint")}</Text>
        {roles.length === 0 ? (
          <Text style={styles.empty}>{t("weekIntention.rolesEmpty")}</Text>
        ) : (
          <View style={styles.chips}>
            {roles.map((role) => {
              const active = selectedRoles.includes(role.id);
              return (
                <Pressable
                  key={role.id}
                  onPress={() => toggleRole(role.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {role.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("weekIntention.intentionLabel")}</Text>
        <TextInput
          style={styles.textArea}
          value={intention}
          onChangeText={setIntention}
          placeholder={t("weekIntention.intentionPlaceholder")}
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={3}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={busy ? t("weekIntention.saving") : t("weekIntention.saveCta")}
        onPress={handleSave}
        disabled={busy}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  header: { gap: spacing.sm },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as never,
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.5,
  },
  section: { gap: spacing.sm },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as never,
  },
  value: {
    color: colors.accent.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as never,
  },
  hint: { color: colors.text.muted, fontSize: typography.size.sm },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as never,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background.elevated,
    overflow: "hidden",
  },
  trackFill: { height: "100%", backgroundColor: colors.accent.primary },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  chipText: { color: colors.text.secondary, fontSize: typography.size.sm },
  chipTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.medium as never,
  },
  empty: { color: colors.text.muted, fontSize: typography.size.sm },
  textArea: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: spacing.xs,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.size.base,
    minHeight: 88,
    textAlignVertical: "top",
  },
  error: { color: colors.accent.danger, fontSize: typography.size.sm },
});
```

- [ ] **Step 2: Load the user's real roles**

Add a `listRoles` function to `packages/core/src/supabase/weekIntentions.ts`:

```ts
export async function listRoles(
  userId: string
): Promise<Result<{ id: string; name: string }[]>> {
  try {
    const { data, error } = await getFlowOSClient()
      .from("roles")
      .select("id, name")
      .eq("user_id", userId)
      .eq("active", true)
      .order("order_index");
    if (error) return err(error.message);
    return ok((data ?? []) as { id: string; name: string }[]);
  } catch (e) {
    return err(message(e, "Could not load your roles."));
  }
}
```

Then in `week-intention.tsx`, load them in the same effect:

```tsx
    listRoles(userId).then((result) => {
      if (result.ok) setRoles(result.data);
    });
```

and add `listRoles` to the `@flowos/core` import.

- [ ] **Step 3: Verify manually**

Run: `pnpm --filter mobile start`, navigate to `/week-intention`.
Expected:
1. Roles created during onboarding appear as chips.
2. Selecting a fourth role does nothing (cap of 3).
3. The stepper stops at 40% and 80%.
4. Saving writes a row; reopening the screen pre-fills it rather than starting blank.

```bash
supabase db query "select week_number, year, q2_target_pct, role_intentions_json, one_sentence_intention from week_intentions;"
```

- [ ] **Step 4: Verify no duplicate row on re-save**

Save the intention, edit it, save again.
Expected: still exactly one row for this week.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/week-intention.tsx packages/core/src/supabase/weekIntentions.ts
git commit -m "feat(mobile): add Week Intention capture screen (US-061)"
```

---

### Task 13: Final verification against the Definition of Done

**Files:** none created — this is the gate before opening the PR.

- [ ] **Step 1: Full test run with coverage**

Run: `pnpm --filter @flowos/core test:coverage`
Expected: all passing, statements >80% in `src/supabase` and `src/models`.

- [ ] **Step 2: Typecheck the whole workspace**

Run: `pnpm build`
Expected: no errors, no `any` introduced in `packages/core`.

- [ ] **Step 3: Confirm no Supabase import escaped into a screen**

Run: `grep -rn "@supabase/supabase-js" apps/ packages/ui-shared/ --include=*.ts --include=*.tsx`
Expected: no results. Only `packages/core/src/supabase/client.ts` and `apps/mobile/package.json` may reference it.

- [ ] **Step 4: Confirm both locales are complete**

Run: `grep -c "signInCta\|saveCta" packages/core/src/i18n/resources.ts`
Expected: 4 — two keys × two locales.

- [ ] **Step 5: Confirm no migration was touched**

Run: `git diff --name-only main...HEAD -- supabase/`
Expected: no output.

- [ ] **Step 6: Confirm no secrets committed**

Run: `git diff --name-only main...HEAD | grep -E "^\.env$"`
Expected: no output. `.env.example` may appear; `.env` must not.

- [ ] **Step 7: Open the PR**

```bash
git push -u origin feat/persistence-foundation
```

PR description must state: Week Intention delivers the **capture half of US-061 only**; the Intention vs Reality readback and the 4-week revised-target suggestion depend on the Sprint 3 Weekly Performance Report. Also list the two constraint gaps raised with Dev C (`chronotype_profiles`, `week_intentions`).

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §4 module layout | 1, 2, 4, 7 |
| §4.1 native dependency boundary | 1 (injected storage), 9 (injection site) |
| §4.2 routing gate | 9, 10 |
| §5 five-table mapping | 4, 6 |
| §5.1(1) chronotype uniqueness | 6 |
| §5.1(2) roles idempotency | 6 |
| §5.1(3) peak windows | 3 |
| §5.1(4) chaosAnswers left unwritten | 4 — no builder, documented in `onboardingRows.ts` |
| §5.2 failure handling + retry | 2 (Result), 11 |
| §6 Week Intention | 7, 8, 12 |
| §6.1 US-061 scope boundary | 12 note, 13 step 7 |
| §7 testing | 0, plus tests in 1–7; integration in 11, 12 |
| §8 branch DoD | 13 |

**Type consistency:** `Result<T>` is defined in Task 2 and used identically in 6, 7, 9, 12. `WizardState` comes from the existing model throughout. `UrgencyResult.scores` is added in Task 3 before Task 4 consumes it. `getIsoWeek` is defined in Task 5 before Tasks 6 and 7 use it — note Task 4's `buildGoalRow` takes `isoWeek` as a parameter rather than calling it, so the ordering holds.

**Gap found and fixed during review:** `UrgencyResult` had no `scores` field, so the 16 individual answers required by `urgency_index_assessments.q1..q16` were unreachable. Task 3 adds it.
