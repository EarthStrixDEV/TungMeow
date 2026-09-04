export const MILESTONES = [25, 50, 75, 100] as const;
export type Milestone = (typeof MILESTONES)[number];

/** % of target reached by the current balance. Not clamped above 100 — callers decide how to render overflow. */
export function progressPct(balance: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return (balance / targetAmount) * 100;
}

/** Highest milestone the given % has crossed, or null if under 25%. */
export function highestMilestoneReached(pct: number): Milestone | null {
  let reached: Milestone | null = null;
  for (const m of MILESTONES) {
    if (pct >= m) reached = m;
  }
  return reached;
}
