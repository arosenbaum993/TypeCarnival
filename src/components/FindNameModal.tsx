import React, { useMemo, useState } from 'react';
import { Search, Check, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATAR_OPTIONS } from './Teacher/AddStudentModal';
import { RosterEntry, SUPPORTED_GRADES } from '../utils/rosterImport';
import { GradeLevel } from '../types';

interface FindNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  // First-run screen: nothing to go back to, so no close button.
  required?: boolean;
  title?: string;
  // Falls back to typing a name when it is not on the class list.
  onCantFind: () => void;
  // First-run screen only: lets a teacher reach the PIN-locked Teacher View.
  onTeacherSetup?: () => void;
  onDone?: () => void;
}

export const FindNameModal: React.FC<FindNameModalProps> = ({
  isOpen,
  onClose,
  required = false,
  title = 'Find your name',
  onCantFind,
  onTeacherSetup,
  onDone,
}) => {
  const { sharedRoster, students, signInFromRoster } = useApp();
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<RosterEntry | null>(null);
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);

  const names = useMemo(() => {
    if (!grade) return [];
    const q = query.trim().toLowerCase();
    return sharedRoster
      .filter((e) => e.grade === grade && (q === '' || e.name.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sharedRoster, grade, query]);

  if (!isOpen) return null;

  const alreadyHere = (e: RosterEntry) =>
    students.some((s) => s.grade === e.grade && s.name.toLowerCase() === e.name.toLowerCase());

  const reset = () => {
    setGrade(null);
    setQuery('');
    setPicked(null);
  };

  const handleGo = () => {
    if (!picked) return;
    signInFromRoster(picked, avatar);
    reset();
    onClose();
    onDone?.();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border-2 border-amber-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">Tap your grade, then tap your name</p>
            </div>
          </div>
          {!required && (
            <button
              onClick={handleClose}
              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">1. My grade</div>
            <div className="grid grid-cols-4 gap-2">
              {SUPPORTED_GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGrade(g);
                    setQuery('');
                    setPicked(null);
                  }}
                  className={`py-3 rounded-xl border-2 font-black text-lg transition-all ${
                    grade === g
                      ? 'border-amber-500 bg-amber-100 text-amber-950 scale-105'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'
                  }`}
                  aria-label={g}
                  aria-pressed={grade === g}
                >
                  {g.replace('Grade ', '')}
                </button>
              ))}
            </div>
          </div>

          {grade && (
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">2. My name</div>
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type the first letters of your name"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                  aria-label="Search names"
                />
              </div>
              <ul className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100" aria-label="Names">
                {names.length === 0 && <li className="px-3 py-3 text-xs text-slate-500">No names match.</li>}
                {names.map((e) => {
                  const on = picked?.name === e.name && picked.grade === e.grade;
                  return (
                    <li key={`${e.grade}|${e.name}`}>
                      <button
                        type="button"
                        onClick={() => setPicked(e)}
                        className={`w-full text-left px-3 py-2.5 text-sm font-medium flex items-center justify-between ${
                          on ? 'bg-amber-100 text-amber-950' : 'hover:bg-amber-50 text-slate-800'
                        }`}
                      >
                        <span>{e.name}</span>
                        {on && <Check className="w-4 h-4 text-amber-600" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {picked && !alreadyHere(picked) && (
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">3. Pick an avatar</div>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                      avatar === emoji ? 'border-amber-500 bg-amber-100 scale-110' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleGo}
            disabled={!picked}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {picked ? (alreadyHere(picked) ? 'Welcome back!' : "Let's Go!") : 'Pick your name'}
          </button>

          <div className="flex flex-col items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                reset();
                onCantFind();
              }}
              className="text-xs text-slate-500 hover:text-amber-700 underline underline-offset-2"
            >
              I can&apos;t find my name
            </button>
            {onTeacherSetup && (
              <button
                type="button"
                onClick={onTeacherSetup}
                className="text-xs text-slate-400 hover:text-amber-700 underline underline-offset-2"
              >
                Teacher? Open Teacher View
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
