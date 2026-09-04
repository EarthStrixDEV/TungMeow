// Read-side Sheets access for the TungMeow Web App.
//
// Ported near-verbatim from app/src/data/mockDataService.ts — same filter,
// sort, and pagination semantics, expressed against raw Sheet rows read
// through Cache.gs instead of an in-memory store.
//
// Row model per account tab (see Code.gs TRANSACTION_HEADERS):
//   [0] Date  [1] Description  [2] Category  [3] Type  [4] Amount  [5] Note
// Row 1 is the header; data rows start at sheet row 2, so data row index i
// (0-based, as returned by Cache.getTabRows) corresponds to sheet row i + 2.

/**
 * Maps a single raw data row to a Transaction (see types.ts). Shared by
 * listTransactions and listRecentTransactions so the row layout only lives
 * in one place.
 * @param {string} sheetTabName
 * @param {number} rowIndex - 0-based index within the tab's data rows.
 * @param {Array} row
 * @return {Object} Transaction
 */
function mapRowToTransaction(sheetTabName, rowIndex, row) {
  var rawDate = row[0];
  // getDataRange().getValues() returns Sheet DATE cells as JS Date objects
  // on a fresh (cache-miss) read, but Cache.gs round-trips rows through
  // JSON.stringify/parse for cached reads — JSON.stringify serializes a
  // Date as an ISO datetime string, so a cache HIT hands us a string here
  // instead of a Date. Re-parse in that case so both paths format the same.
  var dateObj = Object.prototype.toString.call(rawDate) === "[object Date]" ? rawDate : new Date(rawDate);
  var date = isNaN(dateObj.getTime())
    ? String(rawDate)
    : Utilities.formatDate(dateObj, "Asia/Bangkok", "yyyy-MM-dd");

  var transaction = {
    id: Utils.buildTransactionId(sheetTabName, rowIndex + 2),
    accountId: "",
    date: date,
    description: row[1],
    category: row[2],
    type: row[3],
    amount: Number(row[4]),
  };

  var note = row[5];
  if (note !== "" && note !== null && note !== undefined) {
    transaction.note = note;
  }

  return transaction;
}

/** date desc, tie-break by row number desc (most recently added first). */
function compareTransactionsDateDesc(a, b) {
  if (a.date !== b.date) {
    return a.date < b.date ? 1 : -1;
  }
  var rowA = Utils.parseTransactionId(a.id).rowNumber;
  var rowB = Utils.parseTransactionId(b.id).rowNumber;
  return rowB - rowA;
}

/**
 * Parses a "yyyy-mm-dd" string (as produced by mapRowToTransaction) as a
 * local Date at midnight — NOT `new Date(iso)`, which V8 parses as UTC
 * midnight and can shift a day backward/forward once converted to local
 * time. Mirrors parseISO in app/src/data/mockDataService.ts exactly.
 * @param {string} iso
 * @return {Date}
 */
function parseISODateLocal(iso) {
  var parts = iso.split("-");
  var y = Number(parts[0]);
  var m = Number(parts[1]);
  var d = Number(parts[2]);
  return new Date(y, m - 1, d);
}

/**
 * Sums income/expense amounts for transactions whose date falls within
 * [start, end) — mirrors sumWindow in mockDataService.ts.
 * @param {Array<Object>} transactions
 * @param {Date} start
 * @param {Date} end
 * @return {Object} { income: number, expense: number }
 */
function sumWindow(transactions, start, end) {
  var income = 0;
  var expense = 0;
  var startMs = start.getTime();
  var endMs = end.getTime();
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    var d = parseISODateLocal(t.date).getTime();
    if (d < startMs || d >= endMs) continue;
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }
  return { income: income, expense: expense };
}

/**
 * Sums expense amounts per category for transactions whose date falls within
 * [start, end) — mirrors expenseByCategoryInWindow in mockDataService.ts.
 * @param {Array<Object>} transactions
 * @param {Date} start
 * @param {Date} end
 * @return {Object} map of category -> summed expense amount
 */
function expenseByCategoryInWindow(transactions, start, end) {
  var byCategory = {};
  var startMs = start.getTime();
  var endMs = end.getTime();
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (t.type !== "expense") continue;
    var d = parseISODateLocal(t.date).getTime();
    if (d < startMs || d >= endMs) continue;
    var prevAmount = Object.prototype.hasOwnProperty.call(byCategory, t.category) ? byCategory[t.category] : 0;
    byCategory[t.category] = prevAmount + t.amount;
  }
  return byCategory;
}

/**
 * Formats a local Date as a "yyyy-mm-dd" string — the inverse of
 * parseISODateLocal, used for the streak day-walk-backward loop.
 * @param {Date} date
 * @return {string}
 */
function toISODateLocal(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1);
  if (m.length < 2) m = "0" + m;
  var d = String(date.getDate());
  if (d.length < 2) d = "0" + d;
  return y + "-" + m + "-" + d;
}

/**
 * Consecutive-day logging streak ending at the most recent logged date —
 * mirrors computeStreak in mockDataService.ts.
 * @param {Array<Object>} transactions
 * @return {Object} { count: number, lastLoggedDate: string|null }
 */
function computeStreak(transactions) {
  var dates = {};
  for (var i = 0; i < transactions.length; i++) {
    dates[transactions[i].date] = true;
  }

  // ISO "yyyy-mm-dd" strings sort lexicographically, so max() is just a string compare.
  var lastLoggedDate = null;
  for (var iso in dates) {
    if (!Object.prototype.hasOwnProperty.call(dates, iso)) continue;
    if (lastLoggedDate === null || iso > lastLoggedDate) lastLoggedDate = iso;
  }
  if (lastLoggedDate === null) {
    return { count: 0, lastLoggedDate: null };
  }

  var count = 0;
  var cursor = parseISODateLocal(lastLoggedDate);
  for (;;) {
    var cursorIso = toISODateLocal(cursor);
    if (!Object.prototype.hasOwnProperty.call(dates, cursorIso)) break;
    count++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }

  return { count: count, lastLoggedDate: lastLoggedDate };
}

/**
 * Prevents Sheets/CSV formula injection: if the trimmed value starts with
 * =, +, -, or @, Sheets would otherwise auto-interpret the cell as a
 * formula on write. Prefixing with a leading apostrophe forces Sheets to
 * treat it as literal text instead.
 * @param {string} value
 * @return {string}
 */
function sanitizeCell(value) {
  var str = String(value);
  var trimmed = str.trim();
  if (
    trimmed.indexOf("=") === 0 ||
    trimmed.indexOf("+") === 0 ||
    trimmed.indexOf("-") === 0 ||
    trimmed.indexOf("@") === 0
  ) {
    return "'" + str;
  }
  return str;
}

/**
 * Shared health check for getConnectionInfo and syncNow: opens the
 * spreadsheet, confirms every account's sheetTabName still exists, and
 * folds the result into a single global ConnectionInfo-shaped object
 * (per the accepted MVP scope — no per-account reconnect granularity).
 *
 * Never throws: an inaccessible/deleted Sheet is a valid "reconnect" state,
 * not a system error, so callers can return this object directly to the
 * client instead of letting Router's catch turn it into an internal_error.
 *
 * The tab-existence check always calls spreadsheet.getSheets() fresh (not
 * cached) — that call is cheap and correctness matters more here than the
 * 60s cache saving would. Meta rows (for the list of expected tab names)
 * are read through Cache.getMetaRows(), which is fine to be up to 60s
 * stale for this purpose.
 *
 * @param {string} sheetId
 * @return {Object} { status: "connected"|"reconnect", sheetName: string, sheetUrl: string }
 */
function checkConnectionHealth(sheetId) {
  var spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.openById(sheetId);
  } catch (err) {
    // Deleted file, revoked access, bad ID, etc. — degrade to "reconnect"
    // rather than propagating. sheetName/sheetUrl are required strings on
    // ConnectionInfo (not optional), so fall back to fixed placeholders.
    return { status: "reconnect", sheetName: "Unknown", sheetUrl: "" };
  }

  var sheetName = spreadsheet.getName();
  var sheetUrl = spreadsheet.getUrl();

  var actualSheets = spreadsheet.getSheets();
  var actualNames = {};
  for (var i = 0; i < actualSheets.length; i++) {
    actualNames[actualSheets[i].getName()] = true;
  }

  var metaRows = Cache.getMetaRows();
  var status = "connected";
  for (var r = 0; r < metaRows.length; r++) {
    var sheetTabName = metaRows[r][3];
    if (!Object.prototype.hasOwnProperty.call(actualNames, sheetTabName)) {
      status = "reconnect";
      break;
    }
  }

  return { status: status, sheetName: sheetName, sheetUrl: sheetUrl };
}

var SheetService = {
  /**
   * @return {Array<Object>} Account[] sorted by sortOrder ascending.
   */
  listAccounts: function () {
    var rows = Cache.getMetaRows();
    var accounts = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      accounts.push({
        id: row[0],
        name: row[1],
        icon: row[2],
        sheetTabName: row[3],
        sortOrder: Number(row[4]),
      });
    }
    accounts.sort(function (a, b) {
      return a.sortOrder - b.sortOrder;
    });
    return accounts;
  },

  /**
   * @return {Array<Object>} AccountSummary[] (Account fields + balance + rowCount).
   */
  listAccountSummaries: function () {
    var accounts = SheetService.listAccounts();
    var summaries = [];
    for (var i = 0; i < accounts.length; i++) {
      var account = accounts[i];
      var rows = Cache.getTabRows(account.sheetTabName);
      var balance = 0;
      for (var r = 0; r < rows.length; r++) {
        var amount = Number(rows[r][4]);
        balance += rows[r][3] === "income" ? amount : -amount;
      }
      summaries.push({
        id: account.id,
        name: account.name,
        icon: account.icon,
        sheetTabName: account.sheetTabName,
        sortOrder: account.sortOrder,
        balance: balance,
        rowCount: rows.length,
      });
    }
    return summaries;
  },

  /**
   * @param {string} accountId
   * @param {Object} query - { page, pageSize, search, type, category }
   * @return {Object} TransactionPage - { items, total, page, pageCount }
   */
  listTransactions: function (accountId, query) {
    query = query || {};
    var accounts = SheetService.listAccounts();
    var account = null;
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].id === accountId) {
        account = accounts[i];
        break;
      }
    }
    if (!account) {
      throw new Error("Unknown account: " + accountId);
    }

    var rows = Cache.getTabRows(account.sheetTabName);
    var search = query.search ? String(query.search).trim().toLowerCase() : "";
    var type = query.type || "all";
    var category = query.category || "all";

    var filtered = [];
    for (var r = 0; r < rows.length; r++) {
      var t = mapRowToTransaction(account.sheetTabName, r, rows[r]);
      t.accountId = account.id;

      if (search) {
        var descMatch = t.description.toLowerCase().indexOf(search) !== -1;
        var catMatch = t.category.toLowerCase().indexOf(search) !== -1;
        if (!descMatch && !catMatch) continue;
      }
      if (type !== "all" && t.type !== type) continue;
      if (category !== "all" && t.category !== category) continue;

      filtered.push(t);
    }

    filtered.sort(compareTransactionsDateDesc);

    var pageSize = query.pageSize || 25;
    var pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    var page = Math.min(Math.max(query.page || 1, 1), pageCount);
    var items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return { items: items, total: filtered.length, page: page, pageCount: pageCount };
  },

  /**
   * @param {number} limit
   * @return {Array<Object>} Transaction[] (+accountName) across all accounts,
   *   sorted date desc, sliced to limit.
   */
  listRecentTransactions: function (limit) {
    var accounts = SheetService.listAccounts();
    var all = [];

    for (var i = 0; i < accounts.length; i++) {
      var account = accounts[i];
      var rows = Cache.getTabRows(account.sheetTabName);
      for (var r = 0; r < rows.length; r++) {
        var t = mapRowToTransaction(account.sheetTabName, r, rows[r]);
        t.accountId = account.id;
        t.accountName = account.name;
        all.push(t);
      }
    }

    all.sort(compareTransactionsDateDesc);
    return all.slice(0, limit);
  },

  /**
   * Appends one transaction row to an account's tab (spec §5: values.append
   * semantics — additive only, never overwrites an existing row).
   * @param {Object} input - { accountId, date, description, category, type, amount, note }
   * @return {Object} Transaction - the server-confirmed row (no `pending` field).
   */
  addTransaction: function (input) {
    if (input.type !== "income" && input.type !== "expense") {
      throw new Error('Invalid type: must be "income" or "expense"');
    }
    if (!isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Invalid amount: must be a positive number");
    }
    if (String(input.description || "").length > 500) {
      throw new Error("description exceeds 500 characters");
    }
    if (String(input.category || "").length > 500) {
      throw new Error("category exceeds 500 characters");
    }
    if (String(input.note || "").length > 500) {
      throw new Error("note exceeds 500 characters");
    }

    var accounts = SheetService.listAccounts();
    var account = null;
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].id === input.accountId) {
        account = accounts[i];
        break;
      }
    }
    if (!account) {
      throw new Error("Unknown account: " + input.accountId);
    }

    var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName(account.sheetTabName);

    sheet.appendRow([
      input.date,
      sanitizeCell(input.description),
      sanitizeCell(input.category),
      input.type,
      input.amount,
      sanitizeCell(input.note || ""),
    ]);
    // getLastRow() right after appendRow, same execution — accurate for this
    // call. A concurrent request between another user's appendRow and their
    // getLastRow could in theory interleave, but that's an accepted MVP risk
    // (single-user app), not something this call builds locking around.
    var rowNumber = sheet.getLastRow();

    Cache.invalidateTab(account.sheetTabName);

    var transaction = {
      id: Utils.buildTransactionId(account.sheetTabName, rowNumber),
      accountId: account.id,
      date: input.date,
      description: input.description,
      category: input.category,
      type: input.type,
      amount: input.amount,
    };

    if (input.note !== "" && input.note !== null && input.note !== undefined) {
      transaction.note = input.note;
    }

    return transaction;
  },

  /**
   * Deletes one transaction row from its account's tab (real deletion, not a
   * soft-delete — spec deviation approved for Round 2). This shifts every
   * subsequent row up by one, so every other transaction's id in that tab is
   * stale after this call; the frontend is responsible for refetching, not
   * patching state locally.
   * @param {string} id - "{sheetTabName}:{rowNumber}"
   * @return {void}
   */
  deleteTransaction: function (id) {
    var parsed = Utils.parseTransactionId(id);

    var accounts = SheetService.listAccounts();
    var account = null;
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].sheetTabName === parsed.sheetTabName) {
        account = accounts[i];
        break;
      }
    }
    if (!account) {
      throw new Error("Unknown account for id: " + id);
    }

    var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName(account.sheetTabName);

    sheet.deleteRow(parsed.rowNumber);

    Cache.invalidateTab(account.sheetTabName);
  },

  /**
   * Dashboard aggregation across all accounts. Ported from
   * mockDataService.getDashboardStats — same balance/window/chart/
   * topCategories semantics, expressed against Cache-backed Sheet rows.
   * @param {string} period - "month" | "quarter" | "year"
   * @return {Object} DashboardStats
   */
  getDashboardStats: function (period) {
    var accounts = SheetService.listAccounts();
    var all = [];
    for (var i = 0; i < accounts.length; i++) {
      var account = accounts[i];
      var rows = Cache.getTabRows(account.sheetTabName);
      for (var r = 0; r < rows.length; r++) {
        all.push(mapRowToTransaction(account.sheetTabName, r, rows[r]));
      }
    }

    // Balance is total money: all-time Σ income − Σ expense across all accounts.
    var balance = 0;
    for (var i2 = 0; i2 < all.length; i2++) {
      balance += all[i2].type === "income" ? all[i2].amount : -all[i2].amount;
    }

    var current = Periods.range(period, 0);
    var previous = Periods.range(period, -1);
    var currentSums = sumWindow(all, current.start, current.end);
    var previousSums = sumWindow(all, previous.start, previous.end);

    var income = currentSums.income;
    var expense = currentSums.expense;
    var currentNet = income - expense;
    var previousNet = previousSums.income - previousSums.expense;
    var balanceDeltaPct =
      previousNet === 0 ? null : ((currentNet - previousNet) / Math.abs(previousNet)) * 100;

    var incomeSources = {};
    var incomeSourceCount = 0;
    var expenseTxCount = 0;
    var currentStartMs = current.start.getTime();
    var currentEndMs = current.end.getTime();

    for (var j = 0; j < all.length; j++) {
      var t = all[j];
      var d = parseISODateLocal(t.date).getTime();
      if (d < currentStartMs || d >= currentEndMs) continue;

      if (t.type === "income") {
        if (!Object.prototype.hasOwnProperty.call(incomeSources, t.category)) {
          incomeSources[t.category] = true;
          incomeSourceCount++;
        }
      } else {
        expenseTxCount++;
      }
    }
    var expenseByCategory = expenseByCategoryInWindow(all, current.start, current.end);

    var chart = [];
    var chartOffsets = [-5, -4, -3, -2, -1, 0];
    for (var k = 0; k < chartOffsets.length; k++) {
      var offset = chartOffsets[k];
      var window_ = Periods.range(period, offset);
      var sums = sumWindow(all, window_.start, window_.end);
      chart.push({
        label: Periods.label(period, offset),
        income: sums.income,
        expense: sums.expense,
      });
    }

    var categoryEntries = [];
    for (var category in expenseByCategory) {
      if (Object.prototype.hasOwnProperty.call(expenseByCategory, category)) {
        categoryEntries.push([category, expenseByCategory[category]]);
      }
    }
    categoryEntries.sort(function (a, b) {
      return b[1] - a[1];
    });
    var ranked = categoryEntries.slice(0, 4);
    var maxAmount = ranked.length > 0 ? ranked[0][1] : 0;

    var topCategories = [];
    for (var n = 0; n < ranked.length; n++) {
      var entryCategory = ranked[n][0];
      var entryAmount = ranked[n][1];
      topCategories.push({
        category: entryCategory,
        emoji: Categories.emoji(entryCategory),
        amount: entryAmount,
        pctOfMax: maxAmount === 0 ? 0 : Math.round((entryAmount / maxAmount) * 100),
      });
    }

    var streak = computeStreak(all);

    // categoryHistory: union of categories seen in the current period + 3 prior periods,
    // each with current-period expense vs. the average of the 3 prior periods (always /3).
    var priorOffsets = [-1, -2, -3];
    var priorWindows = [];
    for (var p = 0; p < priorOffsets.length; p++) {
      var priorRange = Periods.range(period, priorOffsets[p]);
      priorWindows.push(expenseByCategoryInWindow(all, priorRange.start, priorRange.end));
    }

    var categoryKeys = {};
    for (var cCurrent in expenseByCategory) {
      if (Object.prototype.hasOwnProperty.call(expenseByCategory, cCurrent)) {
        categoryKeys[cCurrent] = true;
      }
    }
    for (var w = 0; w < priorWindows.length; w++) {
      for (var cPrior in priorWindows[w]) {
        if (Object.prototype.hasOwnProperty.call(priorWindows[w], cPrior)) {
          categoryKeys[cPrior] = true;
        }
      }
    }

    var categoryHistory = [];
    for (var category2 in categoryKeys) {
      if (!Object.prototype.hasOwnProperty.call(categoryKeys, category2)) continue;
      var currentAmount = Object.prototype.hasOwnProperty.call(expenseByCategory, category2)
        ? expenseByCategory[category2]
        : 0;
      var priorSum = 0;
      for (var w2 = 0; w2 < priorWindows.length; w2++) {
        priorSum += Object.prototype.hasOwnProperty.call(priorWindows[w2], category2)
          ? priorWindows[w2][category2]
          : 0;
      }
      categoryHistory.push({
        category: category2,
        emoji: Categories.emoji(category2),
        current: currentAmount,
        avgPrior3: priorSum / 3,
      });
    }

    var earliestTransactionDate = null;
    for (var e = 0; e < all.length; e++) {
      if (earliestTransactionDate === null || all[e].date < earliestTransactionDate) {
        earliestTransactionDate = all[e].date;
      }
    }

    return {
      balance: balance,
      income: income,
      expense: expense,
      balanceDeltaPct: balanceDeltaPct,
      incomeSourceCount: incomeSourceCount,
      expenseTxCount: expenseTxCount,
      chart: chart,
      topCategories: topCategories,
      streak: streak,
      categoryHistory: categoryHistory,
      earliestTransactionDate: earliestTransactionDate,
    };
  },

  /**
   * Connection health for the Settings connection card (spec §7.4/§6.3).
   * Never throws on a broken connection — a deleted/inaccessible Sheet is a
   * valid "reconnect" response, not a system error (see checkConnectionHealth).
   * A missing SHEET_ID script property is a genuine setup/config error, so
   * that case IS allowed to throw — Router's catch turns it into a normal
   * internal_error envelope, which is appropriate since there's no sensible
   * ConnectionInfo to return when the app isn't configured at all.
   * @return {Object} ConnectionInfo
   */
  getConnectionInfo: function () {
    var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    if (!sheetId) {
      throw new Error("SHEET_ID script property is not set.");
    }

    var health = checkConnectionHealth(sheetId);

    // lastSyncedAt is only ever written by syncNow (mirrors mockDataService,
    // where the mock store seeds it once at init and syncNow is the only
    // other writer). The Apps Script backend has no equivalent "init" step,
    // so before the very first syncNow ever runs, LAST_SYNCED_AT won't exist
    // as a script property yet. formatRelativeTime on the frontend still
    // needs SOME valid ISO string to render on that first call, so fall back
    // to "now" — this reads as "just synced" until the user's first real
    // syncNow overwrites it, which is a reasonable default (not stale, not
    // an error) rather than a fixed epoch that would render as "years ago".
    var lastSyncedAt =
      PropertiesService.getScriptProperties().getProperty("LAST_SYNCED_AT") ||
      new Date().toISOString();

    return {
      sheetName: health.sheetName,
      status: health.status,
      lastSyncedAt: lastSyncedAt,
      sheetUrl: health.sheetUrl,
    };
  },

  /**
   * Settings "Sync now" action (spec §5, §7.4): bypasses the 60s cache by
   * invalidating every currently-registered tab plus the meta cache, then
   * re-checks connection health and stamps LAST_SYNCED_AT.
   * @return {Object} ConnectionInfo (post-update lastSyncedAt)
   */
  syncNow: function () {
    var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    if (!sheetId) {
      throw new Error("SHEET_ID script property is not set.");
    }

    // Fresh (uncached) meta read so a tab added moments ago is still
    // included in the invalidation set — a cached meta list could miss it.
    Cache.invalidateMeta();
    var metaRows = Cache.getMetaRows();
    var tabNames = [];
    for (var i = 0; i < metaRows.length; i++) {
      tabNames.push(metaRows[i][3]);
    }
    Cache.invalidateAll(tabNames);

    var health = checkConnectionHealth(sheetId);

    var lastSyncedAt = new Date().toISOString();
    PropertiesService.getScriptProperties().setProperty("LAST_SYNCED_AT", lastSyncedAt);

    return {
      sheetName: health.sheetName,
      status: health.status,
      lastSyncedAt: lastSyncedAt,
      sheetUrl: health.sheetUrl,
    };
  },

  /**
   * @return {Array<Object>} BudgetCap[] - { category, monthlyLimit, createdAt }, unsorted.
   */
  getBudgetCaps: function () {
    var rows = Cache.getBudgetCapRows();
    var caps = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      caps.push({
        category: row[0],
        monthlyLimit: Number(row[1]),
        createdAt: row[2],
      });
    }
    return caps;
  },

  /**
   * Upserts or deletes a per-category monthly budget cap (spec: A1 Budget
   * Cap). monthlyLimit <= 0 (or not a finite number) deletes the cap row for
   * that category if one exists; a no-op otherwise. Idempotent either way.
   * @param {string} category
   * @param {number} monthlyLimit
   * @return {Object|null} BudgetCap - { category, monthlyLimit, createdAt } -
   *   or null when the cap was deleted or doesn't exist.
   */
  setBudgetCap: function (category, monthlyLimit) {
    var rows = Cache.getBudgetCapRows();
    var existingIndex = -1;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === category) {
        existingIndex = i;
        break;
      }
    }

    var shouldDelete = !isFinite(monthlyLimit) || monthlyLimit <= 0;

    if (shouldDelete) {
      if (existingIndex === -1) {
        return null;
      }
      var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
      var spreadsheet = SpreadsheetApp.openById(sheetId);
      var sheet = spreadsheet.getSheetByName(BUDGET_CAPS_SHEET_NAME);
      sheet.deleteRow(existingIndex + 2);
      Cache.invalidateBudgetCaps();
      return null;
    }

    var sheetId2 = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    var spreadsheet2 = SpreadsheetApp.openById(sheetId2);
    var sheet2 = spreadsheet2.getSheetByName(BUDGET_CAPS_SHEET_NAME);

    if (existingIndex !== -1) {
      var rowNumber = existingIndex + 2;
      sheet2.getRange(rowNumber, 2).setValue(monthlyLimit);
      Cache.invalidateBudgetCaps();
      return {
        category: category,
        monthlyLimit: monthlyLimit,
        createdAt: rows[existingIndex][2],
      };
    }

    var createdAt = new Date().toISOString();
    sheet2.appendRow([category, monthlyLimit, createdAt]);
    Cache.invalidateBudgetCaps();
    return {
      category: category,
      monthlyLimit: monthlyLimit,
      createdAt: createdAt,
    };
  },
};
