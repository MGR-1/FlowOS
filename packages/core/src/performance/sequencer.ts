export interface SequenceStep {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
}

export interface SequenceProgress {
  stepId: string;
  completedAt: string | null;
  skippedAt: string | null;
}

export interface SequenceState {
  status: "not_started" | "in_progress" | "completed" | "overridden";
  startedAt: string | null;
  completedAt: string | null;
  progress: SequenceProgress[];
}

export function createSequenceState(steps: SequenceStep[]): SequenceState {
  return {
    status: "not_started",
    startedAt: null,
    completedAt: null,
    progress: orderedSteps(steps).map((step) => ({ stepId: step.id, completedAt: null, skippedAt: null })),
  };
}

export function startSequence(state: SequenceState, now: string): SequenceState {
  return state.status === "not_started" ? { ...state, status: "in_progress", startedAt: now } : state;
}

export function completeSequenceStep(
  state: SequenceState,
  steps: SequenceStep[],
  stepId: string,
  now: string,
): SequenceState {
  if (state.status !== "in_progress" || !steps.some((step) => step.id === stepId)) return state;
  const progress = state.progress.map((item) =>
    item.stepId === stepId ? { ...item, completedAt: now, skippedAt: null } : item,
  );
  const complete = steps.every((step) => {
    const item = progress.find((candidate) => candidate.stepId === step.id);
    return !step.required || Boolean(item?.completedAt);
  });
  return complete ? { ...state, progress, status: "completed", completedAt: now } : { ...state, progress };
}

export function skipSequenceStep(
  state: SequenceState,
  steps: SequenceStep[],
  stepId: string,
  now: string,
): SequenceState {
  const step = steps.find((candidate) => candidate.id === stepId);
  if (state.status !== "in_progress" || !step || step.required) return state;
  return {
    ...state,
    progress: state.progress.map((item) =>
      item.stepId === stepId ? { ...item, skippedAt: now, completedAt: null } : item,
    ),
  };
}

export function overrideSequence(state: SequenceState, now: string): SequenceState {
  return state.status === "completed" ? state : { ...state, status: "overridden", completedAt: now };
}

export function currentSequenceStep(state: SequenceState, steps: SequenceStep[]): SequenceStep | null {
  return orderedSteps(steps).find((step) => {
    const item = state.progress.find((candidate) => candidate.stepId === step.id);
    return !item?.completedAt && !item?.skippedAt;
  }) ?? null;
}

function orderedSteps(steps: SequenceStep[]): SequenceStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}
