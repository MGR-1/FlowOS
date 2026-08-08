# FlowOS Staging Performance Features

## Scope

This document covers the approval-independent performance features implemented on the `staging` branch:

- Focus Rhythm Engine
- NSDR Recovery Timer
- Work Shutdown Ritual
- Morning Protocol Sequencer
- Investment Score calculation
- Daily, weekly, and monthly reflections

The implementation is intentionally frontend-agnostic. Product UI lives in a separate repository and should consume the exported domain functions from `@flowos/core`.

## Architecture

Business rules live under `packages/core/src`. They are pure TypeScript and do not depend on React, Expo, Tauri, Supabase clients, Apple entitlements, or third-party API credentials. Persistence is defined through an additive Supabase migration.

### Focus Rhythm

`performance/focusRhythm.ts` provides a reducer-driven focus cycle.

- Focus durations: 45, 60, 75, 90, or 120 minutes
- Default cycle: 90 minutes focus and 20 minutes recovery
- States: idle, focus, break, and paused
- Actions: start, pause, resume, tick, reset, skip break, and change duration
- Recommendation: selects a preferred duration after 10 completed sessions

The existing Today-screen card remains as a reference integration. New frontend work should be implemented in the dedicated frontend repository.

### NSDR Recovery Timer

`performance/nsdr.ts` provides a deterministic timer for 10, 15, or 20 minute NSDR sessions. It supports start, pause, resume, reset, and completion timestamps. Clients are responsible for notification blocking and completion audio because those capabilities are platform-specific.

### Morning Protocol

`performance/morningProtocol.ts` defines the default protocol:

1. Daylight check-in
2. Hydration
3. Caffeine-delay start (optional)
4. Movement

The shared sequencer supports ordered progress, required steps, optional skips, completion, and one-tap override. The configuration model includes the MIT lock policy, but enforcement belongs to the consuming application.

### Shutdown Ritual

`performance/shutdownRitual.ts` defines the default 17:30 ritual:

1. Review open tasks
2. Clear the inbox
3. Review tomorrow's calendar
4. Write a one-sentence day summary

A shutdown is considered complete only when all required steps are complete and a non-empty day summary is present.

### Investment Score

`performance/investmentScore.ts` calculates:

`Investment Score = investment minutes / all valid tracked minutes × 100`

Invalid or negative intervals are ignored. Results include the rounded score, total investment minutes, total tracked minutes, and a per-zone breakdown for investment, maintenance, reactive, and waste time.

### Reflections

`reflections/reflections.ts` provides structured prompts and validation for:

- Daily reflection: what went well, what to change, and optional gratitude
- Weekly reflection: progress, patterns, and what to protect next week
- Monthly reflection: outcomes, role balance, time returned, and next-month changes

AI summaries are stored as optional output. Generating them is deliberately separate from reflection capture so the core flow works without external AI credentials.

## Database Migration

Migration `20260808170000_performance_core.sql` adds:

- `performance_protocol_configs`
- `performance_protocol_runs`
- `nsdr_sessions`
- `tracked_intervals`
- `reflection_entries`

Every table uses row-level security with `user_id = auth.uid()`. The migration is additive and does not remove or rename existing columns or tables. Existing legacy reflection and morning-protocol tables remain untouched.

## Frontend Integration Contract

Import features from `@flowos/core` and keep display/state adapters in the frontend repository. The frontend should:

- run timer ticks at one-second intervals;
- persist reducer state between app restarts;
- write completed sessions and protocol runs to Supabase;
- enforce the Morning Protocol MIT lock while preserving the override;
- request platform notification or focus permissions only in platform adapters;
- calculate Investment Score from the selected reporting period;
- submit reflection answers only after `validateReflection()` returns no errors.

## Verification

Automated tests cover timer transitions, paused states, required and optional protocol steps, override behavior, shutdown completion, Investment Score calculation, empty periods, and reflection validation. Run:

```bash
pnpm test
pnpm build
pnpm exec tsc --noEmit
```

Supabase migration execution still requires a configured local Supabase environment with Docker.
