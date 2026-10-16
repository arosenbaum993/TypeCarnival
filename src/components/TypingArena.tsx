import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { VirtualKeyboard } from './VirtualKeyboard';
import { sound } from '../utils/audio';
import { Ticket, ArrowLeft, RotateCcw, CheckCircle2, Award, Zap, AlertCircle } from 'lucide-react';

export const TypingArena: React.FC = () => {
  const {
    activeLesson,
    activeStudent,
    setCurrentView,
    recordSession,
    startAdaptiveDrill,
    playLessonComplete,
  } = useApp();

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [struggleKeys, setStruggleKeys] = useState<Set<string>>(new Set());
  const [isErrorState, setIsErrorState] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentExercise = activeLesson?.exercises[currentExerciseIdx] || 'f j f j';
  const targetChar = currentExercise[typedText.length] || '';

  // Timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (startTime && !isCompleted) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  // Focus container
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Calculate live stats
  const minutes = Math.max(elapsedSeconds / 60, 0.05);
  const wpm = startTime ? Math.round((typedText.length / 5) / minutes) : 0;
  const accuracy = totalKeystrokes > 0
    ? Math.max(0, Math.round(((totalKeystrokes - errorKeystrokes) / totalKeystrokes) * 100))
    : 100;

  const handleLessonCompletion = useCallback(() => {
    setIsCompleted(true);
    const isMastered = accuracy >= (activeLesson?.requiredAccuracy || 90);
    playLessonComplete(isMastered);

    if (!activeLesson) return;

    // Calculate ticket rewards
    const baseTickets = activeLesson.ticketReward || 50;
    const accuracyBonus = accuracy >= 95 ? 25 : 0;
    const finalTickets = baseTickets + accuracyBonus;

    recordSession(activeStudent.id, {
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title,
      wpm,
      accuracy,
      durationSeconds: Math.max(elapsedSeconds, 5),
      ticketsEarned: finalTickets,
      struggleKeys: Array.from(struggleKeys),
      totalKeystrokes,
      errorKeystrokes,
    });
  }, [accuracy, activeLesson, activeStudent.id, elapsedSeconds, errorKeystrokes, playLessonComplete, recordSession, struggleKeys, totalKeystrokes, wpm]);

  // Handle keystroke input
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isCompleted) return;

    // Ignore system modifier keys
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'CapsLock') {
      return;
    }

    // Prevent default scrolling for space and arrow keys
    if (e.key === ' ' || e.key.startsWith('Arrow')) {
      e.preventDefault();
    }

    setLastPressedKey(e.key);

    // Start timer on first keystroke
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      if (typedText.length > 0) {
        setTypedText(prev => prev.slice(0, -1));
        setIsErrorState(false);
      }
      return;
    }

    // Character key entered
    if (e.key.length === 1) {
      setTotalKeystrokes(prev => prev + 1);

      if (e.key === targetChar) {
        // Correct Keypress
        sound.playKeyClick();
        setIsErrorState(false);
        const newTyped = typedText + e.key;
        setTypedText(newTyped);

        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }

        // Check if finished current exercise
        if (newTyped.length === currentExercise.length) {
          if (activeLesson && currentExerciseIdx + 1 < activeLesson.exercises.length) {
            // Move to next exercise in this tent
            sound.playTicketChime();
            setTimeout(() => {
              setCurrentExerciseIdx(prev => prev + 1);
              setTypedText('');
            }, 250);
          } else {
            // Completed all exercises in lesson
            handleLessonCompletion();
          }
        }
      } else {
        // Error Keypress
        sound.playKeyError();
        setIsErrorState(true);
        setErrorKeystrokes(prev => prev + 1);
        setStreak(0);
        setStruggleKeys(prev => new Set(prev).add(targetChar.toLowerCase()));
      }
    }
  }, [isCompleted, startTime, typedText, targetChar, streak, maxStreak, currentExercise.length, activeLesson, currentExerciseIdx, handleLessonCompletion]);

  const restartLesson = () => {
    setCurrentExerciseIdx(0);
    setTypedText('');
    setStartTime(null);
    setElapsedSeconds(0);
    setTotalKeystrokes(0);
    setErrorKeystrokes(0);
    setStreak(0);
    setStruggleKeys(new Set());
    setIsErrorState(false);
    setIsCompleted(false);
    containerRef.current?.focus();
  };

  if (!activeLesson) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 mb-4">No lesson selected.</p>
        <button
          onClick={() => setCurrentView('midway')}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold"
        >
          Return to Midway Map
        </button>
      </div>
    );
  }

  const isMastered = accuracy >= activeLesson.requiredAccuracy;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-6 flex flex-col justify-between"
    >
      {/* Top Header / Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('midway')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Midway Map
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-amber-950 flex items-center gap-2">
              <span>🎪</span> {activeLesson.title}
            </h1>
            <p className="text-xs text-slate-500">
              Exercise {currentExerciseIdx + 1} of {activeLesson.exercises.length} · {activeLesson.subtitle}
            </p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4">
          {/* WPM Gauge */}
          <div className="flex flex-col items-center bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Speed</span>
            <span className="font-mono text-lg font-extrabold text-blue-600 tabular-nums">
              {wpm} <span className="text-xs font-normal text-slate-500">WPM</span>
            </span>
          </div>

          {/* Accuracy Gauge */}
          <div className="flex flex-col items-center bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
            <span
              className={`font-mono text-lg font-extrabold tabular-nums ${
                accuracy >= 90 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {accuracy}%
            </span>
          </div>

          {/* Streak Combo */}
          <div className="flex flex-col items-center bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Combo
            </span>
            <span className="font-mono text-lg font-extrabold text-amber-900 tabular-nums">
              {streak}
            </span>
          </div>

          {/* Reset button */}
          <button
            onClick={restartLesson}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Restart Lesson"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Typing Canvas */}
      <div className="my-6 flex flex-col items-center">
        {/* Progress Bar for Exercises */}
        <div className="w-full max-w-2xl bg-amber-100 h-2 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-rose-500 h-full transition-all duration-300"
            style={{
              width: `${((currentExerciseIdx + (typedText.length / currentExercise.length)) / activeLesson.exercises.length) * 100}%`,
            }}
          />
        </div>

        {/* Text Prompt Box */}
        <div
          onClick={() => containerRef.current?.focus()}
          className="w-full max-w-3xl bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-md cursor-text relative min-h-[140px] flex items-center justify-center"
        >
          {isErrorState && (
            <div className="absolute top-2 right-4 flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Try key: &apos;{targetChar === ' ' ? 'SPACE' : targetChar}&apos;
            </div>
          )}

          <div className="font-mono text-2xl sm:text-3xl tracking-wide select-none flex flex-wrap justify-center leading-relaxed">
            {currentExercise.split('').map((char, index) => {
              const isTyped = index < typedText.length;
              const isCurrent = index === typedText.length;

              let charStyle = 'text-slate-400 ';
              if (isTyped) {
                charStyle = 'text-emerald-600 font-bold ';
              } else if (isCurrent) {
                charStyle = isErrorState
                  ? 'bg-rose-200 text-rose-900 font-bold border-b-4 border-rose-600 rounded-xs px-0.5 animate-pulse '
                  : 'bg-amber-200 text-slate-900 font-bold border-b-4 border-amber-600 rounded-xs px-0.5 shadow-xs ';
              }

              return (
                <span key={index} className={`transition-colors ${charStyle}`}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Tip: Keep your hands floating gently above the home row keys F &amp; J!
        </p>
      </div>

      {/* Virtual Hands and Keyboard Guide */}
      <div className="mt-2">
        <VirtualKeyboard
          activeChar={targetChar}
          lastPressedKey={lastPressedKey}
          isError={isErrorState}
        />
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-4 border-amber-400 shadow-2xl text-center relative overflow-hidden">
            {/* Confetti Carnival Header */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-300 rounded-full opacity-40 blur-xl" />
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-300 rounded-full opacity-40 blur-xl" />

            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-amber-400 shadow-sm text-3xl">
              🎪
            </div>

            <h2 className="font-display text-2xl font-black text-amber-950 uppercase tracking-tight">
              {isMastered ? 'Tent Challenge Conquered!' : 'Carnival Drill Finished!'}
            </h2>
            <p className="text-xs text-slate-600 mt-1 mb-6">
              {isMastered
                ? `Incredible job! You beat the ${activeLesson.requiredAccuracy}% accuracy goal!`
                : `Good effort! Keep practicing to reach the ${activeLesson.requiredAccuracy}% accuracy goal.`}
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800">Tickets</span>
                <div className="flex items-center justify-center gap-1 text-lg font-black text-amber-900 font-mono">
                  <Ticket className="w-4 h-4 text-amber-600" />
                  +{activeLesson.ticketReward + (accuracy >= 95 ? 25 : 0)}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-800">Speed</span>
                <div className="text-lg font-black text-blue-900 font-mono">
                  {wpm} <span className="text-xs font-normal">WPM</span>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Accuracy</span>
                <div className="text-lg font-black text-emerald-900 font-mono">
                  {accuracy}%
                </div>
              </div>
            </div>

            {/* Struggle Keys Diagnostic */}
            {struggleKeys.size > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-6 text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Keys to Polish:
                  </span>
                  <button
                    onClick={() => startAdaptiveDrill(Array.from(struggleKeys))}
                    className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
                  >
                    Quick Booster Drill →
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(struggleKeys).map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-0.5 bg-white border border-rose-300 rounded text-xs font-mono font-bold text-rose-800 shadow-2xs uppercase"
                    >
                      {k === ' ' ? 'SPACE' : k}
                    </kbd>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={restartLesson}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => setCurrentView('midway')}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Next Tent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
