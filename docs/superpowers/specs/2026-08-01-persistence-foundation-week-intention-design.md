# Persistence Foundation + Week Intention — Design

**Date:** 2026-08-01
**Owner:** Dev B (React UI)
**Sprint:** 2 (Weeks 3–4)
**Delivers:** Sprint 2 prerequisite (unticketed) + US-061 capture side

---

## 1. Why this scope

Sprint 2 gives Dev B eleven deliverables. Eight of them attach to screens that do not
exist in the repo (Today, Morning Protocol, focus session), two additionally wait on
Dev A's `context_switches` logging, and the Urgency Drift ring waits on Dev C's Edge
Function. Two pieces of work have no external dependency at all:

1. **Persistence foundation** — not on the sprint tracker, but every other Sprint 2
   item reads data that onboarding never writes.
2. **Week Intention panel (US-061)** — a standalone screen that runs *before* the
   weekly planning grid, so it needs no host screen.

They ship on one branch because Week Intention is the first real consumer of the
persistence layer, and building them together proves the layer works.

## 2. Current state

- No authentication of any kind. `apps/mobile/package.json` has no `@supabase/supabase-js`
  and there is no sign-in route.
- All 32 tables gate every policy on `auth.uid()`. Without a session, every write fails RLS.
- `WizardContext` persists to AsyncStorage only; `chronotype.tsx:44` still carries
  `// TODO: store to chronotype_profiles.assessed_type via Supabase`.
- `packages/core/src/supabase/` exists but is empty.
- No test runner in the repo, while the Definition of Done requires >80% coverage in
  `packages/core` plus happy-path and error-path integration tests.

## 3. Decisions taken

| Decision | Choice | Reason |
|---|---|---|
| Auth ownership | Dev B builds it now | Unassigned in every sprint doc; blocks all of Sprint 2 |
| Auth method | Email + password | No deep linking, which the team's Expo Go QR workflow makes fragile |
| Environment | Local Supabase now, hosted later via env vars | Migrations already in repo; no shared-state pollution |
| Onboarding write timing | Batch at completion, retry on next launch | Wizard state is already in AsyncStorage; ~30 lines vs a sync layer |
| CRDT | Not used | Handbook §4: single-device, write-once data takes plain last-write-wins upserts |

## 4. Architecture

The Definition of Done requires *"Supabase queries only in `packages/core/src/supabase/`"*.
No screen touches the client directly.

```
packages/core/src/supabase/
  client.ts        createFlowOSClient({ url, anonKey, storage }) → singleton
  auth.ts          signUp / signIn / signOut / getSession / onAuthStateChange
  onboarding.ts    syncOnboarding(userId, wizardState)
  weekIntentions.ts  saveWeekIntention / getWeekIntention
  types.ts         row types for every table touched (no `any`, strict mode)
  index.ts

packages/core/src/models/
  weekIntention.ts   WeekIntention type, ISO week helpers, validation

apps/mobile/
  context/AuthContext.tsx   session state + hydration; calls core/auth only
  app/sign-in.tsx           email + password, sign in ⇄ create account
  app/week-intention.tsx    US-061 screen
  app/_layout.tsx           routing gate
```

### 4.1 Native dependency boundary

`packages/*` must not take native dependencies — the README documents this as the cause
of the `PlatformConstants` Metro failure already fixed once. `@supabase/supabase-js` is
pure JS and belongs in `core`, but its session store needs AsyncStorage, which is native.
So `core` never imports AsyncStorage; the app injects it:

```ts
createFlowOSClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  storage: AsyncStorage,
})
```

This also lets `core` be unit-tested under plain Node with an in-memory storage stub.

`.env.example` gains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
**alongside** the existing unprefixed names, which the desktop app and Edge Functions use.
Expo only exposes `EXPO_PUBLIC_*` to client code.

### 4.2 Routing gate

`AuthProvider` wraps `WizardProvider` in `app/_layout.tsx`.

| Session | Onboarding complete | Route |
|---|---|---|
| hydrating | — | render nothing |
| none | — | `/sign-in` |
| yes | no | `/onboarding` (existing resume logic unchanged) |
| yes | yes | `/` |

Sign-out clears the `flowos.onboarding.wizardProgress` AsyncStorage key. That key is
device-global, so without this a second user on the same device resumes the first
user's half-finished wizard.

Sign-up needs no profile insert: Dev C's `on_auth_user_created` trigger creates the
`user_profiles` row, which is why that table has no INSERT policy. Onboarding always
updates an existing row.

## 5. Onboarding sync

`syncOnboarding(userId, state)` maps `WizardState` onto five tables:

| WizardState field | Table | Write |
|---|---|---|
| `chronotype` | `chronotype_profiles` | `assessed_type`, peak window, `data_source: 'self_report'`, `last_assessed_at` |
| `planningDay`, `chronotype` | `user_profiles` | update |
| `urgencyResult` | `urgency_index_assessments` | `q1..q16`, `total_score`, `profile_type` via existing `dbProfileType` |
| `mission` | `missions` | upsert — has `UNIQUE (user_id)` |
| `roles`, `firstWeekGoal` | `roles`, `goals` | roles first, then goal referencing the new `role_id` |

Writes are sequential; PostgREST offers no client-side transaction. Idempotency (§5.1)
is what makes a partial failure safe to retry.

### 5.1 Schema mismatches and how they are handled

Four gaps between the wizard model and the schema. None block, each needs a stated
resolution:

1. **`chronotype_profiles` has no `UNIQUE (user_id)`**
   (`20260703022100_addendum_new_tables.sql:112`). A retake silently creates a second
   row and later reads become ambiguous. Handled app-side with select-then-insert-or-update.
   Flagged to Dev C as a one-line migration. Note `urgency_index_assessments` correctly
   allows many rows — it stores the weekly drift score — so this is not a blanket rule.

2. **`roles` has no unique constraint.** A re-run duplicates the user's roles. Sync
   deletes this user's existing onboarding-created roles before inserting, making the
   whole function idempotent.

3. **Peak window is not derivable from the model.** `CHRONOTYPE_PROFILES[x].peakWindow`
   is a display string, and dolphin's is `"Variable"` — unparseable into `time` columns.
   Add `PEAK_WINDOWS: Record<ChronotypeName, { start: string; end: string } | null>`
   beside it, dolphin → `null`. Matches ADR-013, which gives dolphins no fixed window.

4. **`chaosAnswers` has no table.** The Chaos Mode flow collects answers that no
   migration can store. Out of scope here; raised with Francis as a scope question.
   The field is left unwritten rather than silently dropped from the model.

### 5.2 Failure handling

`syncOnboarding` returns `{ ok: true } | { ok: false, error }` and never throws into a
screen. On failure `complete.tsx` still advances the user — their data is safe in
AsyncStorage — and sets a `pendingSync` flag. `AuthProvider` retries once on next launch
when a session exists. This satisfies the DoD's "offline-first + clean sync on reconnect"
without new sync infrastructure.

## 6. Week Intention (US-061)

A standalone route reached on the user's planning day, before the weekly planning grid.

**Fields** (Addendum §5.3 and US-061):
- Q2 target percentage — slider, range 40–80, default 60
- Top 3 roles to invest in — role chips, selected from the user's `roles`, max 3
- One-sentence intention — text

**Storage** — `week_intentions`, keyed by ISO `week_number` + `year`:
`q2_target_pct`, `role_intentions_json` (array of role ids), `one_sentence_intention`.

**Idempotency** — `week_intentions` also lacks a unique constraint on
`(user_id, week_number, year)`, so editing an intention twice in one week would create
two rows. Handled the same way as §5.1(1): read the current week's row first, update if
present. Flagged to Dev C alongside the chronotype constraint.

### 6.1 Scope boundary within US-061

Three of the six acceptance criteria cannot be met in Sprint 2, because they depend on
the Weekly Performance Report, which is a Sprint 3 deliverable:

| AC | Sprint 2 |
|---|---|
| Screen opens on planning day before the grid | ✅ delivered |
| Fields as specified, stored with week + year | ✅ delivered |
| Intention vs Reality gap at top of Weekly Report | ⛔ Sprint 3 — no report exists |
| Revised-target suggestion after 4 weeks under-delivery | ⛔ Sprint 3 — needs report + 4 weeks data |
| Voice input on the intention field | ⛔ deferred — no speech infrastructure until Morning Protocol |

So this delivers the **capture and storage half** of US-061. The readback half belongs
to Sprint 3. The ticket should not be closed on this branch; it should be split or
carried. Stating it here so it is not discovered at sprint review.

## 7. Testing

The repo has no test runner. This branch lands the first one.

- **Runner:** Vitest in `packages/core`, Node environment.
- **Unit** — pure mapping and scoring logic against a mocked client: `WizardState` →
  each of the five table payloads, `PEAK_WINDOWS` including the dolphin null case,
  ISO week derivation across a year boundary, Q2 target clamping to 40–80,
  role selection capped at 3.
- **Integration** — against local Supabase, the DoD-required pair:
  happy path (sign up → complete onboarding → rows land in all five tables) and
  error path (write with no session → RLS rejection surfaces as `{ ok: false }`,
  never an unhandled throw).
- **Idempotency** — running `syncOnboarding` twice produces one row per table, not two.
  This is the regression test for §5.1(1) and (2).

Coverage target is >80% in `packages/core` per the DoD. UI screens are not covered by
this target; `packages/core` holds the logic precisely so it is testable.

## 8. Definition of Done for this branch

- [ ] Supabase queries live only in `packages/core/src/supabase/`
- [ ] No `any` types in `packages/core`; strict mode passes
- [ ] All new strings keyed in i18next, EN **and** NL
- [ ] No hardcoded colors, spacing, or fonts — tokens from `@flowos/ui-shared`
- [ ] No secrets committed; `.env.local` untouched by the pre-commit hook
- [ ] Offline path verified in airplane mode; sync completes on reconnect
- [ ] Unit + integration tests pass; `packages/core` coverage >80%
- [ ] Tested on iOS Simulator and Expo Go
- [ ] No schema changes authored here — constraint gaps raised with Dev C instead

## 9. Out of scope

Explicitly not in this branch: the Today screen, Morning Protocol, focus-session UI,
the Urgency Drift ring, the energy impact selector, Automerge CRDT, and any migration
edits to Dev C's tables.

## 10. Open questions for the team

1. **Auth ownership** — confirmation that Dev B building sign-in is acceptable, or
   reassignment. (Francis)
2. **Missing host screens** — are Today, Morning Protocol, and the focus-session flow
   Dev B's scope? Eight Sprint 2 items depend on the answer. (Francis)
3. **Chaos Mode storage** — new table, or derive into roles and discard? (Francis)
4. **Unique constraints** on `chronotype_profiles` and `week_intentions`. (Dev C)
5. **US-061 split** — carry the readback half to Sprint 3, or reopen the ticket there?
