export type TrackedZone = "investment" | "maintenance" | "reactive" | "waste";

export interface TrackedInterval {
  startedAt: string;
  endedAt: string;
  zone: TrackedZone;
}

export interface InvestmentScoreResult {
  score: number;
  investmentMinutes: number;
  trackedMinutes: number;
  byZoneMinutes: Record<TrackedZone, number>;
}

export function calculateInvestmentScore(intervals: TrackedInterval[]): InvestmentScoreResult {
  const byZoneMinutes: Record<TrackedZone, number> = {
    investment: 0,
    maintenance: 0,
    reactive: 0,
    waste: 0,
  };

  for (const interval of intervals) {
    const started = Date.parse(interval.startedAt);
    const ended = Date.parse(interval.endedAt);
    if (!Number.isFinite(started) || !Number.isFinite(ended) || ended <= started) continue;
    byZoneMinutes[interval.zone] += (ended - started) / 60_000;
  }

  for (const zone of Object.keys(byZoneMinutes) as TrackedZone[]) {
    byZoneMinutes[zone] = Math.round(byZoneMinutes[zone]);
  }
  const trackedMinutes = Object.values(byZoneMinutes).reduce((sum, minutes) => sum + minutes, 0);
  const investmentMinutes = byZoneMinutes.investment;
  return {
    score: trackedMinutes === 0 ? 0 : Math.round((investmentMinutes / trackedMinutes) * 100),
    investmentMinutes,
    trackedMinutes,
    byZoneMinutes,
  };
}
