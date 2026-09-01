// One-time bootstrap: run setupSheet() manually from the Apps Script editor
// to create the account tabs + hidden meta tab. Not exposed via the Web App router.

const META_SHEET_CREATED_AT = "2026-09-01T00:00:00.000Z";

const SEED_ACCOUNTS = [
  { id: "cash", name: "Cash", icon: "💵", sheetTabName: "Cash", sortOrder: 0 },
  { id: "bank-kbank", name: "Bank — KBank", icon: "🏦", sheetTabName: "Bank_KBank", sortOrder: 1 },
  { id: "credit-card", name: "Credit Card", icon: "💳", sheetTabName: "Credit_Card", sortOrder: 2 },
  { id: "savings", name: "Savings", icon: "🐷", sheetTabName: "Savings", sortOrder: 3 },
];

const TRANSACTION_HEADERS = ["Date", "Description", "Category", "Type", "Amount", "Note"];
const META_SHEET_NAME = "_TungMeow_Meta";
const META_HEADERS = ["id", "name", "icon", "sheetTabName", "sortOrder", "createdAt"];

function setupSheet() {
  var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!sheetId) {
    throw new Error(
      "SHEET_ID is not set. Set it first: Project Settings > Script Properties > add SHEET_ID with your spreadsheet ID."
    );
  }

  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var createdTabs = [];
  var existingTabs = [];

  for (var i = 0; i < SEED_ACCOUNTS.length; i++) {
    var account = SEED_ACCOUNTS[i];
    var result = setupAccountTab(spreadsheet, account);
    if (result.created) {
      createdTabs.push(account.sheetTabName);
    } else {
      existingTabs.push(account.sheetTabName);
    }
  }

  var metaResult = setupMetaTab(spreadsheet);

  Logger.log(
    "setupSheet done. Account tabs created: [%s]. Already existed: [%s]. Meta tab created: %s. Meta rows appended: %s.",
    createdTabs.join(", "),
    existingTabs.join(", "),
    metaResult.tabCreated,
    metaResult.rowsAppended.join(", ")
  );
}

function setupAccountTab(spreadsheet, account) {
  var sheet = spreadsheet.getSheetByName(account.sheetTabName);
  var created = false;

  if (!sheet) {
    sheet = spreadsheet.insertSheet(account.sheetTabName);
    created = true;
  }

  var headerRange = sheet.getRange(1, 1, 1, TRANSACTION_HEADERS.length);
  headerRange.setValues([TRANSACTION_HEADERS]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#f0ebe4");
  sheet.setFrozenRows(1);

  return { created: created };
}

function setupMetaTab(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(META_SHEET_NAME);
  var tabCreated = false;

  if (!sheet) {
    sheet = spreadsheet.insertSheet(META_SHEET_NAME);
    tabCreated = true;
  }

  var headerRange = sheet.getRange(1, 1, 1, META_HEADERS.length);
  headerRange.setValues([META_HEADERS]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#f0ebe4");
  sheet.setFrozenRows(1);

  var existingIds = [];
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var idColumn = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var r = 0; r < idColumn.length; r++) {
      existingIds.push(idColumn[r][0]);
    }
  }

  var rowsAppended = [];
  for (var i = 0; i < SEED_ACCOUNTS.length; i++) {
    var account = SEED_ACCOUNTS[i];
    if (existingIds.indexOf(account.id) !== -1) continue;

    sheet.appendRow([
      account.id,
      account.name,
      account.icon,
      account.sheetTabName,
      account.sortOrder,
      META_SHEET_CREATED_AT,
    ]);
    rowsAppended.push(account.id);
  }

  if (!sheet.isSheetHidden()) {
    sheet.hideSheet();
  }

  return { tabCreated: tabCreated, rowsAppended: rowsAppended };
}

// --- Web App entry points -------------------------------------------------
// Dispatch is handled by Router.handleRequest (Router.gs); response envelopes
// are serialized by Utils.jsonResponse (Utils.gs).
//
// doGet is the ONLY path the MVP frontend uses, for all 8 actions including
// addTransaction and syncNow — params arrive as URL query string via
// e.parameter (GAS URL-decodes each field automatically, so description/note
// values containing & # etc. arrive intact as long as the frontend encodes
// them with URLSearchParams, which it does). This avoids the CORS preflight
// that a cross-origin POST with a JSON body would trigger, which Apps Script
// Web Apps cannot satisfy.
//
// doPost exists only as a defensive fallback (e.g. manual/non-browser
// callers); it is NOT used by the frontend and no action's contract should
// be designed around POST semantics.

function doGet(e) {
  return Utils.jsonResponse(Router.handleRequest(e.parameter || {}));
}

function doPost(e) {
  var params = {};
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    // Malformed JSON body: fall through with empty params so Router reports
    // unauthorized/unknown_action instead of throwing here.
  }
  return Utils.jsonResponse(Router.handleRequest(params));
}
