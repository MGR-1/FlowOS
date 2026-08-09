// packages/core/src/models/isoWeek.ts
// ISO-8601 week number. Weeks start Monday; week 1 is the week containing the
// first Thursday of the year.
//
// The ISO year is not always the calendar year — 31 Dec 2024 belongs to week 1
// of 2025 — so week and year are returned together and must always be stored
// together. Both week_intentions and goals key rows on the pair.

export function getIsoWeek(date: Date): { week: number; year: number } {
  // Copy to UTC midnight so a local timezone can't shift which day this is.
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  // Shift to the Thursday of this week; the ISO year is that Thursday's year.
  const dayNum = d.getUTCDay() || 7; // Sunday 0 -> 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return { week, year };
}
