import { deriveHealthStatus } from "./healthScore";
import type { AccountSummary, DashboardStats } from "../data/types";

export interface BadgeCheckContext {
  stats: DashboardStats;
  accountSummaries: AccountSummary[];
}

export interface BadgeDef {
  id: string;
  label: string;
  description: string;
  emoji: string;
  check: (ctx: BadgeCheckContext) => boolean;
}

/**
 * Starter badge set. Each `check` is pure and stateless — it only reports
 * whether the condition is currently true; `badgeEvaluator.ts` is what
 * decides whether that's a *new* unlock worth celebrating.
 */
export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first-transaction",
    label: "First Steps",
    description: "Log your very first transaction.",
    emoji: "🐾",
    check: (ctx) => ctx.stats.earliestTransactionDate !== null,
  },
  {
    id: "streak-7",
    label: "Week Warrior",
    description: "Log transactions 7 days in a row.",
    emoji: "🔥",
    check: (ctx) => ctx.stats.streak.count >= 7,
  },
  {
    id: "streak-30",
    label: "Monthly Master",
    description: "Log transactions 30 days in a row.",
    emoji: "🏆",
    check: (ctx) => ctx.stats.streak.count >= 30,
  },
  {
    id: "multi-category",
    label: "Category Explorer",
    description: "Spend across 4 or more categories in one period.",
    emoji: "🗂️",
    check: (ctx) => ctx.stats.topCategories.length >= 4,
  },
  {
    id: "healthy-period",
    label: "In the Green",
    description: "Keep your health score 🟢 Healthy for a period.",
    emoji: "🟢",
    check: (ctx) => deriveHealthStatus(ctx.stats.income, ctx.stats.expense) === "healthy",
  },
  {
    id: "income-logged",
    label: "Money In",
    description: "Log at least one income source in a period.",
    emoji: "💰",
    check: (ctx) => ctx.stats.incomeSourceCount > 0,
  },
];
