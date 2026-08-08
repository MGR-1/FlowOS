export const MINIMALIST_MODE_SHORTCUT = "Cmd+Shift+M" as const;

export interface MinimalistModeState {
  active: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  timerSeconds: number;
}

export type MinimalistModeAction =
  | { type: "toggle"; taskId: string | null; taskTitle: string | null; timerSeconds: number }
  | { type: "escape" }
  | { type: "timerTick"; seconds: number };

export function createMinimalistModeState(): MinimalistModeState {
  return { active: false, activeTaskId: null, activeTaskTitle: null, timerSeconds: 0 };
}

export function minimalistModeReducer(state: MinimalistModeState, action: MinimalistModeAction): MinimalistModeState {
  switch (action.type) {
    case "toggle":
      return state.active
        ? createMinimalistModeState()
        : {
            active: true,
            activeTaskId: action.taskId,
            activeTaskTitle: action.taskTitle,
            timerSeconds: Math.max(0, action.timerSeconds),
          };
    case "escape":
      return createMinimalistModeState();
    case "timerTick":
      return state.active ? { ...state, timerSeconds: Math.max(0, action.seconds) } : state;
  }
}

export interface MacMinimalistModeAdapter {
  registerGlobalShortcut(shortcut: typeof MINIMALIST_MODE_SHORTCUT, callback: () => void): Promise<() => void>;
  setNavigationVisible(visible: boolean): void;
}
