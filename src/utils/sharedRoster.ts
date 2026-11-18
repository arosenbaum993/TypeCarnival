import { ROSTER_SHEET_URL } from '../config';
import { RosterEntry, parseRosterCsv, planRosterImport } from './rosterImport';

const CACHE_KEY = 'typecarnival_shared_roster_v1';

export const sharedRosterEnabled = (): boolean => ROSTER_SHEET_URL !== '';

// Reads the published sheet and keeps only usable rows (Grades 2 to 5, no repeats, valid names).
// A sheet that is not published returns a web page instead of CSV, which fails the heading check.
export const fetchSharedRoster = async (): Promise<RosterEntry[]> => {
  let res: Response;
  try {
    res = await fetch(ROSTER_SHEET_URL, { cache: 'no-store' });
  } catch {
    throw new Error('Could not reach the roster sheet. Check the internet connection and that the sheet is still published.');
  }
  if (!res.ok) throw new Error(`The roster sheet could not be reached (error ${res.status}).`);
  const text = await res.text();
  let entries: RosterEntry[];
  try {
    entries = planRosterImport(parseRosterCsv(text), []).toAdd;
  } catch {
    throw new Error('The roster link did not return a roster. Check that the sheet is published as CSV.');
  }
  if (entries.length === 0) throw new Error('The roster sheet has no students in Grades 2 to 5.');
  return entries;
};

export const loadCachedRoster = (): RosterEntry[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RosterEntry => e && typeof e.name === 'string' && typeof e.grade === 'string',
    );
  } catch {
    return [];
  }
};

export const saveCachedRoster = (entries: RosterEntry[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or blocked: the roster just reloads next time
  }
};
