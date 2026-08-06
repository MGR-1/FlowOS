import { describe, it, expect } from "vitest";
import { getIsoWeek } from "./isoWeek";

describe("getIsoWeek", () => {
  it("returns week 1 for 4 January, which is always in week 1", () => {
    expect(getIsoWeek(new Date("2026-01-04T12:00:00Z"))).toEqual({
      week: 1,
      year: 2026,
    });
  });

  it("puts 1 January 2027 (a Friday) in week 53 of 2026", () => {
    expect(getIsoWeek(new Date("2027-01-01T12:00:00Z"))).toEqual({
      week: 53,
      year: 2026,
    });
  });

  it("puts 31 December 2024 (a Tuesday) in week 1 of 2025", () => {
    expect(getIsoWeek(new Date("2024-12-31T12:00:00Z"))).toEqual({
      week: 1,
      year: 2025,
    });
  });

  it("handles a mid-year date", () => {
    expect(getIsoWeek(new Date("2026-08-06T12:00:00Z"))).toEqual({
      week: 32,
      year: 2026,
    });
  });

  it("keeps Monday and Sunday of the same week together", () => {
    const monday = getIsoWeek(new Date("2026-08-03T12:00:00Z"));
    const sunday = getIsoWeek(new Date("2026-08-09T12:00:00Z"));
    expect(monday).toEqual(sunday);
  });

  it("rolls over to the next week on the following Monday", () => {
    const sunday = getIsoWeek(new Date("2026-08-09T12:00:00Z"));
    const nextMonday = getIsoWeek(new Date("2026-08-10T12:00:00Z"));
    expect(nextMonday.week).toBe(sunday.week + 1);
  });
});
