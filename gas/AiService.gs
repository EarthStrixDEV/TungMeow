// Typhoon (SCB10X) integration for Slip OCR + Auto-fill Transaction.
//
// Two-stage pipeline, both stages hitting the same OpenAI-compatible
// POST /v1/chat/completions endpoint (Typhoon has no separate "/ocr" REST
// endpoint — see _runStage1's comment for the reference implementation this
// mirrors):
//   Stage 1 — image/PDF -> raw markdown/text transcription, via the
//     "typhoon-ocr" vision model.
//   Stage 2 — raw text -> strict JSON extraction against a fixed schema, via
//     the "typhoon-v2.5-30b-a3b-instruct" text model (Typhoon's flagship
//     instruct model — typhoon-ocr itself is vision/transcription-only and
//     is not used for this stage).
// Both calls authenticate with TYPHOON_OCR_API_KEY (Script Properties — see
// gas/DEPLOYMENT.md; never present in the client bundle).
//
// Anti-hallucination discipline: both stage prompts instruct the model to
// return null/low-confidence for anything not clearly legible rather than
// invent a plausible-looking value. _normalizeResult is a defensive backstop
// that re-validates category against the fixed enum regardless of what the
// model returned, so an invalid category string can never reach the client.
//
// This is a Non-Goals exception: TungMeow's PRDs otherwise state "no AI/LLM
// integration" as a hard rule. This file is the sole, explicitly-approved
// carve-out for the Slip OCR feature (see .claude/agents/bow.md item 5) — do
// not treat its existence as license to add AI/LLM calls anywhere else.

var AI_REQUEST_TIMEOUT_MS = 20000; // total soft budget across BOTH stages, per PRD (<=20s)
var AI_STAGE1_TIMEOUT_MS = 12000; // image -> text is usually the slower stage (larger payload)
var AI_STAGE2_TIMEOUT_MS = 8000; // text -> JSON is a smaller, faster call

var TYPHOON_OCR_BASE_URL = "https://api.opentyphoon.ai/v1";

var OCR_VALID_CATEGORIES = {
  Salary: true,
  Gift: true,
  Investment: true,
  Food: true,
  Transport: true,
  Bills: true,
  Shopping: true,
  Entertainment: true,
  Other: true,
};

var AiService = {
  /**
   * Runs the full 2-stage OCR pipeline on one uploaded slip.
   * Never throws for "couldn't read this slip" — every failure mode resolves
   * to an OcrSlipResult with ocrFailed:true and a Thai-friendly failureReason,
   * so Router can always return { ok: true, data: ... }. Only lets a genuine
   * programming error escape (caught by Router's own try/catch as usual).
   * @param {string} imageBase64 - base64 bytes, no "data:" URI prefix.
   * @param {string} mimeType - e.g. "image/jpeg", "image/png", "application/pdf".
   * @return {Object} OcrSlipResult (see app/src/data/types.ts).
   */
  ocrSlip: function (imageBase64, mimeType) {
    var startedAt = new Date().getTime();

    var stage1Text;
    try {
      stage1Text = AiService._runStage1(imageBase64, mimeType, AI_STAGE1_TIMEOUT_MS);
    } catch (err) {
      return AiService._failureResult("อ่านสลิปไม่สำเร็จ ลองถ่ายรูปใหม่ให้ชัดขึ้นนะคะ");
    }

    var remainingBudget = AI_REQUEST_TIMEOUT_MS - (new Date().getTime() - startedAt);
    if (remainingBudget <= 0) {
      return AiService._failureResult("ใช้เวลานานเกินไป กรุณากรอกข้อมูลด้วยตนเองนะคะ");
    }

    var extracted;
    try {
      extracted = AiService._runStage2(stage1Text, Math.min(remainingBudget, AI_STAGE2_TIMEOUT_MS));
    } catch (err) {
      return AiService._failureResult("จัดข้อมูลจากสลิปไม่สำเร็จ กรุณากรอกข้อมูลด้วยตนเองนะคะ");
    }

    var normalized = AiService._normalizeResult(extracted);
    var dup = AiService._checkDuplicate(normalized.refNumber);
    normalized.isLikelyDuplicate = dup.isLikelyDuplicate;
    normalized.duplicateOf = dup.duplicateOf;
    return normalized;
  },

  /**
   * Stage 1: transcribes the slip image/PDF to raw text via Typhoon OCR.
   *
   * Typhoon OCR has no dedicated "/ocr" REST endpoint — it is an
   * OpenAI-compatible vision model served entirely through
   * POST /v1/chat/completions, with the image embedded as a base64 data URI
   * inside the user message's content array (image_url part), same as any
   * other OpenAI-style vision call. Model name is "typhoon-ocr" (current,
   * v1.5). Reference: https://github.com/scb-10x/typhoon-ocr
   * packages/typhoon_ocr/typhoon_ocr/ocr_utils.py (prepare_ocr_messages /
   * ocr_document) — this mirrors that library's request shape directly
   * since GAS can't just `pip install typhoon_ocr`.
   *
   * NOTE on timeoutMs: UrlFetchApp has no native per-call timeout parameter
   * (unlike browser fetch) — Apps Script's own execution has a hard 6-minute
   * ceiling regardless. timeoutMs here is accepted for interface symmetry
   * with the soft time-budget check in ocrSlip, not enforced as a real
   * network-level abort.
   * @param {string} imageBase64
   * @param {string} mimeType
   * @param {number} timeoutMs
   * @return {string} raw transcribed text/markdown.
   */
  _runStage1: function (imageBase64, mimeType, timeoutMs) {
    var apiKey = PropertiesService.getScriptProperties().getProperty("TYPHOON_OCR_API_KEY");
    if (!apiKey) {
      throw new Error("TYPHOON_OCR_API_KEY script property is not set.");
    }

    // Anti-hallucination: transcribe only what is visibly printed; never
    // infer or complete unclear text. Prepended to Typhoon's own OCR v1.5
    // prompt style (clean Markdown, no anchor text needed).
    var promptText =
      "Transcribe only what is visibly printed on this bank transfer slip image or document. " +
      "Do not infer, complete, or guess any text that is not clearly legible.\n\n" +
      "Extract all text from the image. Only return the clean Markdown. Do not include any " +
      "explanation or extra text. You must include all information on the page.";

    var response = UrlFetchApp.fetch(TYPHOON_OCR_BASE_URL + "/chat/completions", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + apiKey },
      muteHttpExceptions: true,
      payload: JSON.stringify({
        model: "typhoon-ocr",
        max_tokens: 16384,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: "data:" + mimeType + ";base64," + imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (response.getResponseCode() !== 200) {
      throw new Error("Typhoon OCR stage 1 HTTP " + response.getResponseCode() + ": " + response.getContentText());
    }

    var body = JSON.parse(response.getContentText());
    var text = body && body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content;
    if (!text) {
      throw new Error("Typhoon OCR stage 1 returned no text.");
    }
    return text;
  },

  /**
   * Stage 2: turns stage 1's raw text into a strict JSON extraction via
   * Typhoon's chat-completions endpoint (OpenAI-compatible request shape).
   * See _runStage1's note above re: timeoutMs not being a real network abort.
   * @param {string} rawText
   * @param {number} timeoutMs
   * @return {Object} raw parsed JSON from the model (not yet normalized).
   */
  _runStage2: function (rawText, timeoutMs) {
    var apiKey = PropertiesService.getScriptProperties().getProperty("TYPHOON_OCR_API_KEY");
    if (!apiKey) {
      throw new Error("TYPHOON_OCR_API_KEY script property is not set.");
    }

    var systemPrompt =
      "You extract structured data from Thai bank transfer slip text. Extract ONLY fields " +
      "explicitly present in the given text. For any field you cannot find with high confidence, " +
      'set its value to null and confidence to "low" or "guessed" — NEVER invent a plausible-' +
      "looking number, date, or reference number. " +
      'Category must be your best guess among exactly these 9 values: "Salary", "Gift", ' +
      '"Investment", "Food", "Transport", "Bills", "Shopping", "Entertainment", "Other" — if ' +
      'uncertain, use "Other" and mark confidence "guessed". ' +
      "type must be \"income\" or \"expense\" (default \"expense\" if ambiguous — slips are usually " +
      "outgoing transfers). " +
      "Respond with ONLY a JSON object of this exact shape, no prose: " +
      '{"amount":{"value":number|null,"confidence":"high"|"low"|"guessed"},' +
      '"date":{"value":"yyyy-mm-dd"|null,"confidence":"high"|"low"|"guessed"},' +
      '"category":{"value":string,"confidence":"high"|"low"|"guessed"},' +
      '"merchant":{"value":string|null,"confidence":"high"|"low"|"guessed"},' +
      '"refNumber":string|null,"type":"income"|"expense"}';

    var response = UrlFetchApp.fetch(TYPHOON_OCR_BASE_URL + "/chat/completions", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + apiKey },
      muteHttpExceptions: true,
      payload: JSON.stringify({
        model: "typhoon-v2.5-30b-a3b-instruct",
        response_format: { type: "json_object" },
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rawText },
        ],
      }),
    });

    if (response.getResponseCode() !== 200) {
      throw new Error("Typhoon OCR stage 2 HTTP " + response.getResponseCode() + ": " + response.getContentText());
    }

    var body = JSON.parse(response.getContentText());
    var content = body && body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content;
    if (!content) {
      throw new Error("Typhoon OCR stage 2 returned no content.");
    }
    return JSON.parse(content);
  },

  /**
   * Defensive backstop applied regardless of what stage 2 returned: clamps
   * category to the fixed 9-string enum (falling back to "Other"/"guessed"
   * for anything else, including a missing/malformed field), and fills in
   * every OcrSlipResult field with a safe default so the client never has to
   * guard against a missing key.
   * @param {Object} extracted - raw parsed JSON from _runStage2.
   * @return {Object} OcrSlipResult (isLikelyDuplicate/duplicateOf not yet set).
   */
  _normalizeResult: function (extracted) {
    extracted = extracted || {};

    var category = extracted.category || {};
    var categoryValue = category.value;
    var categoryConfidence = category.confidence;
    if (!Object.prototype.hasOwnProperty.call(OCR_VALID_CATEGORIES, categoryValue)) {
      categoryValue = "Other";
      categoryConfidence = "guessed";
    }

    var amount = extracted.amount || {};
    var date = extracted.date || {};
    var merchant = extracted.merchant || {};

    return {
      amount: {
        value: typeof amount.value === "number" ? amount.value : null,
        confidence: amount.confidence || "guessed",
      },
      date: {
        value: typeof date.value === "string" ? date.value : null,
        confidence: date.confidence || "guessed",
      },
      category: {
        value: categoryValue,
        confidence: categoryConfidence || "guessed",
      },
      merchant: {
        value: typeof merchant.value === "string" ? merchant.value : null,
        confidence: merchant.confidence || "guessed",
      },
      refNumber: typeof extracted.refNumber === "string" ? extracted.refNumber : null,
      type: extracted.type === "income" ? "income" : "expense",
      isLikelyDuplicate: false,
      duplicateOf: null,
      ocrFailed: false,
    };
  },

  /**
   * Scans recent transactions across all accounts for a note containing the
   * "[Ref: <refNumber>]" prefix this feature composes on save. Soft check
   * only — the caller never blocks on a match, just surfaces a warning.
   * @param {string|null} refNumber
   * @return {Object} { isLikelyDuplicate: boolean, duplicateOf: Object|null }
   */
  _checkDuplicate: function (refNumber) {
    if (!refNumber) {
      return { isLikelyDuplicate: false, duplicateOf: null };
    }

    // Generous window — cache-backed via Cache.getTabRows per tab (see
    // SheetService.listRecentTransactions), not a new raw-Sheets read pattern.
    var recent = SheetService.listRecentTransactions(200);
    var refPattern = "[Ref: " + refNumber + "]";
    for (var i = 0; i < recent.length; i++) {
      var note = String(recent[i].note || "");
      if (note.indexOf(refPattern) !== -1) {
        return {
          isLikelyDuplicate: true,
          duplicateOf: {
            id: recent[i].id,
            date: recent[i].date,
            amount: recent[i].amount,
            note: recent[i].note,
          },
        };
      }
    }
    return { isLikelyDuplicate: false, duplicateOf: null };
  },

  /**
   * Builds a uniform "OCR could not complete" result. Every field resolves to
   * a safe null/guessed default so the client can render an empty manual-
   * entry form without any special-casing beyond checking ocrFailed.
   * @param {string} thaiMessage - user-facing failure reason, in Thai.
   * @return {Object} OcrSlipResult
   */
  _failureResult: function (thaiMessage) {
    return {
      amount: { value: null, confidence: "guessed" },
      date: { value: null, confidence: "guessed" },
      category: { value: "Other", confidence: "guessed" },
      merchant: { value: null, confidence: "guessed" },
      refNumber: null,
      type: "expense",
      isLikelyDuplicate: false,
      duplicateOf: null,
      ocrFailed: true,
      failureReason: thaiMessage,
    };
  },
};
