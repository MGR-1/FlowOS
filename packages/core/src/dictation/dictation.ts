export const DICTATION_CONTEXTS = [
  "task_title", "task_body", "braindump", "reflection", "note",
  "memo", "goal", "search", "meeting_action", "calendar_event",
] as const;

export type DictationContextId = (typeof DICTATION_CONTEXTS)[number];
export type DictationModel = "small" | "medium" | "large-v3";
export type DictationOverlayStatus = "hidden" | "listening" | "transcribing" | "processing" | "ready" | "error";

export interface DictationSettings {
  enabled: boolean;
  aiPostProcessing: boolean;
  model: DictationModel;
  shortcut: "Option+Space";
  stopAfterSilenceSeconds: 2;
  retainHistoryLimit: 20;
}

export const DEFAULT_DICTATION_SETTINGS: DictationSettings = {
  enabled: true,
  aiPostProcessing: true,
  model: "medium",
  shortcut: "Option+Space",
  stopAfterSilenceSeconds: 2,
  retainHistoryLimit: 20,
};

export interface DictationOverlayState {
  status: DictationOverlayStatus;
  contextId: DictationContextId | null;
  rawText: string;
  processedText: string;
  error: string | null;
}

export type DictationOverlayAction =
  | { type: "open"; contextId: DictationContextId; settings: DictationSettings }
  | { type: "stopRecording" }
  | { type: "transcribed"; text: string; settings: DictationSettings }
  | { type: "processed"; text: string }
  | { type: "fail"; message: string }
  | { type: "close" };

export function createDictationOverlayState(): DictationOverlayState {
  return { status: "hidden", contextId: null, rawText: "", processedText: "", error: null };
}

export function dictationOverlayReducer(
  state: DictationOverlayState,
  action: DictationOverlayAction,
): DictationOverlayState {
  switch (action.type) {
    case "open":
      return action.settings.enabled
        ? { status: "listening", contextId: action.contextId, rawText: "", processedText: "", error: null }
        : state;
    case "stopRecording":
      return state.status === "listening" ? { ...state, status: "transcribing" } : state;
    case "transcribed":
      if (state.status !== "transcribing") return state;
      return action.settings.aiPostProcessing && state.contextId !== "search"
        ? { ...state, rawText: action.text, status: "processing" }
        : { ...state, rawText: action.text, processedText: action.text, status: "ready" };
    case "processed":
      return state.status === "processing" ? { ...state, processedText: action.text, status: "ready" } : state;
    case "fail":
      return { ...state, status: "error", error: action.message };
    case "close":
      return createDictationOverlayState();
  }
}

export interface DictationHistoryEntry {
  id: string;
  contextId: DictationContextId;
  rawText: string;
  processedText: string;
  createdAt: string;
}

export function addDictationHistory(
  history: DictationHistoryEntry[],
  entry: DictationHistoryEntry,
  limit = 20,
): DictationHistoryEntry[] {
  return [entry, ...history.filter((item) => item.id !== entry.id)].slice(0, limit);
}

export interface PendingHistoryClear {
  previous: DictationHistoryEntry[];
  undoUntil: string;
}

export function prepareHistoryClear(history: DictationHistoryEntry[], nowMs: number): PendingHistoryClear {
  return { previous: history, undoUntil: new Date(nowMs + 3000).toISOString() };
}
