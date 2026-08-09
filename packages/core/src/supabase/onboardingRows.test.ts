import { describe, it, expect } from "vitest";
import {
  buildChronotypeRow,
  buildUserProfilePatch,
  buildUrgencyRow,
  buildRoleRows,
  buildGoalRow,
} from "./onboardingRows";
import {
  INITIAL_WIZARD_STATE,
  scoreUrgencyIndex,
  type WizardState,
} from "../models/onboarding";

const NOW = "2026-08-06T09:00:00.000Z";
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
    const row = buildChronotypeRow(
      USER,
      stateWith({ chronotype: "dolphin" }),
      NOW
    );
    expect(row?.peak_window_start).toBeNull();
    expect(row?.peak_window_end).toBeNull();
    expect(row?.assessed_type).toBe("dolphin");
  });

  it("returns null when no chronotype was chosen", () => {
    expect(
      buildChronotypeRow(USER, stateWith({ chronotype: null }), NOW)
    ).toBeNull();
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
    expect(row?.q8_score).toBe(2);
    expect(row?.q16_score).toBe(4);
    expect(row?.total_score).toBe(34);
    expect(row?.assessed_at).toBe(NOW);
    expect(row?.user_id).toBe(USER);
  });

  it("writes a DB-legal profile_type", () => {
    const row = buildUrgencyRow(
      USER,
      stateWith({ urgencyResult: scoreUrgencyIndex(new Array(16).fill(0)) }),
      NOW
    );
    expect(row?.profile_type).toBe("prioritizer");
  });

  it("returns null when the user skipped the assessment", () => {
    expect(
      buildUrgencyRow(USER, stateWith({ urgencyResult: null }), NOW)
    ).toBeNull();
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

  it("returns an empty array when there are no roles", () => {
    expect(buildRoleRows(USER, stateWith({ roles: [] }))).toEqual([]);
  });
});

describe("buildGoalRow", () => {
  it("builds a weekly goal tied to a role", () => {
    const row = buildGoalRow(
      USER,
      stateWith({ firstWeekGoal: { roleIndex: 0, text: "Ship the wizard" } }),
      "role-abc",
      { week: 32, year: 2026 }
    );
    expect(row).toEqual({
      user_id: USER,
      role_id: "role-abc",
      text: "Ship the wizard",
      timeframe: "week",
      done: false,
      week_number: 32,
      year: 2026,
    });
  });

  it("returns null when the goal text is blank", () => {
    const row = buildGoalRow(
      USER,
      stateWith({ firstWeekGoal: { roleIndex: 0, text: "   " } }),
      "role-abc",
      { week: 32, year: 2026 }
    );
    expect(row).toBeNull();
  });

  it("allows a goal with no role attached", () => {
    const row = buildGoalRow(
      USER,
      stateWith({ firstWeekGoal: { roleIndex: null, text: "Rest more" } }),
      null,
      { week: 32, year: 2026 }
    );
    expect(row?.role_id).toBeNull();
    expect(row?.text).toBe("Rest more");
  });
});
