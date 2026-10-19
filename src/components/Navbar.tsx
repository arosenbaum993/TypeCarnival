import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, Ticket, GraduationCap } from 'lucide-react';
import { AddStudentModal } from './Teacher/AddStudentModal';

const NEW_TYPIST = '__new__';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeStudent,
    activeStudentId,
    setActiveStudentId,
    students,
    soundMuted,
    toggleSound,
    addStudent,
  } = useApp();
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Title (single text element wordmark) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('midway')}
              className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
            >
              <span className="text-2xl" role="img" aria-label="carnival tent">🎪</span>
              <span className="font-display text-xl font-black tracking-tight text-amber-950 uppercase">
                Type<span className="text-rose-600">Carnival</span>
              </span>
            </button>
          </div>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button
              onClick={() => setCurrentView('midway')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
                currentView === 'midway' || currentView === 'lesson'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Midway Map
            </button>
            <button
              onClick={() => setCurrentView('minigames')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
                currentView === 'minigames'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Arcade Games
            </button>
            <button
              onClick={() => setCurrentView('prizes')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
                currentView === 'prizes'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Prize Booth
            </button>
            <button
              onClick={() => setCurrentView('teacher')}
              className={`whitespace-nowrap flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
                currentView === 'teacher'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-600" />
              Teacher Command
            </button>
          </nav>

          {/* Zone 3: 1 Primary Area (Student Switcher, Ticket Balance, Sound) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Student Switcher dropdown for classroom simulation */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-base">{activeStudent?.avatar || '🦊'}</span>
              <select
                value={activeStudentId}
                onChange={(e) => {
                  if (e.target.value === NEW_TYPIST) {
                    setIsJoinOpen(true);
                  } else {
                    setActiveStudentId(e.target.value);
                  }
                }}
                className="bg-transparent font-medium text-slate-800 border-none outline-none cursor-pointer max-w-[110px] truncate"
                aria-label="Active Student"
              >
                {(students || []).map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.grade})
                  </option>
                ))}
                <option value={NEW_TYPIST}>+ I'm new here</option>
              </select>
            </div>

            {/* Daily Streak Counter */}
            <div
              className="hidden sm:flex items-center gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-800"
              title={`${activeStudent?.dailyStreak || 1}-Day Practice Streak`}
            >
              <span>🔥</span>
              <span className="font-mono tabular-nums">{activeStudent?.dailyStreak || 1}d</span>
            </div>

            {/* Ticket Counter */}
            <div className="hidden sm:flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400 px-3 py-1.5 rounded-lg text-xs font-bold text-yellow-900">
              <Ticket className="w-4 h-4 text-amber-600" />
              <span className="font-mono tabular-nums">{activeStudent?.totalTickets ?? 100}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label="Toggle Sound"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Quick Mode Switcher */}
            {currentView === 'teacher' ? (
              <button
                onClick={() => setCurrentView('midway')}
                className="px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                Student View
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('teacher')}
                className="px-3 py-2 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 rounded-lg shadow-xs transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Teacher View
              </button>
            )}
          </div>
        </div>
      </div>
      <AddStudentModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onAdd={(name, grade, avatar) => {
          addStudent(name, grade, avatar);
          setCurrentView('midway');
        }}
        title="Join the Carnival"
        subtitle="Type your name to make your typist"
        submitLabel="Let's Go!"
      />
    </header>
  );
};
