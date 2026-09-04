import type { BadgeDef } from "./badges";
import { BADGE_DEFS } from "./badges";
import type { UnlockedBadge } from "./localBadges";
import type { SavingsGoal } from "./localGoals";
import { periodRange } from "./periods";
import { progressPct } from "./savingsProgress";
import { savedBowlsOfCatFood } from "./wrapupCopy";
import type { DashboardStats, Period } from "../data/types";

export interface WrapupData {
  period: Period;
  income: number;
  expense: number;
  topCategory: { category: string; emoji: string; amount: number } | null;
  balanceChange: number | null;
  hasTransactions: boolean;
  savingsGoalProgressPct: number | null;
  badgesEarnedThisMonth: BadgeDef[];
  savedBowls: number;
}

/**
 * Assembles Monthly Wrap-up data from the current period's DashboardStats
 * (i.e. "this month so far" — DashboardStats doesn't expose a fully-closed
 * prior period's top category / balance change, only trailing income/expense
 * in `chart`, so this stays honestly frontend-only rather than inventing a
 * new backend call).
 */
export function buildWrapupData(
  stats: DashboardStats,
  period: Period,
  savingsGoal: SavingsGoal | null,
  savingsBalance: number | null,
  unlockedBadges: Record<string, UnlockedBadge>,
  now: Date = new Date(),
): WrapupData {
  const hasTransactions = stats.income > 0 || stats.expense > 0;
  const topCategory = stats.topCategories[0]
    ? {
        category: stats.topCategories[0].category,
        emoji: stats.topCategories[0].emoji,
        amount: stats.topCategories[0].amount,
      }
    : null;

  const savingsGoalProgressPct =
    savingsGoal && savingsBalance !== null ? progressPct(savingsBalance, savingsGoal.targetAmount) : null;

  const { start } = periodRange(period, 0, now);
  const badgesEarnedThisMonth = BADGE_DEFS.filter((badge) => {
    const unlocked = unlockedBadges[badge.id];
    if (!unlocked) return false;
    return new Date(unlocked.unlockedAt) >= start;
  });

  return {
    period,
    income: stats.income,
    expense: stats.expense,
    topCategory,
    balanceChange: stats.balanceDeltaPct,
    hasTransactions,
    savingsGoalProgressPct,
    badgesEarnedThisMonth,
    savedBowls: savedBowlsOfCatFood(stats.income - stats.expense),
  };
}
