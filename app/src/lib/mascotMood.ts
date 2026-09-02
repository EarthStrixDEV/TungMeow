export type MascotMood = "happy" | "neutral" | "worried";

const WORRIED_THRESHOLD_PCT = -10;

/** Maps balance-change % vs last period to a mascot mood: null → neutral (no history), < -10% → worried, else happy. */
export function deriveMascotMood(balanceDeltaPct: number | null): MascotMood {
  if (balanceDeltaPct === null) return "neutral";
  if (balanceDeltaPct < WORRIED_THRESHOLD_PCT) return "worried";
  return "happy";
}
