export const NSDR_DURATION_OPTIONS = [10, 15, 20] as const;
export type NsdrDuration = (typeof NSDR_DURATION_OPTIONS)[number];
export type NsdrStatus = "idle" | "running" | "paused" | "completed";

export interface NsdrState {
  status: NsdrStatus;
  durationMinutes: NsdrDuration;
  secondsRemaining: number;
  startedAt: string | null;
  completedAt: string | null;
}

export type NsdrAction =
  | { type: "setDuration"; minutes: NsdrDuration }
  | { type: "start"; now: string }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "tick"; now: string }
  | { type: "reset" };

export function createNsdrState(durationMinutes: NsdrDuration = 15): NsdrState {
  return {
    status: "idle",
    durationMinutes,
    secondsRemaining: durationMinutes * 60,
    startedAt: null,
    completedAt: null,
  };
}

export function nsdrReducer(state: NsdrState, action: NsdrAction): NsdrState {
  switch (action.type) {
    case "setDuration":
      return state.status === "idle"
        ? { ...state, durationMinutes: action.minutes, secondsRemaining: action.minutes * 60 }
        : state;
    case "start":
      return state.status === "idle"
        ? { ...state, status: "running", startedAt: action.now, completedAt: null }
        : state;
    case "pause":
      return state.status === "running" ? { ...state, status: "paused" } : state;
    case "resume":
      return state.status === "paused" ? { ...state, status: "running" } : state;
    case "tick":
      if (state.status !== "running") return state;
      return state.secondsRemaining > 1
        ? { ...state, secondsRemaining: state.secondsRemaining - 1 }
        : { ...state, status: "completed", secondsRemaining: 0, completedAt: action.now };
    case "reset":
      return createNsdrState(state.durationMinutes);
  }
}
