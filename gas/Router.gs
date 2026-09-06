// Single dispatch point for the TungMeow Web App, used by both doGet and doPost.
//
// Contract: every action below calls a same-named method on the SheetService
// namespace object (implemented in SheetService.gs, not yet written). Router
// only validates the token, dispatches on params.action, and normalizes
// errors into the response envelope — it holds no Sheets-reading logic itself.
//
// Transport: every action except ocrSlip is called via doGet (query string
// params), never doPost. This is deliberate: a cross-origin GET has no
// preflight, while a cross-origin POST with a JSON body triggers an OPTIONS
// preflight that Apps Script Web Apps cannot satisfy. Router.handleRequest
// is transport-agnostic (it just reads flat params, regardless of source).
//
// ocrSlip is the sole exception (Slip OCR + Auto-fill feature): its base64
// image/PDF payload can exceed practical URL length limits, so it is sent
// via doPost with Content-Type: text/plain — that content type makes the
// browser treat the request as a CORS "simple request" and skip the OPTIONS
// preflight GAS Web Apps can't answer. See Code.gs's doGet/doPost comment
// for the full rationale. Do not design any OTHER action around POST
// semantics — this exception is scoped to ocrSlip only.
//
// Response envelope shape:
//   success: { ok: true, data: <payload> }
//   failure: { ok: false, error: { code: string, message: string } }

var Router = {
  /**
   * @param {Object} params - merged query/body params. Always has .token and
   *   .action as strings; other fields are action-specific (see cases below).
   * @return {Object} response envelope (not yet stringified — see Utils.jsonResponse).
   */
  handleRequest: function (params) {
    params = params || {};

    if (!isValidToken(params.token)) {
      return { ok: false, error: { code: "unauthorized", message: "Invalid token" } };
    }

    try {
      switch (params.action) {
        case "listAccounts":
          return { ok: true, data: SheetService.listAccounts() };

        case "listAccountSummaries":
          return { ok: true, data: SheetService.listAccountSummaries() };

        case "listTransactions":
          return {
            ok: true,
            data: SheetService.listTransactions(params.accountId, {
              page: Number(params.page) || 1,
              pageSize: Number(params.pageSize) || 25,
              search: params.search || "",
              type: params.type || "all",
              category: params.category || "all",
            }),
          };

        case "listRecentTransactions":
          return {
            ok: true,
            data: SheetService.listRecentTransactions(Number(params.limit) || 10),
          };

        case "addTransaction":
          // Sent via GET query string (URLSearchParams-encoded by the frontend),
          // same as every other action — not a POST body. e.parameter already
          // URL-decodes each field, so description/note with & # etc. arrive intact.
          return {
            ok: true,
            data: SheetService.addTransaction({
              accountId: params.accountId,
              date: params.date,
              description: params.description,
              category: params.category,
              type: params.type,
              amount: Number(params.amount),
              note: params.note || "",
            }),
          };

        case "deleteTransaction":
          // Sent via GET query string like every other action. params.id is the
          // full "{sheetTabName}:{rowNumber}" transaction id; SheetService parses
          // it via Utils.parseTransactionId. Real row deletion — every other
          // transaction's id in that tab may shift, so there's nothing to return
          // beyond a bare success signal.
          SheetService.deleteTransaction(params.id);
          return { ok: true, data: null };

        case "getDashboardStats":
          return {
            ok: true,
            data: SheetService.getDashboardStats(params.period || "month"),
          };

        case "getConnectionInfo":
          return { ok: true, data: SheetService.getConnectionInfo() };

        case "syncNow":
          return { ok: true, data: SheetService.syncNow() };

        case "getBudgetCaps":
          return { ok: true, data: SheetService.getBudgetCaps() };

        case "setBudgetCap":
          // Sent via GET query string like every other action. amount <= 0
          // (or missing) tells SheetService to delete the cap for that
          // category, so data may legitimately be null.
          return {
            ok: true,
            data: SheetService.setBudgetCap(params.category, Number(params.monthlyLimit)),
          };

        case "ocrSlip":
          // Sole POST-transport action — see the header comment above and
          // Code.gs's doPost. Never throws for "couldn't read this slip";
          // AiService.ocrSlip resolves ocrFailed:true instead so this always
          // returns { ok: true, data: ... }.
          return {
            ok: true,
            data: AiService.ocrSlip(params.imageBase64, params.mimeType),
          };

        default:
          return {
            ok: false,
            error: { code: "unknown_action", message: "Unknown action: " + params.action },
          };
      }
    } catch (err) {
      return { ok: false, error: { code: "internal_error", message: String(err) } };
    }
  },
};
