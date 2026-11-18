// Google Apps Script web app that appends each completed lesson to the class Google Sheet.
// The matching script lives in docs/google-apps-script.gs.
export const SHEETS_SYNC_URL =
  'https://script.google.com/macros/s/AKfycbzXeXetdY0ULZ1RgFvKZ8SoiJRVaAo8gmMLt5M0Q1jRTAm4jrMY31R0m0tb6StEnpHq/exec';

// SHA-256 hash of the default Teacher View PIN. Teachers can set a new PIN per device in Teacher Command.
export const DEFAULT_TEACHER_PIN_HASH = '29b98b4e5f3b1fab32dc49b77a9f8998ac9aa9367fcca094d5fab526aa2ff5b9';

// Published CSV of the class roster (Name and Grade columns), from a Google Sheet's
// File > Share > Publish to web. Leave empty to turn shared rosters off. VITE_ROSTER_SHEET_URL
// overrides it for local testing.
export const ROSTER_SHEET_URL: string = (import.meta.env.VITE_ROSTER_SHEET_URL as string | undefined) || '';
