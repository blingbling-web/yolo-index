/**
 * Google Apps Script — append quiz submissions to a Google Sheet.
 *
 * 1) Create a new Google Sheet (any name).
 * 2) Copy this file’s contents into Apps Script (Extensions → Apps Script in the Sheet).
 * 3) Set SHEET_ID below (from the sheet URL: .../d/SHEET_ID/edit).
 * 4) (Optional) Project Settings → Script properties → add WEBHOOK_SECRET (same value as Vercel SHEETS_WEBHOOK_SECRET).
 * 5) Deploy → New deployment → type “Web app”:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6) Copy the Web app URL into Vercel as GOOGLE_SHEETS_WEBHOOK_URL.
 */

var SHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";

function doGet() {
  return ContentService.createTextOutput("Quiz → Sheets webhook is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: "No POST body" }, 400);
    }

    var data = JSON.parse(e.postData.contents);

    var props = PropertiesService.getScriptProperties();
    var expected = props.getProperty("WEBHOOK_SECRET");
    if (expected) {
      if (data._webhookSecret !== expected) {
        return jsonOut({ ok: false, error: "Unauthorized" }, 403);
      }
      delete data._webhookSecret;
    }

    var email = typeof data.email === "string" ? data.email.trim() : "";
    if (!email) {
      return jsonOut({ ok: false, error: "Email is required" }, 400);
    }

    if (!SHEET_ID || SHEET_ID.indexOf("PASTE_YOUR") !== -1) {
      return jsonOut({ ok: false, error: "Set SHEET_ID in the script" }, 500);
    }

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    ensureHeaders(sheet);

    var utm = data.utm || {};
    var utmStr = [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" | ");
    var dim = data.dimensionAvgs || {};
    var tags = Array.isArray(data.constraintTags) ? data.constraintTags.join("; ") : "";

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      email,
      data.name || "",
      data.yoloTypeTitle || "",
      data.yoloType || "",
      dim.clarity,
      dim.alignment,
      dim.action,
      data.identityQ11,
      data.primaryConstraintTag || "",
      tags,
      utmStr,
      data.linkedinSub || "",
      data.pageUrl || "",
      JSON.stringify(data.answers || {}),
    ]);

    return jsonOut({ ok: true, forwarded: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message ? err.message : err) }, 500);
  } finally {
    lock.releaseLock();
  }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow([
    "Submitted (ISO)",
    "Email",
    "Name",
    "Pattern",
    "Pattern ID",
    "Clarity avg",
    "Alignment avg",
    "Action avg",
    "Identity Q11",
    "Primary constraint",
    "Constraint tags",
    "UTM",
    "LinkedIn sub",
    "Page URL",
    "Answers JSON",
  ]);
}

function jsonOut(obj, status) {
  var out = ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  if (status && status >= 400) {
    // Apps Script Web Apps always return HTTP 200 to the client; errors still appear in the response body.
  }
  return out;
}
