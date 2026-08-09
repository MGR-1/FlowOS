import { describe, it, expect } from "vitest";
import { PEAK_WINDOWS, scoreUrgencyIndex } from "./onboarding";

describe("PEAK_WINDOWS", () => {
  it("gives lion an 08:00-12:00 window", () => {
    expect(PEAK_WINDOWS.lion).toEqual({ start: "08:00", end: "12:00" });
  });

  it("gives bear a 10:00-14:00 window", () => {
    expect(PEAK_WINDOWS.bear).toEqual({ start: "10:00", end: "14:00" });
  });

  it("gives wolf a 17:00-21:00 window", () => {
    expect(PEAK_WINDOWS.wolf).toEqual({ start: "17:00", end: "21:00" });
  });

  it("gives dolphin no fixed window, per ADR-013", () => {
    expect(PEAK_WINDOWS.dolphin).toBeNull();
  });
});

describe("scoreUrgencyIndex", () => {
  it("keeps the 16 raw scores for the database", () => {
    const scores = [4, 0, 4, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(scoreUrgencyIndex(scores).scores).toEqual(scores);
  });

  it("totals the scores", () => {
    const scores = new Array(16).fill(2);
    expect(scoreUrgencyIndex(scores).totalScore).toBe(32);
  });

  it("maps a low total to prioritizer", () => {
    const result = scoreUrgencyIndex(new Array(16).fill(0));
    expect(result.profile).toBe("prioritizer");
    expect(result.dbProfileType).toBe("prioritizer");
  });

  it("maps a mid total to the urgency mindset tier", () => {
    // 16 questions x 2 = 32, inside the 26-45 band.
    expect(scoreUrgencyIndex(new Array(16).fill(2)).profile).toBe(
      "urgency_mindset"
    );
  });

  it("maps a high total to urgency addiction", () => {
    expect(scoreUrgencyIndex(new Array(16).fill(4)).profile).toBe(
      "urgency_addiction"
    );
  });

  it("maps a high total with a dominant Q1 to procrastinator", () => {
    const scores = new Array(16).fill(4);
    expect(scoreUrgencyIndex(scores).dbProfileType).toBe("procrastinator");
  });

  it("maps a dominant Q3 to yes_man", () => {
    const scores = new Array(16).fill(3);
    scores[0] = 0; // Q1 low
    scores[2] = 4; // Q3 high
    expect(scoreUrgencyIndex(scores).dbProfileType).toBe("yes_man");
  });

  it("maps a dominant Q4 to slacker", () => {
    const scores = new Array(16).fill(3);
    scores[0] = 0; // Q1 low
    scores[2] = 0; // Q3 low
    scores[3] = 4; // Q4 high
    expect(scoreUrgencyIndex(scores).dbProfileType).toBe("slacker");
  });
});
