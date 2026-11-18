import { GradeLevel, Student } from '../types';

// TypeCarnival only teaches Grades 2 to 5, so anything else in a roster file is skipped.
export const SUPPORTED_GRADES: GradeLevel[] = ['Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
export const MAX_NAME_LENGTH = 40; // same limit as the Enroll Student form
export const MAX_ROSTER_FILE_BYTES = 2 * 1024 * 1024;

export interface RosterRow {
  line: number;
  name: string;
  gradeRaw: string;
  studentId: string;
}

export interface RosterEntry {
  name: string;
  grade: GradeLevel;
}

export interface SkippedRow {
  line: number;
  name: string;
  reason: string;
}

export interface RosterPlan {
  totalRows: number;
  toAdd: RosterEntry[];
  skipped: SkippedRow[];
}

// Small CSV reader: handles quoted cells, "" escapes, CRLF line endings and a leading BOM
// (Excel and Google Sheets both produce these).
export const parseCsv = (input: string): string[][] => {
  const text = input.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

const NAME_HEADERS = ['name', 'student name', 'student', 'first name & last initial'];
const GRADE_HEADERS = ['grade', 'grade level'];
const ID_HEADERS = ['student id', 'student #', 'student#', 'student number', 'id'];

export const parseRosterCsv = (text: string): RosterRow[] => {
  const all = parseCsv(text);
  const headerIndex = all.findIndex((r) => r.some((c) => c.trim() !== ''));
  if (headerIndex === -1) throw new Error('That file is empty.');

  const header = all[headerIndex].map((c) => c.trim().toLowerCase());
  const idCol = header.findIndex((h) => ID_HEADERS.includes(h));
  const nameCol = header.findIndex((h, i) => i !== idCol && NAME_HEADERS.includes(h));
  const gradeCol = header.findIndex((h) => GRADE_HEADERS.includes(h));
  if (nameCol === -1 || gradeCol === -1) {
    throw new Error('The first row needs column headings that include "Name" and "Grade".');
  }

  const rows: RosterRow[] = [];
  for (let i = headerIndex + 1; i < all.length; i++) {
    const r = all[i];
    if (r.every((c) => c.trim() === '')) continue;
    rows.push({
      line: i + 1,
      name: (r[nameCol] ?? '').replace(/\s+/g, ' ').trim(),
      gradeRaw: (r[gradeCol] ?? '').trim(),
      studentId: idCol === -1 ? '' : (r[idCol] ?? '').trim(),
    });
  }
  return rows;
};

// Accepts "Grade 2", "2", "02", "2nd" and so on. Returns null for grades the app does not cover.
export const normalizeGrade = (raw: string): { grade: GradeLevel | null; label: string } => {
  const cleaned = raw.trim().replace(/^grade\s*/i, '').replace(/(st|nd|rd|th)$/i, '').trim();
  if (cleaned === '') return { grade: null, label: 'No grade' };
  if (/^(k|kk|kg|kindergarten)$/i.test(cleaned)) return { grade: null, label: 'Kindergarten' };
  if (/^(pk|pre-?k.*)$/i.test(cleaned)) return { grade: null, label: 'Pre-K' };
  if (/^\d+$/.test(cleaned)) {
    const n = parseInt(cleaned, 10);
    const candidate = `Grade ${n}` as GradeLevel;
    if (SUPPORTED_GRADES.includes(candidate)) return { grade: candidate, label: candidate };
    return { grade: null, label: `Grade ${n}` };
  }
  return { grade: null, label: raw.trim() };
};

const nameKey = (name: string, grade: string) => `${name.toLowerCase()}|${grade}`;

// Decides what an import would do, without changing anything. The student ID column is only used
// here to catch repeats inside the file; it is never stored in the app.
export const planRosterImport = (rows: RosterRow[], existing: Student[]): RosterPlan => {
  const onRoster = new Set(existing.map((s) => nameKey(s.name, s.grade)));
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const toAdd: RosterEntry[] = [];
  const skipped: SkippedRow[] = [];

  for (const row of rows) {
    const skip = (reason: string) => skipped.push({ line: row.line, name: row.name || '(no name)', reason });

    if (!row.name) {
      skip('No name');
      continue;
    }
    if (row.name.length > MAX_NAME_LENGTH) {
      skip(`Name is longer than ${MAX_NAME_LENGTH} characters`);
      continue;
    }
    const { grade, label } = normalizeGrade(row.gradeRaw);
    if (!grade) {
      skip(label === 'No grade' ? 'No grade' : `${label} (TypeCarnival covers Grades 2 to 5)`);
      continue;
    }
    if (row.studentId && seenIds.has(row.studentId)) {
      skip('Student ID appears twice in this file');
      continue;
    }
    const key = nameKey(row.name, grade);
    if (seenNames.has(key)) {
      skip('Same name and grade appears twice in this file');
      continue;
    }
    if (onRoster.has(key)) {
      skip('Already on this device’s roster');
      continue;
    }
    if (row.studentId) seenIds.add(row.studentId);
    seenNames.add(key);
    toAdd.push({ name: row.name, grade });
  }

  return { totalRows: rows.length, toAdd, skipped };
};
