export interface RecoveryLogEntry {
  date: string;
  sleepHours: number;
  alcoholLastNight: boolean;
  movementToday: boolean;
  wearableReadiness?: number | null;
}

export function validateRecoveryLog(entry: RecoveryLogEntry): string[] {
  const errors: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) errors.push("Date must use YYYY-MM-DD format.");
  if (!Number.isFinite(entry.sleepHours) || entry.sleepHours < 0 || entry.sleepHours > 24) {
    errors.push("Sleep hours must be between 0 and 24.");
  }
  if (entry.wearableReadiness != null && (entry.wearableReadiness < 0 || entry.wearableReadiness > 100)) {
    errors.push("Wearable readiness must be between 0 and 100.");
  }
  return errors;
}

export function recoveryCorrelationEligible(entries: RecoveryLogEntry[]): boolean {
  return new Set(entries.map((entry) => entry.date)).size >= 14;
}
