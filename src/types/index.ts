export type GradeLevel = 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5';

export interface TypingSession {
  id: string;
  lessonId: string;
  lessonTitle: string;
  wpm: number;
  accuracy: number;
  durationSeconds: number;
  ticketsEarned: number;
  struggleKeys: string[];
  totalKeystrokes: number;
  errorKeystrokes: number;
  completedAt: string;
  score?: number; // arcade games and speed tests: the game's own score for personal bests
}

export interface Student {
  id: string;
  name: string;
  grade: GradeLevel;
  avatar: string;
  totalTickets: number;
  currentLevelId: string;
  unlockedPrizes: string[];
  activeTheme: string;
  sessions: TypingSession[];
  lastActive: string;
  dailyStreak: number;
  lastPracticeDate?: string;
  weeklyStreakDays?: string[]; // e.g. ['Mon', 'Tue', 'Thu']
}

export interface Lesson {
  id: string;
  tier: number;
  title: string;
  subtitle: string;
  gradeRecommended: GradeLevel;
  category: 'home-row' | 'top-row' | 'bottom-row' | 'numbers' | 'words' | 'sentences';
  targetKeys: string[];
  exercises: string[];
  requiredAccuracy: number;
  minWpm: number;
  ticketReward: number;
  iconName: string;
}

export interface ClassGoal {
  id: string;
  targetWpm: number;
  targetAccuracy: number;
  targetWeeklyMinutes: number;
  targetDate: string;
  title: string;
}

export type FingerPosition =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumbs';

export interface KeyInfo {
  key: string;
  label?: string;
  shiftKey?: string;
  finger: FingerPosition;
  row: number;
  width?: string;
}

export interface PrizeItem {
  id: string;
  name: string;
  category: 'plushie' | 'theme' | 'hat' | 'badge';
  cost: number;
  description: string;
  icon: string;
  previewColor?: string;
}

export type AppView = 'midway' | 'lesson' | 'minigames' | 'prizes' | 'teacher' | 'speedtest';
// Arcade game ids live in src/data/games.ts
export type MinigameType = string;
