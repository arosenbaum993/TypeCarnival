import { SHEETS_SYNC_URL } from '../config';
import { Student, TypingSession } from '../types';

export interface SheetRow {
  timestamp: string;
  studentName: string;
  grade: string;
  activity: string;
  wpm: number | string;
  accuracy: number | string;
  durationSeconds: number | string;
  ticketsEarned: number | string;
  struggleKeys: string;
  passed: string;
}

// Apps Script web apps don't return CORS headers, so the request is sent as a
// "simple" text/plain POST in no-cors mode. The browser can't read the reply,
// so a failed delivery is silent; the lesson is still saved on the device.
export const postToSheet = (row: SheetRow): void => {
  if (!SHEETS_SYNC_URL) return;
  try {
    fetch(SHEETS_SYNC_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row),
      keepalive: true,
    }).catch(() => {
      // offline or blocked: ignore
    });
  } catch {
    // ignore
  }
};

export const syncSessionToSheet = (student: Student, session: TypingSession, requiredAccuracy = 90): void => {
  // Arcade games report placeholder scores, so only typing lessons and drills go to the gradebook.
  if (session.lessonId.startsWith('game-')) return;
  postToSheet({
    timestamp: session.completedAt,
    studentName: student.name,
    grade: student.grade,
    activity: session.lessonTitle,
    wpm: session.wpm,
    accuracy: session.accuracy,
    durationSeconds: session.durationSeconds,
    ticketsEarned: session.ticketsEarned,
    struggleKeys: session.struggleKeys.map(k => k.toUpperCase()).join(' '),
    passed: session.accuracy >= requiredAccuracy ? 'Yes' : 'No',
  });
};
