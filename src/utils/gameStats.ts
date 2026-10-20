import { Student, TypingSession } from '../types';

const scoreOf = (s: TypingSession) => (typeof s.score === 'number' ? s.score : s.ticketsEarned);

export const getPersonalBest = (student: Student | undefined, sessionId: string): number => {
  if (!student) return 0;
  return (student.sessions || [])
    .filter(s => s.lessonId === sessionId)
    .reduce((best, s) => Math.max(best, scoreOf(s)), 0);
};

export const getPlayCount = (student: Student | undefined, sessionId: string): number =>
  student ? (student.sessions || []).filter(s => s.lessonId === sessionId).length : 0;

export interface HallEntry {
  name: string;
  avatar: string;
  score: number;
}

// Best score per student on this device, highest first
export const getHallOfFame = (students: Student[], sessionId: string, n = 3): HallEntry[] =>
  students
    .map(st => ({ name: st.name, avatar: st.avatar, score: getPersonalBest(st, sessionId) }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);

// Shared math so every game reports WPM and accuracy the same way
export const calcWpm = (correctChars: number, seconds: number) =>
  seconds <= 0 ? 0 : Math.round(correctChars / 5 / (Math.max(seconds, 3) / 60));

export const calcAccuracy = (correct: number, errors: number) =>
  correct + errors === 0 ? 100 : Math.round((correct / (correct + errors)) * 100);

export const topKeys = (counts: Record<string, number>, n = 5) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
