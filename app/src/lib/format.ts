import type { TransactionType } from "../data/types";

const MINUS = "−"; // typographic minus, matches the wireframe

function thb(abs: number): string {
  const rounded = Math.round(abs * 100) / 100;
  return (
    "฿" +
    rounded.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    })
  );
}

/** `฿48,320` — integer display; decimals (max 2) only when non-integer. */
export function formatTHB(n: number): string {
  return n < 0 ? MINUS + thb(-n) : thb(n);
}

/** `+฿8,500` for income, `−฿120` for expense (U+2212 minus). */
export function formatSignedTHB(n: number, type: TransactionType): string {
  return (type === "income" ? "+" : MINUS) + thb(Math.abs(n));
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `"2026-08-31"` → `31 Aug 2026`. Parses the ISO parts directly to avoid UTC shift. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** `Monday, 31 August 2026`. */
export function formatFullDate(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${weekday}, ${d.getDate()} ${month} ${d.getFullYear()}`;
}

/** "just now" / "2 min ago" / "3 hr ago" / "5 days ago". */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
