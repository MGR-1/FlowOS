import type { SequenceStep, SequenceState } from "./sequencer";

export const DEFAULT_SHUTDOWN_STEPS: SequenceStep[] = [
  { id: "review_open_tasks", title: "Review open tasks", required: true, order: 1 },
  { id: "clear_inbox", title: "Clear the inbox", required: true, order: 2 },
  { id: "review_tomorrow", title: "Review tomorrow's calendar", required: true, order: 3 },
  { id: "day_summary", title: "Write a one-sentence day summary", required: true, order: 4 },
];

export interface ShutdownRitualConfig {
  enabled: boolean;
  localTime: string;
  steps: SequenceStep[];
}

export const DEFAULT_SHUTDOWN_CONFIG: ShutdownRitualConfig = {
  enabled: true,
  localTime: "17:30",
  steps: DEFAULT_SHUTDOWN_STEPS,
};

export interface ShutdownCompletion {
  state: SequenceState;
  daySummary: string;
}

export function canCompleteShutdown(completion: ShutdownCompletion): boolean {
  return completion.state.status === "completed" && completion.daySummary.trim().length > 0;
}
