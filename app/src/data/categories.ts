/** Fixed category enum per spec §4.1 — hardcoded client-side, not stored data. */

export interface Category {
  /** Doubles as the display label, e.g. "Food". */
  id: string;
  emoji: string;
}

export const INCOME_CATEGORIES: Category[] = [
  { id: "Salary", emoji: "💼" },
  { id: "Gift", emoji: "🎁" },
  { id: "Investment", emoji: "📈" },
  { id: "Other", emoji: "✨" },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: "Food", emoji: "🍜" },
  { id: "Transport", emoji: "🚕" },
  { id: "Bills", emoji: "🏠" },
  { id: "Shopping", emoji: "🛍️" },
  { id: "Entertainment", emoji: "🎬" },
  { id: "Other", emoji: "✨" },
];

const EMOJI_BY_CATEGORY: Record<string, string> = Object.fromEntries(
  [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((c) => [c.id, c.emoji]),
);

/** Emoji glyph for a category label; falls back to the "Other" sparkle. */
export function categoryEmoji(category: string): string {
  return EMOJI_BY_CATEGORY[category] ?? "✨";
}
