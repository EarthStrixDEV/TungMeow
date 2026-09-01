// Shared helpers for the TungMeow Web App: response envelope + transaction id codec.

var Utils = {
  /**
   * Wraps a response envelope object as a ContentService JSON text output,
   * ready for doGet/doPost to return directly.
   */
  jsonResponse: function (envelope) {
    return ContentService.createTextOutput(JSON.stringify(envelope)).setMimeType(
      ContentService.MimeType.JSON
    );
  },

  /**
   * Parses a transaction id of the form "{sheetTabName}:{rowNumber}" back into
   * its parts. Splits on the LAST colon so a sheet tab name could theoretically
   * contain a colon without breaking the parse.
   */
  parseTransactionId: function (id) {
    var idx = id.lastIndexOf(":");
    return {
      sheetTabName: id.slice(0, idx),
      rowNumber: Number(id.slice(idx + 1)),
    };
  },

  /**
   * Inverse of parseTransactionId: builds "{sheetTabName}:{rowNumber}".
   */
  buildTransactionId: function (sheetTabName, rowNumber) {
    return sheetTabName + ":" + rowNumber;
  },
};
