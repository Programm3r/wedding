/**
 * RSVP collector — paste this into Google Apps Script (see README.md).
 * Every RSVP from the website is added as a new row in your Google Sheet,
 * and you get an email for each response.
 */
const NOTIFY_EMAIL = ""; // optional: your email address for a notification per RSVP

const COLUMNS = [
  "submittedAt", "name", "email", "attending", "guests", "guestNames",
  "phone", "accommodation", "dietary", "song", "message",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs")
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVPs");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
      sheet.setFrozenRows(1);
    }
    const p = e.parameter || {};
    sheet.appendRow(COLUMNS.map((c) => (p[c] || "").toString().slice(0, 1000)));

    if (NOTIFY_EMAIL) {
      const verdict = p.attending === "yes" ? `is coming (${p.guests || 1} guest/s)` : "can't make it";
      MailApp.sendEmail(NOTIFY_EMAIL, `RSVP: ${p.name} ${verdict}`,
        COLUMNS.map((c) => `${c}: ${p[c] || ""}`).join("\n"));
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
