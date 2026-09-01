// Cache-through layer over Sheets reads for the TungMeow Web App.
//
// Uses CacheService.getScriptCache() (60s TTL) so repeated read actions
// within a short window don't re-hit Sheets. Cache keys:
//   tab data rows:  "tx:" + sheetTabName
//   meta rows:      "meta:accounts"
//
// Cached values are JSON-stringified row arrays (header row already sliced
// off), matching what SheetService needs directly off getDataRange().getValues().

var CACHE_TTL_SECONDS = 60;

var Cache = {
  /**
   * Cache-through read of a tab's data rows (header row excluded).
   * @param {string} sheetTabName
   * @return {Array<Array<*>>}
   */
  getTabRows: function (sheetTabName) {
    var cache = CacheService.getScriptCache();
    var key = "tx:" + sheetTabName;
    var cached = cache.get(key);
    if (cached !== null) {
      return JSON.parse(cached);
    }

    var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName(sheetTabName);
    var values = sheet.getDataRange().getValues();
    var rows = values.slice(1);

    cache.put(key, JSON.stringify(rows), CACHE_TTL_SECONDS);
    return rows;
  },

  /**
   * Invalidates the cached data rows for a single tab.
   * @param {string} sheetTabName
   */
  invalidateTab: function (sheetTabName) {
    CacheService.getScriptCache().remove("tx:" + sheetTabName);
  },

  /**
   * Invalidates the cached data rows for multiple tabs.
   * @param {Array<string>} sheetTabNames
   */
  invalidateAll: function (sheetTabNames) {
    var cache = CacheService.getScriptCache();
    var keys = [];
    for (var i = 0; i < sheetTabNames.length; i++) {
      keys.push("tx:" + sheetTabNames[i]);
    }
    cache.removeAll(keys);
  },

  /**
   * Cached read of the _TungMeow_Meta tab's data rows (header row excluded).
   * @return {Array<Array<*>>}
   */
  getMetaRows: function () {
    var cache = CacheService.getScriptCache();
    var key = "meta:accounts";
    var cached = cache.get(key);
    if (cached !== null) {
      return JSON.parse(cached);
    }

    var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName(META_SHEET_NAME);
    var values = sheet.getDataRange().getValues();
    var rows = values.slice(1);

    cache.put(key, JSON.stringify(rows), CACHE_TTL_SECONDS);
    return rows;
  },

  /**
   * Invalidates the cached meta rows.
   */
  invalidateMeta: function () {
    CacheService.getScriptCache().remove("meta:accounts");
  },
};
