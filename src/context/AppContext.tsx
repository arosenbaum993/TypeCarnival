import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Lesson, TypingSession, ClassGoal, AppView, MinigameType, GradeLevel } from '../types';
import { DEFAULT_CLASS_GOAL } from '../data/defaultRoster';
import { LESSONS, generateStruggleKeyDrill } from '../data/lessons';
import { useArcadeAudio, ArcadeAudioControls } from '../hooks/useArcadeAudio';
import { syncSessionToSheet } from '../utils/sheetsSync';
import { parseSpeedTestLessonId } from '../data/speedTest';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeStudent: Student;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  students: Student[];
  activeLesson: Lesson | null;
  activeMinigame: MinigameType | null;
  classGoal: ClassGoal;
  soundMuted: boolean;
  toggleSound: () => void;
  audio: ArcadeAudioControls;
  playLessonComplete: (isMastered?: boolean) => void;
  playPrizeRedeem: () => void;
  startLesson: (lesson: Lesson) => void;
  startMinigame: (game: MinigameType) => void;
  startAdaptiveDrill: (struggleKeys: string[]) => void;
  recordSession: (studentId: string, sessionData: Omit<TypingSession, 'id' | 'completedAt'>) => void;
  unlockPrize: (studentId: string, prizeId: string, cost: number) => boolean;
  setStudentTheme: (studentId: string, themeId: string) => void;
  addStudent: (name: string, grade: GradeLevel, avatar: string) => Student;
  removeStudent: (studentId: string) => void;
  updateClassGoal: (newGoal: Partial<ClassGoal>) => void;
  clearRoster: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_STUDENTS = 'typecarnival_students_v3';
const STORAGE_KEY_GOAL = 'typecarnival_goal_v3';
const STORAGE_KEY_ACTIVE = 'typecarnival_active_student_v3';

// Stand-in used only while the roster is empty; App shows the sign-up screen instead of any student view.
const EMPTY_STUDENT: Student = {
  id: '',
  name: '',
  grade: 'Grade 3',
  avatar: '🦊',
  totalTickets: 0,
  currentLevelId: 'lesson-1',
  unlockedPrizes: ['theme-classic'],
  activeTheme: 'theme-classic',
  sessions: [],
  lastActive: '',
  dailyStreak: 0,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('midway');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeMinigame, setActiveMinigame] = useState<MinigameType | null>(null);

  // Simple arcade audio hook instance
  const audio = useArcadeAudio();
  const [soundMuted, setSoundMuted] = useState<boolean>(audio.isMuted);

  // Load students from localStorage with defensive sanitization
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((s: Partial<Student>) => ({
              id: s.id || `student-${Date.now()}`,
              name: s.name || 'Student',
              grade: s.grade || 'Grade 3',
              avatar: s.avatar || '🦊',
              totalTickets: typeof s.totalTickets === 'number' ? s.totalTickets : 100,
              currentLevelId: s.currentLevelId || 'lesson-1',
              unlockedPrizes: Array.isArray(s.unlockedPrizes) ? s.unlockedPrizes : ['theme-classic'],
              activeTheme: s.activeTheme || 'theme-classic',
              lastActive: s.lastActive || 'Today',
              dailyStreak: typeof s.dailyStreak === 'number' ? s.dailyStreak : 1,
              lastPracticeDate: s.lastPracticeDate || new Date().toISOString().slice(0, 10),
              weeklyStreakDays: Array.isArray(s.weeklyStreakDays) ? s.weeklyStreakDays : ['Mon', 'Tue'],
              sessions: Array.isArray(s.sessions)
                ? s.sessions.map((sess: Partial<TypingSession>) => ({
                    id: sess.id || `sess-${Date.now()}`,
                    lessonId: sess.lessonId || 'lesson-1',
                    lessonTitle: sess.lessonTitle || 'Lesson',
                    wpm: sess.wpm || 10,
                    accuracy: sess.accuracy || 90,
                    durationSeconds: sess.durationSeconds || 60,
                    ticketsEarned: sess.ticketsEarned || 50,
                    struggleKeys: Array.isArray(sess.struggleKeys) ? sess.struggleKeys : [],
                    totalKeystrokes: sess.totalKeystrokes || 100,
                    errorKeystrokes: sess.errorKeystrokes || 5,
                    completedAt: sess.completedAt || new Date().toISOString(),
                    ...(typeof sess.score === 'number' ? { score: sess.score } : {}),
                  }))
                : [],
            }));
          }
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved && students.some(s => s.id === saved)) return saved;
    } catch {
      // ignore
    }
    return students[0]?.id || '';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeStudentId);
    } catch {
      // ignore
    }
  }, [activeStudentId]);

  const [classGoal, setClassGoal] = useState<ClassGoal>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_GOAL);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_CLASS_GOAL;
  });

  // Sync students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  // Sync goal to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOAL, JSON.stringify(classGoal));
    } catch {
      // ignore
    }
  }, [classGoal]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0] || EMPTY_STUDENT;

  const toggleSound = () => {
    const muted = audio.toggleMute();
    setSoundMuted(muted);
  };

  const playLessonComplete = (isMastered: boolean = true) => {
    audio.playLessonComplete(isMastered);
  };

  const playPrizeRedeem = () => {
    audio.playPrizeRedeem();
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveMinigame(null);
    setCurrentView('lesson');
    audio.playTicketChime();
  };

  const startMinigame = (game: MinigameType) => {
    setActiveMinigame(game);
    setActiveLesson(null);
    setCurrentView('minigames');
    audio.playTicketChime();
  };

  const startAdaptiveDrill = (struggleKeys: string[]) => {
    const drill = generateStruggleKeyDrill(struggleKeys);
    setActiveLesson(drill);
    setActiveMinigame(null);
    setCurrentView('lesson');
    audio.playTicketChime();
  };

  const recordSession = (studentId: string, sessionData: Omit<TypingSession, 'id' | 'completedAt'>) => {
    const newSession: TypingSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };

    const sessionStudent = students.find(s => s.id === studentId);
    if (sessionStudent) {
      const lesson = LESSONS.find(l => l.id === sessionData.lessonId);
      const requiredAccuracy =
        lesson?.requiredAccuracy ?? parseSpeedTestLessonId(sessionData.lessonId)?.level.targetAccuracy ?? 90;
      syncSessionToSheet(sessionStudent, newSession, requiredAccuracy);
    }

    setStudents(prev => {
      return prev.map(student => {
        if (student.id !== studentId) return student;

        // Calculate if we should advance to the next level
        let newLevelId = student.currentLevelId;
        const currentLessonIdx = LESSONS.findIndex(l => l.id === student.currentLevelId);
        
        // If accuracy >= 90% and WPM meets target and completed this level
        if (sessionData.accuracy >= 90 && currentLessonIdx !== -1 && sessionData.lessonId === student.currentLevelId) {
          if (currentLessonIdx < LESSONS.length - 1) {
            newLevelId = LESSONS[currentLessonIdx + 1].id;
          }
        }

        // Daily Streak Calculation
        const todayStr = new Date().toISOString().slice(0, 10);
        const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        let newStreak = student.dailyStreak || 1;
        let streakBonus = 0;

        if (student.lastPracticeDate) {
          const lastDate = new Date(student.lastPracticeDate);
          const nowDate = new Date(todayStr);
          const diffDays = Math.round((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            // Already practiced today, keep current streak
            newStreak = student.dailyStreak || 1;
          } else if (diffDays === 1 || diffDays === 2 || diffDays === 3) {
            // Consecutive day or weekend grace period (Friday to Monday)
            newStreak = (student.dailyStreak || 1) + 1;
            streakBonus = Math.min(newStreak * 10, 50); // Daily streak carnival bonus!
          } else {
            // Broken streak, restart at 1
            newStreak = 1;
          }
        } else {
          newStreak = 1;
          streakBonus = 10;
        }

        const existingDays = student.weeklyStreakDays || [];
        const updatedDays = existingDays.includes(dayOfWeek)
          ? existingDays
          : [...existingDays, dayOfWeek];

        return {
          ...student,
          totalTickets: student.totalTickets + sessionData.ticketsEarned + streakBonus,
          currentLevelId: newLevelId,
          lastActive: 'Just now',
          dailyStreak: newStreak,
          lastPracticeDate: todayStr,
          weeklyStreakDays: updatedDays,
          sessions: [newSession, ...student.sessions],
        };
      });
    });
  };

  const unlockPrize = (studentId: string, prizeId: string, cost: number): boolean => {
    let success = false;
    setStudents(prev => {
      return prev.map(student => {
        if (student.id !== studentId) return student;
        if (student.totalTickets < cost || student.unlockedPrizes.includes(prizeId)) {
          return student;
        }
        success = true;
        // Trigger arcade prize redemption sound effect
        audio.playPrizeRedeem();
        return {
          ...student,
          totalTickets: student.totalTickets - cost,
          unlockedPrizes: [...student.unlockedPrizes, prizeId],
        };
      });
    });
    return success;
  };

  const setStudentTheme = (studentId: string, themeId: string) => {
    setStudents(prev => {
      return prev.map(student => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          activeTheme: themeId,
        };
      });
    });
  };

  const addStudent = (name: string, grade: GradeLevel, avatar: string): Student => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name,
      grade,
      avatar,
      totalTickets: 50,
      currentLevelId: 'lesson-1',
      unlockedPrizes: ['theme-classic'],
      activeTheme: 'theme-classic',
      lastActive: 'Just added',
      dailyStreak: 1,
      lastPracticeDate: new Date().toISOString().slice(0, 10),
      weeklyStreakDays: [new Date().toLocaleDateString('en-US', { weekday: 'short' })],
      sessions: [],
    };

    setStudents(prev => [...prev, newStudent]);
    setActiveStudentId(newStudent.id);
    return newStudent;
  };

  const updateClassGoal = (newGoal: Partial<ClassGoal>) => {
    setClassGoal(prev => ({
      ...prev,
      ...newGoal,
    }));
  };

  const removeStudent = (studentId: string) => {
    const remaining = students.filter(s => s.id !== studentId);
    setStudents(remaining);
    if (activeStudentId === studentId) {
      setActiveStudentId(remaining[0]?.id || '');
    }
  };

  const clearRoster = () => {
    setStudents([]);
    setActiveStudentId('');
    setClassGoal(DEFAULT_CLASS_GOAL);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeStudent,
        activeStudentId,
        setActiveStudentId,
        students,
        activeLesson,
        activeMinigame,
        classGoal,
        soundMuted,
        toggleSound,
        audio,
        playLessonComplete,
        playPrizeRedeem,
        startLesson,
        startMinigame,
        startAdaptiveDrill,
        recordSession,
        unlockPrize,
        setStudentTheme,
        addStudent,
        removeStudent,
        updateClassGoal,
        clearRoster,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { useArcadeAudio };

