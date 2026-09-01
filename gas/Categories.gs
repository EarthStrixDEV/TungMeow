// Fixed category → emoji lookup for the TungMeow Web App.
//
// Ported verbatim from app/src/data/categories.ts — same category set and
// the same "✨" fallback for unknown categories.

var CATEGORY_EMOJI = {
  // Income
  Salary: "💼",
  Gift: "🎁",
  Investment: "📈",
  // Expense
  Food: "🍜",
  Transport: "🚕",
  Bills: "🏠",
  Shopping: "🛍️",
  Entertainment: "🎬",
  // Shared by both income and expense lists in categories.ts; same emoji either way.
  Other: "✨",
};

var Categories = {
  /**
   * Emoji glyph for a category label; falls back to the "Other" sparkle.
   * @param {string} category
   * @return {string}
   */
  emoji: function (category) {
    var emoji = CATEGORY_EMOJI[category];
    return emoji !== undefined ? emoji : "✨";
  },
};
