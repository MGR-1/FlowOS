// packages/core/src/models/onboarding.ts

// --- Chronotype (ADR-013, Section 4.2) ---

export type ChronotypeName = "lion" | "bear" | "wolf" | "dolphin";

export interface ChronotypeProfile {
  type: ChronotypeName;
  label: string;
  peakWindow: string;
  description: string;
  planningTip: string;
}

export const CHRONOTYPE_PROFILES: Record<ChronotypeName, ChronotypeProfile> = {
  lion: {
    type: "lion",
    label: "Lion",
    peakWindow: "08:00 – 12:00",
    description:
      "You wake early and hit peak cognitive performance in the morning. You fade by mid-afternoon and prefer an early bedtime.",
    planningTip:
      "FlowOS will place your most demanding tasks before noon and protect your mornings from meetings.",
  },
  bear: {
    type: "bear",
    label: "Bear",
    peakWindow: "10:00 – 14:00",
    description:
      "You follow the solar cycle — rise with the sun, peak mid-morning, and wind down in the evening. The most common chronotype (~55% of people).",
    planningTip:
      "FlowOS will schedule your Investment Blocks between 10:00 and 14:00 and keep your afternoons lighter.",
  },
  wolf: {
    type: "wolf",
    label: "Wolf",
    peakWindow: "17:00 – 21:00",
    description:
      "You're slow to start but hit your stride in the afternoon and evening. Mornings are painful — your best work happens when others are winding down.",
    planningTip:
      "FlowOS will protect your evenings for deep work and avoid scheduling demanding tasks before noon.",
  },
  dolphin: {
    type: "dolphin",
    label: "Dolphin",
    peakWindow: "Variable",
    description:
      "You're a light sleeper with an irregular energy pattern. Your peaks are unpredictable but real — FlowOS will detect them from your actual session data.",
    planningTip:
      "FlowOS will learn your personal peak windows from 30 days of data and adapt your schedule accordingly.",
  },
};

export interface ChronotypeQuestion {
  id: string;
  text: string;
  options: { label: string; value: ChronotypeName }[];
}

export const CHRONOTYPE_QUESTIONS: ChronotypeQuestion[] = [
  {
    id: "cq1",
    text: "If you had no alarm and no obligations, what time would you naturally wake up?",
    options: [
      { label: "Before 6:30am", value: "lion" },
      { label: "6:30 – 8:00am", value: "bear" },
      { label: "After 8:00am", value: "wolf" },
      { label: "It varies — I never know", value: "dolphin" },
    ],
  },
  {
    id: "cq2",
    text: "When do you feel most mentally sharp and focused?",
    options: [
      { label: "Early morning (7–10am)", value: "lion" },
      { label: "Late morning (10am–1pm)", value: "bear" },
      { label: "Evening (5–9pm)", value: "wolf" },
      { label: "It shifts — no clear pattern", value: "dolphin" },
    ],
  },
  {
    id: "cq3",
    text: "How do you feel in the first 30 minutes after waking?",
    options: [
      { label: "Alert and ready to go", value: "lion" },
      { label: "Okay after coffee and a few minutes", value: "bear" },
      { label: "Groggy — mornings are a struggle", value: "wolf" },
      { label: "Varies wildly day to day", value: "dolphin" },
    ],
  },
  {
    id: "cq4",
    text: "What time do you naturally feel ready for sleep?",
    options: [
      { label: "Before 10pm", value: "lion" },
      { label: "10pm – midnight", value: "bear" },
      { label: "After midnight", value: "wolf" },
      { label: "Hard to say — sleep is inconsistent", value: "dolphin" },
    ],
  },
];

export function detectChronotype(
  answers: ChronotypeName[]
): ChronotypeName {
  const counts: Record<ChronotypeName, number> = {
    lion: 0,
    bear: 0,
    wolf: 0,
    dolphin: 0,
  };
  answers.forEach((a) => counts[a]++);
  return (Object.keys(counts) as ChronotypeName[]).reduce((a, b) =>
    counts[a] >= counts[b] ? a : b
  );
}

// --- Planning Day (Section 4.2) ---

export type PlanningDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export const PLANNING_DAY_LABELS: Record<PlanningDay, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DEFAULT_PLANNING_DAY: PlanningDay = 5; // Friday

// --- Urgency Index (US-059, Section 4.2) ---

export type UrgencyProfile =
  | "prioritizer"
  | "strong_urgency_mindset"
  | "urgency_addiction";

export type UrgencySecondaryLabel =
  | "procrastinator"
  | "yes_man"
  | "slacker"
  | null;

export interface UrgencyResult {
  totalScore: number;
  profile: UrgencyProfile;
  secondaryLabel: UrgencySecondaryLabel;
  profileLabel: string;
  description: string;
  recommendation: string;
}

export const URGENCY_QUESTIONS: string[] = [
  // Q1 — Quadrant 1 (urgent + important) tendency
  "I spend most of my day reacting to crises and urgent problems.",
  "I feel like I'm always putting out fires rather than making progress.",
  "My most important work gets pushed aside by things that feel urgent.",
  "I struggle to say no when someone presents something as urgent.",
  // Q2 — Quadrant 2 (important, not urgent) investment
  "I proactively schedule time for planning and strategy.",
  "I consistently work on goals that matter long-term, not just what's due today.",
  "I protect my deep work time from interruptions and reactive tasks.",
  "I review my priorities weekly before the week begins.",
  // Q3 — Quadrant 3 (urgent, not important) traps
  "I attend meetings that could have been handled another way.",
  "I respond to messages and requests immediately, even when I'm in focus mode.",
  "Other people's urgency regularly overrides my own priorities.",
  "I feel busy but often wonder if I accomplished what actually mattered.",
  // Q4 — Quadrant 4 (not urgent, not important) escapes
  "I find myself scrolling, browsing, or doing low-value tasks when I should be working.",
  "I procrastinate on important tasks by doing easier, less meaningful ones.",
  "I use entertainment or distraction to avoid starting difficult work.",
  "At the end of the day I feel I wasted time I should have used differently.",
];

export function scoreUrgencyIndex(scores: number[]): UrgencyResult {
  const total = scores.reduce((a, b) => a + b, 0);

  // Q1 scores: indices 0-3, Q3 scores: indices 8-11
  const q1Total = scores.slice(0, 4).reduce((a, b) => a + b, 0);
  const q3Total = scores.slice(8, 12).reduce((a, b) => a + b, 0);
  const q4Total = scores.slice(12, 16).reduce((a, b) => a + b, 0);

  const profile: UrgencyProfile =
    total <= 25
      ? "prioritizer"
      : total <= 45
      ? "strong_urgency_mindset"
      : "urgency_addiction";

  // Secondary label based on dominant quadrant pattern
  let secondaryLabel: UrgencySecondaryLabel = null;
  if (q1Total >= 12) secondaryLabel = "procrastinator";
  else if (q3Total >= 12) secondaryLabel = "yes_man";
  else if (q4Total >= 12) secondaryLabel = "slacker";

  const profileData: Record<
    UrgencyProfile,
    { profileLabel: string; description: string; recommendation: string }
  > = {
    prioritizer: {
      profileLabel: "Prioritizer",
      description:
        "You have strong clarity on what matters and protect your time accordingly. You spend most of your energy on important work, not reactive firefighting.",
      recommendation:
        "Keep your Investment Block discipline strong. Your next lever is delegation — identifying which Q3 tasks you can stop accepting entirely.",
    },
    strong_urgency_mindset: {
      profileLabel: "Strong urgency mindset",
      description:
        "You get important work done, but urgency regularly pulls you off course. You say yes more than you should and feel the cost of it by Friday.",
      recommendation:
        "Start each day by confirming your MIT before opening any messages. Practice a 10-minute pause before accepting any unplanned task.",
    },
    urgency_addiction: {
      profileLabel: "Urgency addiction",
      description:
        "The urgent has crowded out the important. You feel perpetually busy but rarely feel genuine progress. This is the most common pattern among high performers — and the most costly.",
      recommendation:
        "Block your first 90 minutes every day as a non-negotiable Investment Block. Track how many unplanned tasks you accept each day — awareness is the first move.",
    },
  };

  return {
    totalScore: total,
    profile,
    secondaryLabel,
    ...profileData[profile],
  };
}
