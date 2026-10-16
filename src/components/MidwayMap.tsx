import React from 'react';
import { useApp } from '../context/AppContext';
import { LESSONS } from '../data/lessons';
import { Ticket, Sparkles, Lock, CheckCircle, ArrowRight, Play, Gamepad2, Award } from 'lucide-react';

export const MidwayMap: React.FC = () => {
  const {
    activeStudent,
    startLesson,
    setCurrentView,
    startAdaptiveDrill,
  } = useApp();

  const studentName = activeStudent?.name || 'Explorer';
  const studentGrade = activeStudent?.grade || 'Grade 3';
  const studentAvatar = activeStudent?.avatar || '🦊';
  const studentTickets = typeof activeStudent?.totalTickets === 'number' ? activeStudent.totalTickets : 100;
  const studentStreak = typeof activeStudent?.dailyStreak === 'number' ? activeStudent.dailyStreak : 1;
  const studentSessions = Array.isArray(activeStudent?.sessions) ? activeStudent.sessions : [];
  const weeklyDays = Array.isArray(activeStudent?.weeklyStreakDays) ? activeStudent.weeklyStreakDays : ['Mon', 'Tue'];

  const currentLevelIndex = LESSONS.findIndex(l => l.id === activeStudent?.currentLevelId);
  const activeLevelIdx = currentLevelIndex === -1 ? 0 : currentLevelIndex;

  // Aggregate struggle keys from recent sessions with safe string filtering
  const recentStruggleKeys = Array.from(
    new Set(
      studentSessions
        .slice(0, 3)
        .flatMap(s => (Array.isArray(s?.struggleKeys) ? s.struggleKeys : []))
        .filter((k): k is string => typeof k === 'string' && k.length > 0)
    )
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Carnival Hero Marquee Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-amber-300 bg-amber-950">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/carnival_midway_banner_1792163243402.jpg"
            alt="Carnival Midway Arcade Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-amber-950 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Elementary Keyboarding Quest · {studentGrade}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Welcome to the <span className="text-amber-300">TypeCarnival</span> Midway!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-amber-100/90 max-w-xl">
              Step right up, {studentName}! Master your keyboarding skills tent by tent, earn golden carnival tickets, and unlock amazing arcade prizes.
            </p>
          </div>

          {/* Student Quick Stats Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-white shrink-0">
            <div className="text-4xl bg-amber-400/20 p-2 rounded-xl border border-amber-300/30">
              {studentAvatar}
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-amber-300">Carnival Bank</div>
              <div className="flex items-center gap-1.5 text-2xl font-black font-mono">
                <Ticket className="w-5 h-5 text-amber-400" />
                {studentTickets}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
                <span>🔥</span>
                <span className="font-bold text-amber-300 font-mono">{studentStreak}-Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Practice Streak Tracker Card */}
      <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-300 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Streak Icon & Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-amber-200 shrink-0">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-black tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Daily Habit Builder
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {studentStreak >= 7
                    ? '🏆 Carnival Master Legend'
                    : studentStreak >= 5
                    ? '⚡ Arcade Champion'
                    : studentStreak >= 3
                    ? '✨ Midway Spark'
                    : '🎈 Carnival Rookie'}
                </span>
              </div>
              <h2 className="font-display text-2xl font-black text-amber-950 mt-1">
                {studentStreak}-Day Carnival Streak!
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Practice typing every school day to unlock progressive streak multipliers and earn up to +50 bonus tickets per session.
              </p>
            </div>
          </div>

          {/* Right: Weekly Progress Tracker (Mon - Fri) */}
          <div className="w-full lg:w-auto bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/90 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>This Week&apos;s Target</span>
              <span className="text-amber-800 font-mono font-bold">
                {weeklyDays.length}/5 Days
              </span>
            </div>
            <div className="flex items-center gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
                const isPracticed = weeklyDays.includes(day);
                const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                const isToday = currentDay === day;

                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center justify-center w-11 h-13 rounded-xl border text-xs transition-all ${
                      isPracticed
                        ? 'bg-amber-400 border-amber-500 text-amber-950 font-bold shadow-xs'
                        : isToday
                        ? 'bg-amber-50 border-amber-300 text-amber-900 border-dashed animate-pulse font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase">{day}</span>
                    <span className="text-base mt-0.5">
                      {isPracticed ? '⭐' : isToday ? '🎯' : '·'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Booster Banner if Student Has Struggle Keys */}
      {recentStruggleKeys.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h2 className="font-display text-base font-bold text-amber-950 flex items-center gap-2">
                Midway Booster Drill Available
              </h2>
              <p className="text-xs text-slate-600">
                You recently had some slips on keys:{' '}
                <span className="font-mono font-bold text-rose-700">
                  {recentStruggleKeys.map(k => (k === ' ' ? 'SPACE' : k.toUpperCase())).join(', ')}
                </span>
                . Practice them now for a quick 80 ticket bonus!
              </p>
            </div>
          </div>
          <button
            onClick={() => startAdaptiveDrill(recentStruggleKeys)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Start Booster Drill
          </button>
        </div>
      )}

      {/* Midway Map Section Header & Minigame Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-amber-950">
            Carnival Adventure Tents
          </h2>
          <p className="text-xs text-slate-500">
            Follow the skill trail to build finger muscle memory from Home Row to Full Sentences.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('minigames')}
          className="self-start sm:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Gamepad2 className="w-4 h-4" />
          Play Arcade Games
        </button>
      </div>

      {/* Carnival Tents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LESSONS.map((lesson, idx) => {
          const isCompleted = idx < activeLevelIdx;
          const isCurrent = idx === activeLevelIdx;
          const isLocked = idx > activeLevelIdx;

          return (
            <div
              key={lesson.id}
              className={`relative rounded-3xl p-6 transition-all duration-200 border-2 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-300/40 shadow-lg scale-[1.02]'
                  : isCompleted
                  ? 'bg-white border-emerald-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              {/* Tent Header Badge */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {idx === 0 ? '🎪' : idx === 1 ? '🎯' : idx === 2 ? '🎢' : idx === 3 ? '🎠' : idx === 4 ? '🎡' : '🏆'}
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Tier {lesson.tier} · {lesson.gradeRecommended}
                    </span>
                    <h3 className="font-display text-base font-bold text-amber-950">
                      {lesson.title}
                    </h3>
                  </div>
                </div>

                {isCompleted && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Passed
                  </span>
                )}
                {isCurrent && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200 px-2.5 py-1 rounded-full animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    Current
                  </span>
                )}
                {isLocked && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Locked
                  </span>
                )}
              </div>

              {/* Subtitle / Description */}
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {lesson.subtitle}
              </p>

              {/* Target Keys Strip */}
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Target Keys:
                </span>
                <div className="flex flex-wrap gap-1">
                  {lesson.targetKeys.slice(0, 8).map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 shadow-2xs uppercase"
                    >
                      {k === 'all' ? 'FULL KEYBOARD' : k}
                    </kbd>
                  ))}
                  {lesson.targetKeys.length > 8 && (
                    <span className="text-xs text-slate-400 self-center">+{lesson.targetKeys.length - 8}</span>
                  )}
                </div>
              </div>

              {/* Reward & Requirements */}
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs mb-4">
                <span className="text-slate-500">
                  Goal: <strong className="text-slate-800">{lesson.requiredAccuracy}% Acc</strong> · <strong className="text-slate-800">{lesson.minWpm} WPM</strong>
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <Ticket className="w-3.5 h-3.5 text-amber-600" />
                  +{lesson.ticketReward} Tickets
                </span>
              </div>

              {/* Action Button */}
              {isLocked ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Pass Prior Tent to Unlock
                </button>
              ) : (
                <button
                  onClick={() => startLesson(lesson)}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  {isCurrent ? 'Enter Tent Now' : 'Replay Lesson'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
