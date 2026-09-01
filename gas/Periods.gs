// Calendar period math for the TungMeow Web App.
//
// Ported verbatim from app/src/lib/periods.ts — same offset semantics
// (offset 0 = current period, negative = further in the past) and the same
// exclusive `end` boundary (first instant of the next window).
//
// GAS's V8 runtime Date behaves like browser JS Date, so this is a near
// 1:1 port. periodLabel's "month" case uses toLocaleDateString("en-US",
// { month: "short" }) in the TS source; Apps Script V8 does support
// Intl-backed toLocaleDateString with an options object (V8's full ICU
// build), so that call is kept as-is rather than hardcoding a month-name
// array.

var Periods = {
  /**
   * Calendar window for a period at a given offset from the current one
   * (offset 0 = current, -1 = previous, …). `end` is exclusive: the first
   * instant of the next window.
   * @param {string} period - "month" | "quarter" | "year"
   * @param {number} offset
   * @return {Object} { start: Date, end: Date }
   */
  range: function (period, offset) {
    var now = new Date();
    var y = now.getFullYear();

    if (period === "month") {
      var m = now.getMonth() + offset;
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1) };
    }

    if (period === "quarter") {
      var q = Math.floor(now.getMonth() / 3) + offset;
      return { start: new Date(y, q * 3, 1), end: new Date(y, (q + 1) * 3, 1) };
    }

    // period === "year"
    return { start: new Date(y + offset, 0, 1), end: new Date(y + offset + 1, 0, 1) };
  },

  /**
   * Chart label for a period window: "Mar" / "Q1 25" / "2026".
   * @param {string} period - "month" | "quarter" | "year"
   * @param {number} offset
   * @return {string}
   */
  label: function (period, offset) {
    var start = Periods.range(period, offset).start;

    if (period === "month") {
      return start.toLocaleDateString("en-US", { month: "short" });
    }

    if (period === "quarter") {
      var q = Math.floor(start.getMonth() / 3) + 1;
      var yy = String(start.getFullYear()).slice(-2);
      return "Q" + q + " " + yy;
    }

    // period === "year"
    return String(start.getFullYear());
  },
};
