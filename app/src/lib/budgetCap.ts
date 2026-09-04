import { HEALTH_WATCH_THRESHOLD_PCT, HEALTH_OVERSPEND_THRESHOLD_PCT } from "./healthScore";

export type BudgetCapStatus = "under" | "watch" | "over";

/** Maps spent:monthlyLimit ratio to a status: <80% → under, 80-100% → watch, >100% → over. monthlyLimit is always > 0 by data-layer contract. */
export function deriveBudgetCapStatus(spent: number, monthlyLimit: number): BudgetCapStatus {
  const pct = (spent / monthlyLimit) * 100;
  if (pct < HEALTH_WATCH_THRESHOLD_PCT) return "under";
  if (pct <= HEALTH_OVERSPEND_THRESHOLD_PCT) return "watch";
  return "over";
}

/** % of monthlyLimit spent. Not clamped above 100 — callers decide how to render overflow. */
export function budgetCapPct(spent: number, monthlyLimit: number): number {
  return (spent / monthlyLimit) * 100;
}
