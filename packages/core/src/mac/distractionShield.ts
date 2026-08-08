export const DISTRACTION_POLL_SECONDS = 30;
export const DISTRACTION_NUDGE_SECONDS = 10 * 60;
export const DISTRACTION_SNOOZE_SECONDS = 10 * 60;

export interface DistractionShieldState {
  active: boolean;
  expectedBundleIds: string[];
  activeBundleId: string | null;
  driftSeconds: number;
  nudgeVisible: boolean;
  snoozedUntil: string | null;
  intentionalBundleIds: string[];
}

export type DistractionShieldAction =
  | { type: "start"; expectedBundleIds: string[] }
  | { type: "observe"; bundleId: string; now: string; elapsedSeconds?: number }
  | { type: "dismiss" }
  | { type: "snooze"; now: string }
  | { type: "markIntentional"; bundleId: string }
  | { type: "pauseForBreak" }
  | { type: "stop" };

export function createDistractionShieldState(): DistractionShieldState {
  return {
    active: false,
    expectedBundleIds: [],
    activeBundleId: null,
    driftSeconds: 0,
    nudgeVisible: false,
    snoozedUntil: null,
    intentionalBundleIds: [],
  };
}

export function distractionShieldReducer(
  state: DistractionShieldState,
  action: DistractionShieldAction,
): DistractionShieldState {
  switch (action.type) {
    case "start":
      return { ...createDistractionShieldState(), active: true, expectedBundleIds: [...new Set(action.expectedBundleIds)] };
    case "observe": {
      if (!state.active) return state;
      const accepted = state.expectedBundleIds.includes(action.bundleId) || state.intentionalBundleIds.includes(action.bundleId);
      if (accepted) return { ...state, activeBundleId: action.bundleId, driftSeconds: 0, nudgeVisible: false };
      const driftSeconds = state.driftSeconds + (action.elapsedSeconds ?? DISTRACTION_POLL_SECONDS);
      const snoozed = state.snoozedUntil != null && Date.parse(action.now) < Date.parse(state.snoozedUntil);
      return {
        ...state,
        activeBundleId: action.bundleId,
        driftSeconds,
        nudgeVisible: !snoozed && driftSeconds >= DISTRACTION_NUDGE_SECONDS,
      };
    }
    case "dismiss":
      return { ...state, nudgeVisible: false };
    case "snooze":
      return {
        ...state,
        nudgeVisible: false,
        snoozedUntil: new Date(Date.parse(action.now) + DISTRACTION_SNOOZE_SECONDS * 1000).toISOString(),
      };
    case "markIntentional":
      return {
        ...state,
        intentionalBundleIds: [...new Set([...state.intentionalBundleIds, action.bundleId])],
        driftSeconds: 0,
        nudgeVisible: false,
      };
    case "pauseForBreak":
      return { ...state, active: false, driftSeconds: 0, nudgeVisible: false };
    case "stop":
      return createDistractionShieldState();
  }
}

export interface MacActiveApplicationAdapter {
  frontmostBundleId(): Promise<string>;
  startPolling(intervalSeconds: 30, onChange: (bundleId: string) => void): () => void;
}
