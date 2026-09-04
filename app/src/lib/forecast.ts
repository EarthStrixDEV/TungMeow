import { periodRange } from "./periods";
import type { Period } from "../data/types";

export const MIN_DAYS_FOR_FORECAST = 5;

const DAY_MS = 86_400_000;

export interface ForecastResult {
  projectedBalance: number | null;
  daysElapsed: number;
  daysRemaining: number;
  avgDailyExpense: number;
  hasEnoughData: boolean;
}

/**
 * Projects end-of-period balance from the average daily expense rate so
 * far this period. Returns `projectedBalance: null` (with a `hasEnoughData`
 * flag) instead of a number until at least `MIN_DAYS_FOR_FORECAST` days of
 * the current period have elapsed, so callers can show a disclaimer rather
 * than a falsely confident figure.
 */
export function computeForecast(
  balance: number,
  expense: number,
  period: Period,
  now: Date = new Date(),
): ForecastResult {
  const { start, end } = periodRange(period, 0, now);
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1;
  const totalDaysInPeriod = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  const daysRemaining = Math.max(0, totalDaysInPeriod - daysElapsed);
  const hasEnoughData = daysElapsed >= MIN_DAYS_FOR_FORECAST;
  const avgDailyExpense = daysElapsed > 0 ? expense / daysElapsed : 0;
  const projectedBalance = hasEnoughData ? balance - avgDailyExpense * daysRemaining : null;

  return { projectedBalance, daysElapsed, daysRemaining, avgDailyExpense, hasEnoughData };
}
