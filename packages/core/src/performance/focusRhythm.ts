export const FOCUS_DURATION_OPTIONS = [45, 60, 75, 90, 120] as const;
export const DEFAULT_FOCUS_MINUTES = 90;
export const DEFAULT_BREAK_MINUTES = 20;

export type FocusDuration = (typeof FOCUS_DURATION_OPTIONS)[number];
export type RhythmPhase = "idle" | "focus" | "break" | "paused";

export interface RhythmState {
  phase: RhythmPhase;
  resumePhase: "focus" | "break" | null;
  focusMinutes: FocusDuration;
  breakMinutes: number;
  secondsRemaining: number;
  sessionStartedAt: string | null;
  completedFocusSessions: number;
}

export interface CompletedFocusSession {
  plannedMinutes: FocusDuration;
  completedAt: string;
}

export type RhythmAction =
  | { type: "start"; now: string }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "reset" }
  | { type: "tick" }
  | { type: "skipBreak" }
  | { type: "setFocusMinutes"; minutes: FocusDuration };

export function createRhythmState(
  focusMinutes: FocusDuration = DEFAULT_FOCUS_MINUTES,
  breakMinutes = DEFAULT_BREAK_MINUTES,
): RhythmState {
  return {
    phase: "idle",
    resumePhase: null,
    focusMinutes,
    breakMinutes,
    secondsRemaining: focusMinutes * 60,
    sessionStartedAt: null,
    completedFocusSessions: 0,
  };
}

export function focusRhythmReducer(state: RhythmState, action: RhythmAction): RhythmState {
  switch (action.type) {
    case "start":
      return state.phase === "idle"
        ? { ...state, phase: "focus", secondsRemaining: state.focusMinutes * 60, sessionStartedAt: action.now }
        : state;
    case "pause":
      return state.phase === "focus" || state.phase === "break"
        ? { ...state, phase: "paused", resumePhase: state.phase }
        : state;
    case "resume":
      return state.phase === "paused" && state.resumePhase
        ? { ...state, phase: state.resumePhase, resumePhase: null }
        : state;
    case "reset":
      return createRhythmState(state.focusMinutes, state.breakMinutes);
    case "skipBreak":
      return state.phase === "break" || (state.phase === "paused" && state.resumePhase === "break")
        ? { ...state, phase: "idle", resumePhase: null, secondsRemaining: state.focusMinutes * 60, sessionStartedAt: null }
        : state;
    case "setFocusMinutes":
      return state.phase === "idle"
        ? { ...state, focusMinutes: action.minutes, secondsRemaining: action.minutes * 60 }
        : state;
    case "tick":
      if (state.phase !== "focus" && state.phase !== "break") return state;
      if (state.secondsRemaining > 1) return { ...state, secondsRemaining: state.secondsRemaining - 1 };
      if (state.phase === "focus") {
        return {
          ...state,
          phase: "break",
          secondsRemaining: state.breakMinutes * 60,
          completedFocusSessions: state.completedFocusSessions + 1,
        };
      }
      return { ...state, phase: "idle", secondsRemaining: state.focusMinutes * 60, sessionStartedAt: null };
  }
}

export function recommendedFocusDuration(sessions: CompletedFocusSession[]): FocusDuration | null {
  if (sessions.length < 10) return null;
  const recent = sessions.slice(-10);
  const totals = FOCUS_DURATION_OPTIONS.map((minutes) => ({
    minutes,
    count: recent.filter((session) => session.plannedMinutes === minutes).length,
  }));
  const highest = Math.max(...totals.map((item) => item.count));
  return totals
    .filter((item) => item.count === highest)
    .sort((a, b) => Math.abs(a.minutes - 90) - Math.abs(b.minutes - 90))[0].minutes;
}

export function formatRemainingTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
