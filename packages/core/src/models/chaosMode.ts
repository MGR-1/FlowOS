// packages/core/src/models/chaosMode.ts
// Source of truth: FlowOS Onboarding Wizard Spec v1.0 §5 (Chaos-Mode Sub-Flow)
// Replaces standard steps 4 (Mission), 5 (First Week Goal), and 8 (Import)
// with a 5-question flow, then hands off to Claude Haiku to build the
// workspace (mission, roles, first-week goals).

import { colors } from "@flowos/ui-shared";
import type { RoleSuggestion } from "./onboarding";

const ROLE_COLOR_CYCLE = [
  colors.role.violet,
  colors.role.blue,
  colors.role.teal,
  colors.role.amber,
  colors.role.gray,
];

// --- The 5 Chaos-mode questions (spec §5) ---

export type ChaosAreaKey =
  | "work"
  | "clients"
  | "health"
  | "family"
  | "finances"
  | "learning"
  | "side_projects"
  | "admin"
  | "team"
  | "creative"
  | "community"
  | "rest";

export const CHAOS_AREA_OPTIONS: ChaosAreaKey[] = [
  "work",
  "clients",
  "health",
  "family",
  "finances",
  "learning",
  "side_projects",
  "admin",
  "team",
  "creative",
  "community",
  "rest",
];

export type ChaosFrictionKey =
  | "tracking_time"
  | "meeting_notes"
  | "planning_day"
  | "remembering"
  | "saying_no";

export const CHAOS_FRICTION_OPTIONS: ChaosFrictionKey[] = [
  "tracking_time",
  "meeting_notes",
  "planning_day",
  "remembering",
  "saying_no",
];

export interface ChaosAnswers {
  currentFocus: string; // Q1 — freeform
  lifeAreas: ChaosAreaKey[]; // Q2 — multi-select, 3-5 areas
  weekPriority: string; // Q3 — freeform
  frictionPoints: ChaosFrictionKey[]; // Q4 — multi-select
  structureLevel: number; // Q5 — slider 1-5
}

export const INITIAL_CHAOS_ANSWERS: ChaosAnswers = {
  currentFocus: "",
  lifeAreas: [],
  weekPriority: "",
  frictionPoints: [],
  structureLevel: 3,
};

export function isChaosAnswersValid(answers: ChaosAnswers): boolean {
  return (
    answers.currentFocus.trim().length > 0 &&
    answers.lifeAreas.length >= 3 &&
    answers.lifeAreas.length <= 5 &&
    answers.weekPriority.trim().length > 0
  );
}

// --- Claude Haiku hand-off (spec §5) ---
//
// TODO: replace with a real Claude Haiku call via packages/core/src/ai/client.ts
// once ANTHROPIC_API_KEY routing lands (Developer Handbook §7.4 / §2.3).
// The prompt contract per spec: given the 5 answers, return
// { mission_statement, roles[3-5], first_week_goals[2-3] }.
// This mock keeps the exact same output shape so swapping in the real call
// later doesn't require touching the UI.

export interface ChaosGeneratedGoal {
  roleIndex: number;
  text: string;
}

export interface ChaosGeneratedWorkspace {
  missionStatement: string;
  roles: RoleSuggestion[];
  firstWeekGoals: ChaosGeneratedGoal[];
}

const AREA_TO_ROLE_NAME: Record<ChaosAreaKey, string> = {
  work: "Work",
  clients: "Clients",
  health: "Health",
  family: "Family",
  finances: "Finances",
  learning: "Learning",
  side_projects: "Side Projects",
  admin: "Admin",
  team: "Team",
  creative: "Creative",
  community: "Community",
  rest: "Rest",
};

function monogramFor(name: string, taken: Set<string>): string {
  const base = name.slice(0, 1).toUpperCase();
  if (!taken.has(base)) return base;
  const alt = name.slice(0, 2).toUpperCase();
  return taken.has(alt) ? `${base}${taken.size}` : alt;
}

export async function generateChaosWorkspace(
  answers: ChaosAnswers
): Promise<ChaosGeneratedWorkspace> {
  // Simulated latency to match the spec's "3-5 second" build screen animation.
  await new Promise((resolve) => setTimeout(resolve, 3200));

  const takenMonograms = new Set<string>();
  const roles: RoleSuggestion[] = answers.lifeAreas.map((area, i) => {
    const name = AREA_TO_ROLE_NAME[area];
    const monogram = monogramFor(name, takenMonograms);
    takenMonograms.add(monogram);
    return {
      monogram,
      name,
      color: ROLE_COLOR_CYCLE[i % ROLE_COLOR_CYCLE.length],
    };
  });

  const missionStatement = answers.currentFocus.trim();

  const primaryRoleIndex = 0;
  const firstWeekGoals: ChaosGeneratedGoal[] = [
    { roleIndex: primaryRoleIndex, text: answers.weekPriority.trim() },
  ];

  return { missionStatement, roles, firstWeekGoals };
}
