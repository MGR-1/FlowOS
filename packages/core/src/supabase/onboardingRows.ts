// packages/core/src/supabase/onboardingRows.ts
// Pure WizardState -> row mappers. No I/O, so the mapping logic is fully
// unit-testable without a database. onboarding.ts does the writing.
//
// Note: WizardState.chaosAnswers has no builder here. There is no chaos-mode
// table in any migration, so the answers cannot be persisted. Raised with
// Francis as a scope question rather than silently dropped.

import { PEAK_WINDOWS, type WizardState } from "../models/onboarding";
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
