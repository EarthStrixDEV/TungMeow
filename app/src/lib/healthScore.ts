export type HealthStatus = "healthy" | "watch" | "overspending" | "neutral";

export const HEALTH_WATCH_THRESHOLD_PCT = 80;
export const HEALTH_OVERSPEND_THRESHOLD_PCT = 100;

/** Maps current-period expense:income ratio to a status: no/zero income → neutral, <80% → healthy, 80-100% → watch, >100% → overspending. */
export function deriveHealthStatus(income: number, expense: number): HealthStatus {
  if (income <= 0) return "neutral";
  const pct = (expense / income) * 100;
  if (pct < HEALTH_WATCH_THRESHOLD_PCT) return "healthy";
  if (pct <= HEALTH_OVERSPEND_THRESHOLD_PCT) return "watch";
  return "overspending";
}
