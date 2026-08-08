export type ReflectionCadence = "daily" | "weekly" | "monthly";

export interface ReflectionPrompt {
  id: string;
  question: string;
  required: boolean;
}

export interface ReflectionAnswer {
  promptId: string;
  answer: string;
}

export interface ReflectionDraft {
  cadence: ReflectionCadence;
  periodStart: string;
  periodEnd: string;
  answers: ReflectionAnswer[];
  mood?: "energised" | "focused" | "neutral" | "tired" | "stressed";
}

export const REFLECTION_PROMPTS: Record<ReflectionCadence, ReflectionPrompt[]> = {
  daily: [
    { id: "went_well", question: "What went well today?", required: true },
    { id: "different", question: "What would you do differently?", required: true },
    { id: "gratitude", question: "What are you grateful for?", required: false },
  ],
  weekly: [
    { id: "progress", question: "What meaningful progress did you make this week?", required: true },
    { id: "pattern", question: "Which pattern helped or hindered your performance?", required: true },
    { id: "next_week", question: "What will you protect next week?", required: true },
  ],
  monthly: [
    { id: "outcomes", question: "Which outcomes mattered most this month?", required: true },
    { id: "role_balance", question: "Which roles received too much or too little attention?", required: true },
    { id: "time_returned", question: "Where did FlowOS return time or reduce decision pressure?", required: true },
    { id: "next_month", question: "What will you change next month?", required: true },
  ],
};

export function validateReflection(draft: ReflectionDraft): string[] {
  const errors: string[] = [];
  const start = Date.parse(draft.periodStart);
  const end = Date.parse(draft.periodEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) errors.push("Invalid reflection period.");
  const answers = new Map(draft.answers.map((answer) => [answer.promptId, answer.answer.trim()]));
  for (const prompt of REFLECTION_PROMPTS[draft.cadence]) {
    if (prompt.required && !answers.get(prompt.id)) errors.push(`Missing required answer: ${prompt.id}.`);
  }
  return errors;
}

export function reflectionPeriodKey(cadence: ReflectionCadence, periodStart: string): string {
  return `${cadence}:${periodStart}`;
}
