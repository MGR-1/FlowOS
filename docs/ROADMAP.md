# FlowOS Roadmap

**Single source of truth for what is built, what is next, and what is blocked.**

Last verified against the repository: **2026-08-11**

> **How to use this.** Every line was checked against the code, not copied from a plan.
> If this file and a spec document disagree, this file describes reality and the difference
> is called out. Change it in a pull request like any other file — that way the roadmap is
> reviewed, dated, and can never quietly drift.

| | Meaning |
|---|---|
| ✅ | Done and verified in the repository |
| 🔄 | In progress |
| ⬜ | Not started, not blocked — someone can pick it up today |
| 🚫 | Blocked — see the reason |
| ❓ | Needs a decision before anyone can start |

---

## Where we are right now

| | |
|---|---|
| Database | 32 tables migrated, RLS + policies + grants |
| Edge Functions | **0 written** |
| Desktop app | **Not started** — `apps/desktop/` contains one `.gitkeep` |
| Mobile app | Onboarding, sign-in, Week Intention |
| Web app | Login, Today, Sidebar, Rings |
| Tests | 90 passing, 84% coverage in `packages/core` |

**The critical path is the Tauri scaffold.** Nothing else Dev A owns can start until it exists,
and it blocks the context-switch logging and dictation work that Dev B depends on.

---

## Decisions needed

These block real work and are not tasks anyone can pick up.

| # | Question | Owner |
|---|---|---|
| 1 | ❓ **Is mobile or web the primary app?** Both now have a login and a Today screen, with two separate Supabase clients reading different environment variables. Screen work risks being done twice. | Francis |
| 2 | ❓ **Who owns the Morning Protocol screen?** Five Sprint 2 items sit on it; it is in no one's task list. | Francis |
| 3 | ❓ **Chaos Mode answers have no table.** The flow collects them and they are discarded. New table, or derive and discard? | Francis |
| 4 | ❓ **Does the hosted database match `supabase/migrations/`?** The repo has 32 tables with `workspace_id` on 5 of them. The last team update described 27 tables with it on all. | Dev C |
| 5 | ❓ **Primary teal is `#1D9E75` in the design docs but absent from `@flowos/ui-shared`.** Tokens use blue `#5B8DEF`. One of the two needs to change before more UI is built. | Francis |
| 6 | ❓ **Two lockfiles at the repo root.** `package-lock.json` was generated from a different `package.json`; `npm ci` fails and `vite build` never runs. | Francis |
| 7 | ❓ **16 specified items are missing from the sprint tracker** (below, marked *not on tracker*). They should be added so the sprint's real size is visible. | Karl |

---

## Sprint 1 — Foundation & Onboarding

### Done

- ✅ Monorepo scaffolded — `apps/`, `packages/`, `supabase/`
- ✅ Design tokens and shared components — Button, Badge, OptionCard, RingCard — *Dev B*
- ✅ Database schema, 32 tables, RLS with 4 policies each — *Dev C*
- ✅ Table grants so the app can actually read and write — *PR #20*
- ✅ 9-step onboarding wizard, resumes if the app closes mid-flow — *Dev B*
- ✅ Chronotype assessment, planning day, 16-question Urgency Index — *Dev B*
- ✅ Chaos Mode intake flow — *Dev B*
- ✅ EN + NL translation, enforced by a test — *Dev B*
- ✅ Email sign-in and session gate — *PR #20*
- ✅ Onboarding results persist to 6 tables, with offline retry — *PR #20*
- ✅ Test infrastructure — Vitest, 90 tests — *PR #20*

### Outstanding

- 🔄 Day timeline view — exists, still on mock data — *Dev B*
- ⬜ Urgency Index retake from Settings + Day-3 nudge if skipped — *Dev B* — US-059 is marked Sprint 1+2
- ⬜ Pre-commit hook installed — *All*
- ⬜ `.env.local` filled in — *All*
- ⬜ Apple FamilyControls entitlement application — *Dev A*
- 🔄 Azure Portal app registration — *Dev C*
- ⬜ Garmin Health API Partner Program application — *Dev C*
- 🚫 Chaos Mode storage — blocked on decision 3

---

## Sprint 2 — Performance Layer & Biometrics

**Current sprint.** Mylano: *"get the performance layer and app blocking solid before touching other sprints work."*

### Dev A — Mac / Tauri

- 🚫 **Tauri scaffold + global shortcut plugin** — *nothing exists yet; blocks everything below*
- 🚫 SQLite via better-sqlite3
- 🚫 Automerge CRDT sync engine
- 🚫 ScreenCaptureKit audio capture plugin
- 🚫 whisper.cpp on-device transcription
- 🚫 NSWorkspace app-switch logging → `context_switches` — *blocks two Dev B items*
- 🚫 Context switch cost calculation
- 🚫 Verify last-mac-activity-time → `circadian_events`
- 🚫 Distraction Shield, Focus Rhythm engine, NSDR timer, Work Shutdown Ritual
- 🚫 Dictation overlay window + Option+Space shortcut — *not on tracker*
- 🚫 AVFoundation mic capture Rust FFI — *not on tracker*
- 🚫 Accessibility API text insertion + shortcut conflict detection — *not on tracker*

### Dev B — React UI

- ✅ Week Intention panel, capture side — US-061. **Do not close the ticket**; the intention-vs-reality view needs the Sprint 3 report
- ⬜ **Today screen on real Supabase data** — MIT section, role cards — *next up, unblocks the two below*
- ⬜ Urgency Drift ring on Today + Weekly Planning, 7-week trend — US-060 — *ring can be built now with an empty state*
- ⬜ Energy impact selector on task cards
- ⬜ **Cursor Glow effect** — app-wide radial glow — *not on tracker; assigned to Dev B for Sprint 2 in its own addendum*
- ⬜ Settings › Voice & Dictation screen — US-076 — *not on tracker*
- ⬜ `DictationContextId` provider wired across all screens — *not on tracker*
- ⬜ Dictation History UI, last 20 sessions — *not on tracker*
- 🚫 Dictation overlay React component — waits on Dev A's overlay window — *not on tracker*
- 🚫 Morning Protocol: voice capture, wearable pre-fill, circadian display, supplement log, chronotype match ring — *five items, no host screen, decision 2*
- 🚫 Context Switch Cost card — waits on Dev A
- 🚫 Environment tag quick-select — waits on a focus session screen

### Dev C — iOS / Supabase

- 🔄 Open Wearables deployment — Railway approved. *Currently local behind a Cloudflare quick tunnel, whose hostname changes on every restart — an OAuth redirect URI registered against it will break*
- ⬜ Oura OAuth + journal auto-map to `nutrition_logs`
- ⬜ Whoop OAuth + journal auto-import
- ⬜ Whoop extended data — sleep stages, SpO2, respiratory rate — *not on tracker*
- ⬜ Apple HealthKit integration
- ⬜ `daily_readiness` additive column extension — *not on tracker*
- ⬜ Energy Budget three-option consent model
- ⬜ FamilyControls iOS app blocking
- ⬜ AVAudioSession iPhone meeting recording
- ⬜ Screen Time API — last screen touch → `circadian_events`
- ⬜ **Urgency Drift Score Edge Function** — *blocks the Dev B ring*
- ⬜ Supplement log Edge Function
- ⬜ Auth flows — Google OAuth, Sign in with Apple, Magic Link — *overlaps the email sign-in in PR #20; that screen should be replaced by these*
- ⬜ Scheduling links public lookup via Edge Function
- ⬜ iOS keyboard mic button + SFSpeechRecognizer — *not on tracker*

---

## Sprint 3 — Weekly Performance Report

- ⬜ Weekly Performance Report Edge Function — *Dev C* — US-012
- ⬜ `performance_reports` table + RLS — *Dev C* — *not on tracker; may duplicate the existing `weekly_performance_reports`*
- ⬜ `biometric_journal_entries` table + RLS — *Dev C* — *not on tracker*
- ⬜ Sentiment Edge Function — *Dev C*
- ⬜ HTML email template via Resend — *Dev C*
- ⬜ Apple Health biomarker auto-import, 8 markers — *Dev C* — US-044
- ⬜ `can_view_performance_report` PA toggle — *Dev C*
- ⬜ Chronotype detection engine, behavioural after 30 days — *Dev C* — US-045
- ⬜ MCP server `get_performance_context` tool — *Dev A*
- ⬜ Performance › Patterns screen scaffold — *Dev B*
- ⬜ Weekly Performance Report War Room view — *Dev B* — *the Performance Report addendum says Sprint 4; the tracker says Sprint 3*
- ⬜ Narrative view toggle, correlation insights, concept week — *Dev B*
- ⬜ Ring animation on report open — *Dev B*
- ⬜ Shareable progress card generator — *Dev B* — US-073
- ⬜ Biomarker entry UI + trend chart, biometric summary + empty state — *Dev B*
- ⬜ Biometric Journal UI + journal settings screen — *Dev B* — US-071 — *not on tracker*
- ⬜ Sentiment score storage extension — *Dev B*

**This sprint completes US-061.** The week intention captured in Sprint 2 has nothing to be
compared against until the report exists.

---

## Sprint 4 — Predictive & Pattern Analytics

- ⬜ Tomorrow Performance Forecast — *Dev B + C* — US-056 — needs 90 days of data
- ⬜ Cognitive Load Curve — US-085 · Week Type classification — US-088
- ⬜ Deadline Pressure Curve · HRV × Investment Score correlation
- ⬜ Environment performance comparison · Ultradian Performance chart
- ⬜ Auto-pilot v2 — *Dev B*
- ⬜ Performance Report generation via Claude Haiku — *Dev B + C*
- ⬜ Billable hours export — *Dev C* · Scheduling links — *Dev A + C*

## Sprint 5 — Long-cycle & Integrations

- ⬜ Quarterly Biological Cycle — US-089 · Social energy drain analysis
- ⬜ Sentiment trend analysis — US-063
- ⬜ Live task sync — Asana, Jira, Linear — *Dev C*
- ⬜ Obsidian + Notion export · Free up calendar agent — *Dev C*
- ⬜ Apple Watch complication — *Dev A* · Team workspace CRDT — *Dev A + B*

## Sprint 6 — QA & Compliance

- ⬜ QA passes: Urgency Index, chronotype detection, context switch logging, voice check-in,
  weekly report, biomarker import, tomorrow forecast, privacy toggles across all 9 tables
- ⬜ Ring animations at 60fps on M2 MacBook, iPhone 14, iPhone 12
- ⬜ Right-to-deletion endpoint + GDPR deletion QA — *Dev C*
- ⬜ Verify all Supabase data resides in EU-West Frankfurt
- ⬜ Confirm Stripe dashboard configuration finalised

---

## Definition of Done

Every pull request must satisfy all of these before review.

- [ ] Acceptance criteria met, manually tested end to end
- [ ] Supabase queries only in `packages/core/src/supabase/`
- [ ] No `any` in `packages/core`; strict mode passes
- [ ] Colours, spacing and type from `@flowos/ui-shared` — nothing hardcoded
- [ ] Every string keyed in i18next, EN **and** NL
- [ ] Unit tests above 80% in `packages/core`; integration happy path + error path
- [ ] New table: RLS, 4 policies, **and a grant** — all tested
- [ ] Migration file with sequential timestamp; `supabase db reset` succeeds
- [ ] Schema changes additive only
- [ ] Offline-first; clean sync on reconnect
- [ ] No secrets in code or git history; OAuth tokens in the OS keychain
- [ ] Webhooks verify signatures; uploads use signed URLs
- [ ] Tested on Mac, iOS Simulator, and in airplane mode

> **On grants:** the original checklist said "RLS + 4 policies tested". That is not sufficient.
> Every table had correct policies and was still unreachable, because policies narrow access
> rather than granting it. A new table needs a `GRANT` too.

---

## Keeping this true

Two rules. Both cost nothing and are the reason this file can be depended on.

1. **A spec document is not finished until its items are on this roadmap.** Sixteen items were
   specified in the Cursor Glow, Voice Dictation and Performance Report addenda and never
   reached the tracker — which is how a sprint came to be planned against roughly 12% less work
   than it actually contained.

2. **Update this file in the same pull request as the work.** Status that is updated separately
   is status that goes stale. If a PR finishes a line here, it should tick it here.
