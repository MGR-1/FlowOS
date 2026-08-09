// packages/core/src/supabase/weekIntentions.ts
// US-061 Week Intention storage.
//
// week_intentions has no UNIQUE (user_id, week_number, year), so editing an
// intention twice in one week would create two rows. Read-then-update, the
// same pattern as chronotype_profiles. Raised with Dev C as a migration.

import { getFlowOSClient } from "./client";
import { ok, err, errorMessage, type Result } from "./result";
import { getIsoWeek } from "../models/isoWeek";
import type { WeekIntentionRow } from "./types";

/** US-061: the Q2 target slider runs 40-80%. */
export const Q2_TARGET_MIN = 40;
export const Q2_TARGET_MAX = 80;
export const Q2_TARGET_DEFAULT = 60;
/** US-061: "top 3 roles to invest in". */
export const MAX_INTENTION_ROLES = 3;

export interface WeekIntentionInput {
  q2TargetPct: number;
  roleIds: string[];
  intention: string;
}

export interface RoleOption {
  id: string;
  name: string;
}

export function clampQ2Target(pct: number): number {
  return Math.min(Q2_TARGET_MAX, Math.max(Q2_TARGET_MIN, Math.round(pct)));
}

export function capRoleIds(ids: string[]): string[] {
  return Array.from(new Set(ids)).slice(0, MAX_INTENTION_ROLES);
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
    return err(errorMessage(e, "Could not save your intention."));
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
    return err(errorMessage(e, "Could not load your intention."));
  }
}

/** Active roles for the intention role chips, in the user's own order. */
export async function listRoles(userId: string): Promise<Result<RoleOption[]>> {
  try {
    const { data, error } = await getFlowOSClient()
      .from("roles")
      .select("id, name")
      .eq("user_id", userId)
      .eq("active", true)
      .order("order_index");
    if (error) return err(error.message);
    return ok((data ?? []) as RoleOption[]);
  } catch (e) {
    return err(errorMessage(e, "Could not load your roles."));
  }
}
