// packages/core/src/supabase/onboarding.ts
// Batch-writes the finished wizard to Supabase. Called once from the wizard's
// completion screen, and retried on next launch if it failed (design spec §5.2).
//
// Writes are sequential — PostgREST has no client-side transaction — so this
// function is written to be idempotent instead: running it twice leaves one
// row per table, not two. That is what makes the retry safe.

import { getFlowOSClient } from "./client";
import { ok, err, errorMessage, type Result } from "./result";
import { getIsoWeek } from "../models/isoWeek";
import type { WizardState } from "../models/onboarding";
import {
  buildChronotypeRow,
  buildGoalRow,
  buildRoleRows,
  buildUrgencyRow,
  buildUserProfilePatch,
} from "./onboardingRows";

export async function syncOnboarding(
  userId: string,
  state: WizardState,
  now: Date = new Date()
): Promise<Result> {
  const nowIso = now.toISOString();
  const isoWeek = getIsoWeek(now);

  try {
    const db = getFlowOSClient();

    // --- chronotype_profiles --------------------------------------------
    // This table has no UNIQUE (user_id), so upsert would insert a duplicate
    // on a retake. Select first, then update or insert. Raised with Dev C as
    // a one-line migration; handled here so we are not blocked on it.
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

    // --- user_profiles ---------------------------------------------------
    // The row already exists: Dev C's on_auth_user_created trigger creates it
    // at signup, which is why this table has no INSERT policy. Always update.
    const profile = await db
      .from("user_profiles")
      .update(buildUserProfilePatch(state))
      .eq("user_id", userId);
    if (profile.error) return err(profile.error.message);

    // --- urgency_index_assessments ---------------------------------------
    // Many rows per user is correct here — this table also stores the weekly
    // drift score — so a plain insert is right, not an upsert.
    const urgencyRow = buildUrgencyRow(userId, state, nowIso);
    if (urgencyRow) {
      const urgency = await db
        .from("urgency_index_assessments")
        .insert(urgencyRow);
      if (urgency.error) return err(urgency.error.message);
    }

    // --- missions ---------------------------------------------------------
    // Has UNIQUE (user_id), so a real upsert works here.
    const mission = state.mission.trim();
    if (mission) {
      const written = await db.from("missions").upsert(
        { user_id: userId, text: mission, updated_at: nowIso },
        { onConflict: "user_id" }
      );
      if (written.error) return err(written.error.message);
    }

    // --- roles + goals -----------------------------------------------------
    // roles has no unique constraint, so a blind insert would duplicate on a
    // retry. Deleting first is not an option either: goals.role_id references
    // roles with no ON DELETE rule, so the delete raises a foreign-key
    // violation once a goal exists — and tasks and time_blocks will reference
    // roles too. So: seed roles only when the user has none. Onboarding
    // creates the initial set; a retry finds them and moves on.
    const roleRows = buildRoleRows(userId, state);
    let roleIds: string[] = [];

    if (roleRows.length > 0) {
      const existing = await db
        .from("roles")
        .select("id")
        .eq("user_id", userId)
        .order("order_index");
      if (existing.error) return err(existing.error.message);

      const existingIds = (existing.data ?? []) as { id: string }[];

      if (existingIds.length > 0) {
        roleIds = existingIds.map((r) => r.id);
      } else {
        const inserted = await db.from("roles").insert(roleRows).select("id");
        if (inserted.error) return err(inserted.error.message);
        roleIds = ((inserted.data ?? []) as { id: string }[]).map((r) => r.id);
      }
    }

    // --- goals -------------------------------------------------------------
    // Same reasoning: one first-week goal per user per ISO week. Check before
    // inserting so a retry does not stack duplicates.
    const roleIndex = state.firstWeekGoal.roleIndex;
    const roleId =
      roleIndex !== null && roleIds[roleIndex] ? roleIds[roleIndex] : null;

    const goalRow = buildGoalRow(userId, state, roleId, isoWeek);
    if (goalRow) {
      const existingGoal = await db
        .from("goals")
        .select("id")
        .eq("user_id", userId)
        .eq("timeframe", "week")
        .eq("week_number", isoWeek.week)
        .eq("year", isoWeek.year)
        .maybeSingle();
      if (existingGoal.error) return err(existingGoal.error.message);

      if (!existingGoal.data) {
        const goal = await db.from("goals").insert(goalRow);
        if (goal.error) return err(goal.error.message);
      }
    }

    return ok();
  } catch (e) {
    return err(errorMessage(e, "Could not save your setup."));
  }
}
