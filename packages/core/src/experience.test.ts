import { describe, expect, it } from "vitest";
import { recoveryCorrelationEligible, validateRecoveryLog } from "./performance/recoveryLog";
import { createHomepageLayout, reorderWidget, toggleWidget, validateHomepageLayout } from "./homepage/widgets";
import {
  DEFAULT_DICTATION_SETTINGS,
  addDictationHistory,
  createDictationOverlayState,
  dictationOverlayReducer,
  prepareHistoryClear,
} from "./dictation/dictation";
import {
  DISTRACTION_NUDGE_SECONDS,
  createDistractionShieldState,
  distractionShieldReducer,
} from "./mac/distractionShield";
import { createMinimalistModeState, minimalistModeReducer } from "./mac/minimalistMode";
import { CURSOR_GLOW_CONFIG, cursorGlowVariables } from "./ui/cursorGlow";

describe("recovery log", () => {
  it("validates the three daily recovery inputs", () => {
    expect(validateRecoveryLog({ date: "2026-08-08", sleepHours: 7.5, alcoholLastNight: false, movementToday: true })).toEqual([]);
    expect(validateRecoveryLog({ date: "bad", sleepHours: 25, alcoholLastNight: false, movementToday: false })).toHaveLength(2);
  });

  it("requires fourteen unique days before correlation", () => {
    const entries = Array.from({ length: 14 }, (_, index) => ({
      date: `2026-08-${String(index + 1).padStart(2, "0")}`,
      sleepHours: 8,
      alcoholLastNight: false,
      movementToday: true,
    }));
    expect(recoveryCorrelationEligible(entries.slice(0, 13))).toBe(false);
    expect(recoveryCorrelationEligible(entries)).toBe(true);
  });
});

describe("homepage widgets", () => {
  it("toggles and reorders widgets without changing widget identity", () => {
    let layout = createHomepageLayout("2026-08-08T10:00:00Z");
    layout = toggleWidget(layout, "wearable_readiness", true, "2026-08-08T10:01:00Z");
    layout = reorderWidget(layout, "wearable_readiness", 0, "2026-08-08T10:02:00Z");
    expect(layout.widgets[0].id).toBe("wearable_readiness");
    expect(layout.widgets[0].enabled).toBe(true);
    expect(validateHomepageLayout(layout)).toEqual([]);
  });
});

describe("dictation", () => {
  it("keeps search transcription raw even when AI post-processing is enabled", () => {
    let state = dictationOverlayReducer(createDictationOverlayState(), {
      type: "open", contextId: "search", settings: DEFAULT_DICTATION_SETTINGS,
    });
    state = dictationOverlayReducer(state, { type: "stopRecording" });
    state = dictationOverlayReducer(state, {
      type: "transcribed", text: "quarterly planning", settings: DEFAULT_DICTATION_SETTINGS,
    });
    expect(state.status).toBe("ready");
    expect(state.processedText).toBe("quarterly planning");
  });

  it("gates the overlay with the master toggle and caps local history at twenty", () => {
    const disabled = { ...DEFAULT_DICTATION_SETTINGS, enabled: false };
    const state = dictationOverlayReducer(createDictationOverlayState(), { type: "open", contextId: "note", settings: disabled });
    expect(state.status).toBe("hidden");

    const history = Array.from({ length: 21 }, (_, index) => ({
      id: String(index), contextId: "note" as const, rawText: "raw", processedText: "processed", createdAt: String(index),
    }));
    expect(addDictationHistory([], history[0])).toHaveLength(1);
    expect(addDictationHistory(history.slice(0, 20), history[20])).toHaveLength(20);
    expect(prepareHistoryClear(history, 0).undoUntil).toBe("1970-01-01T00:00:03.000Z");
  });
});

describe("Mac distraction shield", () => {
  it("nudges after ten consecutive minutes in an unexpected app", () => {
    let state = distractionShieldReducer(createDistractionShieldState(), {
      type: "start", expectedBundleIds: ["com.apple.dt.Xcode"],
    });
    state = distractionShieldReducer(state, {
      type: "observe", bundleId: "com.apple.Safari", now: "2026-08-08T12:10:00Z", elapsedSeconds: DISTRACTION_NUDGE_SECONDS,
    });
    expect(state.nudgeVisible).toBe(true);
    state = distractionShieldReducer(state, { type: "snooze", now: "2026-08-08T12:10:00Z" });
    expect(state.snoozedUntil).toBe("2026-08-08T12:20:00.000Z");
  });

  it("resets drift when an app is marked intentional", () => {
    let state = distractionShieldReducer(createDistractionShieldState(), { type: "start", expectedBundleIds: [] });
    state = distractionShieldReducer(state, { type: "markIntentional", bundleId: "com.apple.Safari" });
    state = distractionShieldReducer(state, { type: "observe", bundleId: "com.apple.Safari", now: "2026-08-08T12:00:00Z" });
    expect(state.driftSeconds).toBe(0);
  });
});

describe("Mac experience contracts", () => {
  it("toggles and exits Minimalist Mode", () => {
    let state = minimalistModeReducer(createMinimalistModeState(), {
      type: "toggle", taskId: "task-1", taskTitle: "Write launch brief", timerSeconds: 120,
    });
    expect(state.active).toBe(true);
    expect(state.activeTaskTitle).toBe("Write launch brief");
    state = minimalistModeReducer(state, { type: "escape" });
    expect(state.active).toBe(false);
  });

  it("uses the fixed four-percent cursor glow contract", () => {
    const variables = cursorGlowVariables(101.4, 202.7, "modal", true);
    expect(CURSOR_GLOW_CONFIG.opacity).toBe(0.04);
    expect(variables["--flowos-cursor-radius"]).toBe("180px");
    expect(variables["--flowos-cursor-x"]).toBe("101px");
  });
});
