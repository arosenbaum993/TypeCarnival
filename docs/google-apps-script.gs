/**
 * TypeCarnival -> Google Sheets logger
 *
 * Paste this into the Apps Script project attached to your class Google Sheet
 * (Extensions > Apps Script), replacing what is there, then redeploy:
 * Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
 * Editing the existing deployment keeps the same /exec URL the app already uses.
 *
 * Deployment settings: Execute as "Me", Who has access "Anyone".
 */

const SHEET_NAME = 'TypeCarnival Log';
const HEADERS = [
  'Timestamp', 'Student', 'Grade', 'Activity', 'WPM', 'Accuracy %',
  'Seconds', 'Tickets Earned', 'Struggle Keys', 'Passed (90%+)',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getLogSheet_();
    sheet.appendRow([
      data.timestamp ? new Date(data.timestamp) : new Date(),
      clean_(data.studentName),
      clean_(data.grade),
      clean_(data.activity),
      data.wpm,
      data.accuracy,
      data.durationSeconds,
      data.ticketsEarned,
      clean_(data.struggleKeys),
      clean_(data.passed),
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the /exec URL in a browser should show {"ok":true,"app":"TypeCarnival"}.
function doGet() {
  return json_({ ok: true, app: 'TypeCarnival' });
}

function getLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Stops a typed name like "=HYPERLINK(...)" from being treated as a formula.
function clean_(value) {
  const text = value == null ? '' : String(value).slice(0, 200);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
