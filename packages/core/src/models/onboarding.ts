// packages/core/src/models/onboarding.ts
// Source of truth: FlowOS Onboarding Wizard Spec v1.0
import { colors } from "@flowos/ui-shared";
import type { ChaosAnswers } from "./chaosMode";

const { violet, blue, teal, amber, gray } = colors.role;

// --- Chronotype (Step 3, Addendum §4.2, Breus methodology) ---

export type ChronotypeName = "lion" | "bear" | "wolf" | "dolphin";

export interface ChronotypeProfile {
  type: ChronotypeName;
  label: string;
  monogram: string;
  peakWindow: string;
  description: string; // exact copy from spec
}

export const CHRONOTYPE_PROFILES: Record<ChronotypeName, ChronotypeProfile> = {
  lion: {
    type: "lion",
    label: "Lion",
    monogram: "L",
    peakWindow: "08:00 – 12:00",
    description:
      "You peak early. Cognitive load hits its ceiling before noon. FlowOS will schedule your hardest work in the morning window.",
  },
  bear: {
    type: "bear",
    label: "Bear",
    monogram: "B",
    peakWindow: "10:00 – 14:00",
    description:
      "You track the sun. Best focus is mid-morning to early afternoon. This is the most common chronotype — FlowOS defaults to this rhythm.",
  },
  wolf: {
    type: "wolf",
    label: "Wolf",
    monogram: "W",
    peakWindow: "17:00 – 21:00",
    description:
      "You come alive later. Mornings are for warmup, afternoons and evenings for deep work. FlowOS will protect your late focus window.",
  },
  dolphin: {
    type: "dolphin",
    label: "Dolphin",
    monogram: "D",
    peakWindow: "Variable",
    description:
      "You're a light, restless sleeper. Focus comes in bursts — usually mid-morning and again in the early evening. FlowOS will plan around them.",
  },
};

// Exact questions + options from spec (Breus methodology)
export interface ChronotypeOption {
  label: string;
  value: ChronotypeName;
}

export interface ChronotypeQuestion {
  id: string;
  text: string;
  options: ChronotypeOption[];
}

export const CHRONOTYPE_QUESTIONS: ChronotypeQuestion[] = [
  {
    id: "cq1",
    text: "On a free day (no alarm), what time do you wake up naturally?",
    options: [
      { label: "Before 6:00", value: "lion" },
      { label: "6:00 – 8:00", value: "bear" },
      { label: "8:00 – 10:00", value: "wolf" },
      { label: "After 10:00", value: "dolphin" },
    ],
  },
  {
    id: "cq2",
    text: "When do you feel most alert during a normal day?",
    options: [
      { label: "Early morning", value: "lion" },
      { label: "Mid-morning", value: "bear" },
      { label: "Afternoon", value: "wolf" },
      { label: "Late evening", value: "dolphin" },
    ],
  },
  {
    id: "cq3",
    text: "What time do you naturally want to fall asleep?",
    options: [
      { label: "Before 22:00", value: "lion" },
      { label: "22:00 – 00:00", value: "bear" },
      { label: "00:00 – 02:00", value: "wolf" },
      { label: "After 02:00", value: "dolphin" },
    ],
  },
  {
    id: "cq4",
    text: "How do you feel about mornings, honestly?",
    options: [
      { label: "Love them", value: "lion" },
      { label: "Fine", value: "bear" },
      { label: "Hard", value: "wolf" },
      { label: "Painful", value: "dolphin" },
    ],
  },
];

// Ties break: Bear → Lion → Wolf → Dolphin (per spec)
const TIE_BREAK_ORDER: ChronotypeName[] = ["bear", "lion", "wolf", "dolphin"];

export function detectChronotype(answers: ChronotypeName[]): ChronotypeName {
  const counts: Record<ChronotypeName, number> = {
    lion: 0,
    bear: 0,
    wolf: 0,
    dolphin: 0,
  };
  answers.forEach((a) => counts[a]++);
  const maxCount = Math.max(...Object.values(counts));
  // Among tied winners, pick by tie-break order
  return TIE_BREAK_ORDER.find((t) => counts[t] === maxCount) ?? "bear";
}

// --- Profile Template (Step 2) ---

export type ProfileTemplate =
  | "founder"
  | "lawyer"
  | "consultant"
  | "manager"
  | "student"
  | "custom"
  | "chaos";

export interface RoleSuggestion {
  monogram: string;
  name: string;
  color: string;
}

export interface ProfileTemplateOption {
  value: ProfileTemplate;
  label: string;
  description: string;
  roles: RoleSuggestion[];
  isChaos?: boolean;
}

export const PROFILE_TEMPLATES: ProfileTemplateOption[] = [
  {
    value: "founder",
    label: "Founder",
    description: "Multiple projects, no boss, decisions all day.",
    roles: [
      { monogram: "B", name: "Build", color: violet },
      { monogram: "G", name: "Grow", color: blue },
      { monogram: "P", name: "Partner", color: teal },
      { monogram: "H", name: "Health", color: amber },
      { monogram: "L", name: "Learn", color: gray },
    ],
  },
  {
    value: "lawyer",
    label: "Lawyer",
    description: "Billable hours, client cases, meetings all day.",
    roles: [
      { monogram: "C", name: "Cases", color: violet },
      { monogram: "A", name: "Admin", color: blue },
      { monogram: "D", name: "Development", color: teal },
      { monogram: "P", name: "Personal", color: amber },
      { monogram: "H", name: "Health", color: gray },
    ],
  },
  {
    value: "consultant",
    label: "Consultant",
    description: "Multiple clients, deliverables, deadlines.",
    roles: [
      { monogram: "C1", name: "Client A", color: violet },
      { monogram: "C2", name: "Client B", color: blue },
      { monogram: "S", name: "Sales", color: teal },
      { monogram: "D", name: "Delivery", color: amber },
      { monogram: "P", name: "Personal", color: gray },
    ],
  },
  {
    value: "manager",
    label: "Manager",
    description: "A team, meetings, and strategic work.",
    roles: [
      { monogram: "T", name: "Team", color: violet },
      { monogram: "S", name: "Strategy", color: blue },
      { monogram: "O", name: "Operations", color: teal },
      { monogram: "P", name: "Partner", color: amber },
      { monogram: "H", name: "Health", color: gray },
    ],
  },
  {
    value: "student",
    label: "Student",
    description: "Study, work, side projects, learning.",
    roles: [
      { monogram: "S", name: "Study", color: violet },
      { monogram: "W", name: "Work", color: blue },
      { monogram: "P", name: "Projects", color: teal },
      { monogram: "F", name: "Fitness", color: amber },
      { monogram: "L", name: "Life", color: gray },
    ],
  },
  {
    value: "custom",
    label: "Custom",
    description: "Define your own roles from scratch.",
    roles: [],
  },
  {
    value: "chaos",
    label: "Not sure where to start? Chaos-mode.",
    description:
      "Answer 5 quick questions. FlowOS builds your workspace automatically.",
    roles: [],
    isChaos: true,
  },
];

// --- Planning Day (Step 7, Addendum §4.2) ---

export type PlanningDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun, 5=Fri

export const PLANNING_DAY_LABELS: Record<PlanningDay, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export const DEFAULT_PLANNING_DAY: PlanningDay = 5; // Friday

// --- Urgency Index (Step 9, US-059, Addendum §4.2, Covey methodology) ---

export type UrgencyProfile =
  | "prioritizer"
  | "urgency_mindset"
  | "urgency_addiction";

export interface UrgencyResult {
  totalScore: number;
  profile: UrgencyProfile;
  profileLabel: string;
  description: string;
}

// Exact 16 questions from spec (Covey First Things First)
export const URGENCY_QUESTIONS: string[] = [
  "I feel behind almost every day.",
  "I check email or messages within the first 10 minutes of waking.",
  "I say yes to things I don't have time for.",
  "I move deadlines because urgent things keep coming up.",
  "I feel guilty when I'm not doing something 'productive.'",
  "I get more done under pressure and lean into that.",
  "I interrupt strategic work to answer urgent messages.",
  "My best hours of the day are used reactively, not proactively.",
  "I struggle to say no to meetings even when they aren't valuable.",
  "I underestimate how long tasks take.",
  "I sleep less than I want to because of work.",
  "I feel rushed even when nobody is chasing me.",
  "I take pride in being 'busy.'",
  "I check my phone as the first response to a small emotional dip.",
  "I complete tasks quickly but not always well.",
  "I lose track of what I said I would do this week.",
];

// Score ranges from spec
export function scoreUrgencyIndex(scores: number[]): UrgencyResult {
  const total = scores.reduce((a, b) => a + b, 0);

  const profile: UrgencyProfile =
    total <= 25
      ? "prioritizer"
      : total <= 45
        ? "urgency_mindset"
        : "urgency_addiction";

  const profileData: Record<
    UrgencyProfile,
    { profileLabel: string; description: string }
  > = {
    prioritizer: {
      profileLabel: "Prioritizer",
      description:
        "You keep urgency in its place. FlowOS will show you your Drift Score with a light touch — you rarely need the warning.",
    },
    urgency_mindset: {
      profileLabel: "Strong urgency mindset",
      description:
        "Urgency plays a real role in how you work. FlowOS will flag drift earlier and protect your Investment Blocks harder.",
    },
    urgency_addiction: {
      profileLabel: "Urgency addiction",
      description:
        "Urgency is running the show. FlowOS will run the strictest Drift Score threshold, and will surface this pattern in your Weekly Performance Report until it moves.",
    },
  };

  return {
    totalScore: total,
    profile,
    ...profileData[profile],
  };
}

// --- Wizard state (shared across all 9 steps) ---

export interface WizardState {
  completedSteps: number[];
  profileTemplate: ProfileTemplate | null;
  chronotype: ChronotypeName | null;
  mission: string;
  roles: RoleSuggestion[];
  firstWeekGoal: { roleIndex: number | null; text: string };
  planningDay: PlanningDay;
  urgencyResult: UrgencyResult | null;
  chaosAnswers: ChaosAnswers | null;
  // Set once the user reaches the "You're set up" screen (spec §6). Used to
  // stop resume-on-relaunch from replaying a finished wizard.
  completedAt: string | null;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  completedSteps: [],
  profileTemplate: null,
  chronotype: null,
  mission: "",
  roles: [],
  firstWeekGoal: { roleIndex: null, text: "" },
  planningDay: DEFAULT_PLANNING_DAY,
  urgencyResult: null,
  chaosAnswers: null,
  completedAt: null,
};
