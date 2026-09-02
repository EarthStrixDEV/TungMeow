export const ANOMALY_THRESHOLD_PCT = 30;

export interface AnomalyEntry {
  category: string;
  emoji: string;
  current: number;
  avgPrior3: number;
  pctOver: number;
}

/** Categories whose current-period spend exceeds their 3-prior-period average by more than the threshold, sorted desc, capped at 3. */
export function detectAnomalies(
  categoryHistory: { category: string; emoji: string; current: number; avgPrior3: number }[],
  hasEnoughHistory: boolean,
): AnomalyEntry[] {
  if (!hasEnoughHistory) return [];
  return categoryHistory
    .filter((c) => c.avgPrior3 > 0 && ((c.current - c.avgPrior3) / c.avgPrior3) * 100 > ANOMALY_THRESHOLD_PCT)
    .map((c) => ({ ...c, pctOver: ((c.current - c.avgPrior3) / c.avgPrior3) * 100 }))
    .sort((a, b) => b.pctOver - a.pctOver)
    .slice(0, 3);
}
