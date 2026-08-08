import { describe, expect, it } from "vitest";
import { createNsdrState, nsdrReducer } from "./nsdr";
import {
  createSequenceState,
  startSequence,
  completeSequenceStep,
  skipSequenceStep,
  overrideSequence,
  currentSequenceStep,
} from "./sequencer";
import { DEFAULT_MORNING_PROTOCOL_STEPS } from "./morningProtocol";
import { DEFAULT_SHUTDOWN_STEPS, canCompleteShutdown } from "./shutdownRitual";
import { calculateInvestmentScore } from "./investmentScore";
import { validateReflection, reflectionPeriodKey } from "../reflections/reflections";

describe("NSDR recovery timer", () => {
  it("runs a configured session to completion", () => {
    let state = createNsdrState(10);
    state = nsdrReducer(state, { type: "start", now: "2026-08-08T12:00:00Z" });
    state = { ...state, secondsRemaining: 1 };
    state = nsdrReducer(state, { type: "tick", now: "2026-08-08T12:10:00Z" });
    expect(state.status).toBe("completed");
    expect(state.secondsRemaining).toBe(0);
    expect(state.completedAt).toBe("2026-08-08T12:10:00Z");
  });

  it("does not tick while paused", () => {
    let state = nsdrReducer(createNsdrState(), { type: "start", now: "now" });
    state = nsdrReducer(state, { type: "pause" });
    expect(nsdrReducer(state, { type: "tick", now: "later" })).toEqual(state);
  });
});

describe("protocol sequencer", () => {
  it("completes required morning steps and allows optional skips", () => {
    let state = startSequence(createSequenceState(DEFAULT_MORNING_PROTOCOL_STEPS), "08:00");
    state = completeSequenceStep(state, DEFAULT_MORNING_PROTOCOL_STEPS, "daylight", "08:01");
    state = completeSequenceStep(state, DEFAULT_MORNING_PROTOCOL_STEPS, "hydration", "08:02");
    state = skipSequenceStep(state, DEFAULT_MORNING_PROTOCOL_STEPS, "caffeine", "08:03");
    expect(currentSequenceStep(state, DEFAULT_MORNING_PROTOCOL_STEPS)?.id).toBe("movement");
    state = completeSequenceStep(state, DEFAULT_MORNING_PROTOCOL_STEPS, "movement", "08:04");
    expect(state.status).toBe("completed");
  });

  it("supports a one-tap protocol override", () => {
    const state = overrideSequence(createSequenceState(DEFAULT_MORNING_PROTOCOL_STEPS), "08:00");
    expect(state.status).toBe("overridden");
  });

  it("requires a summary before shutdown is fully complete", () => {
    let state = startSequence(createSequenceState(DEFAULT_SHUTDOWN_STEPS), "17:30");
    for (const step of DEFAULT_SHUTDOWN_STEPS) {
      state = completeSequenceStep(state, DEFAULT_SHUTDOWN_STEPS, step.id, "17:35");
    }
    expect(canCompleteShutdown({ state, daySummary: "" })).toBe(false);
    expect(canCompleteShutdown({ state, daySummary: "The priorities are ready for tomorrow." })).toBe(true);
  });
});

describe("investment score", () => {
  it("calculates investment time as a share of valid tracked time", () => {
    const result = calculateInvestmentScore([
      { startedAt: "2026-08-08T08:00:00Z", endedAt: "2026-08-08T09:30:00Z", zone: "investment" },
      { startedAt: "2026-08-08T10:00:00Z", endedAt: "2026-08-08T11:00:00Z", zone: "maintenance" },
      { startedAt: "invalid", endedAt: "2026-08-08T12:00:00Z", zone: "waste" },
    ]);
    expect(result.investmentMinutes).toBe(90);
    expect(result.trackedMinutes).toBe(150);
    expect(result.score).toBe(60);
  });

  it("returns zero for an empty period", () => {
    expect(calculateInvestmentScore([]).score).toBe(0);
  });
});

describe("reflections", () => {
  it("validates daily, weekly, and monthly required prompts", () => {
    const errors = validateReflection({
      cadence: "monthly",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-31",
      answers: [{ promptId: "outcomes", answer: "Shipped the core loop." }],
    });
    expect(errors).toHaveLength(3);
    expect(reflectionPeriodKey("monthly", "2026-08-01")).toBe("monthly:2026-08-01");
  });
});
