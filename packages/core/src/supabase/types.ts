// packages/core/src/supabase/types.ts
// Hand-written row types for the tables this package writes. Deliberately
// narrower than a generated schema — only the columns we actually set appear
// here, so a column we never touch cannot be set by accident.

export type ChronotypeType = "lion" | "bear" | "wolf" | "dolphin";

export type UrgencyProfileType =
  | "prioritizer"
  | "procrastinator"
  | "yes_man"
  | "slacker";

export interface ChronotypeProfileRow {
  user_id: string;
  assessed_type: ChronotypeType;
  peak_window_start: string | null;
  peak_window_end: string | null;
  last_assessed_at: string;
  data_source: "self_report" | "behaviour";
}

export interface UserProfilePatch {
  chronotype: ChronotypeType | null;
  planning_day: number;
}

/**
 * urgency_index_assessments. The q1_score..q16_score columns are spread in by
 * buildUrgencyRow rather than listed one by one — index signature covers them.
 */
export interface UrgencyAssessmentRow {
  user_id: string;
  assessed_at: string;
  total_score: number;
  profile_type: UrgencyProfileType;
  [question: `q${number}_score`]: number | string | undefined;
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
