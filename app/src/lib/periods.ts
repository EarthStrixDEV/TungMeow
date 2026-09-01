import type { Period } from "../data/types";

/**
 * Calendar window for a period at a given offset from the current one
 * (offset 0 = current, -1 = previous, …). `end` is exclusive: the first
 * instant of the next window.
 */
export function periodRange(
  period: Period,
  offset: number,
  now: Date = new Date(),
): { start: Date; end: Date } {
  const y = now.getFullYear();
  switch (period) {
    case "month": {
      const m = now.getMonth() + offset;
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1) };
    }
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3) + offset;
      return { start: new Date(y, q * 3, 1), end: new Date(y, (q + 1) * 3, 1) };
    }
    case "year":
      return { start: new Date(y + offset, 0, 1), end: new Date(y + offset + 1, 0, 1) };
  }
}

/** Chart label for a period window: "Mar" / "Q1 25" / "2026". */
export function periodLabel(period: Period, offset: number, now: Date = new Date()): string {
  const { start } = periodRange(period, offset, now);
  switch (period) {
    case "month":
      return start.toLocaleDateString("en-US", { month: "short" });
    case "quarter":
      return `Q${Math.floor(start.getMonth() / 3) + 1} ${String(start.getFullYear()).slice(-2)}`;
    case "year":
      return String(start.getFullYear());
  }
}
