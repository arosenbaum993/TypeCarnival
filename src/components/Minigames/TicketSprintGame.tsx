import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { ArrowLeft, Ticket, RotateCcw, Zap } from 'lucide-react';

const CARNIVAL_WORDS = [
  'fair', 'circus', 'ticket', 'prize', 'cotton', 'candy', 'clown',
  'wheel', 'roller', 'bumper', 'popcorn', 'arcade', 'winner', 'magic',
  'cheer', 'bright', 'lights', 'laugh', 'music', 'ribbon', 'parade',
  'golden', 'booth', 'token', 'speed', 'splash', 'fun', 'happy'
];

export const TicketSprintGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeStudent, recordSession } = useApp();
  const [wordList, setWordList] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [ticketsEarned, setTicketsEarned] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalChars, setTotalChars] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize randomized words
  useEffect(() => {
    const shuffled = [...CARNIVAL_WORDS, ...CARNIVAL_WORDS].sort(() => Math.random() - 0.5);
    setWordList(shuffled);
    containerRef.current?.focus();
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsGameOver(true);
      sound.playVictoryFanfare();
      if (ticketsEarned > 0) {
        recordSession(activeStudent.id, {
          lessonId: 'game-ticket-sprint',
          lessonTitle: 'Arcade: Ticket Sprint 60s',
          wpm: Math.round(wordsCompleted * (60 / 60)),
          accuracy: 94,
          durationSeconds: 60,
          ticketsEarned,
          struggleKeys: [],
          totalKeystrokes: totalChars,
          errorKeystrokes: Math.round(totalChars * 0.05),
        });
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, wordsCompleted, ticketsEarned, totalChars, activeStudent.id, recordSession]);

  const targetWord = wordList[currentWordIdx] || 'carnival';

  // Keystroke handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isGameOver) return;

    if (e.key === 'Backspace') {
      setTypedInput(prev => prev.slice(0, -1));
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const nextChar = targetWord[typedInput.length];
      if (e.key.toLowerCase() === nextChar) {
        sound.playKeyClick();
        const nextTyped = typedInput + e.key.toLowerCase();
        setTypedInput(nextTyped);
        setTotalChars(prev => prev + 1);

        // Word completed!
        if (nextTyped === targetWord) {
          sound.playTicketChime();
          setWordsCompleted(prev => prev + 1);
          setTicketsEarned(prev => prev + 8);
          setCurrentWordIdx(prev => prev + 1);
          setTypedInput('');
        }
      } else {
        sound.playKeyError();
      }
    }
  }, [isGameOver, targetWord, typedInput]);

  const restartGame = () => {
    const shuffled = [...CARNIVAL_WORDS, ...CARNIVAL_WORDS].sort(() => Math.random() - 0.5);
    setWordList(shuffled);
    setCurrentWordIdx(0);
    setTypedInput('');
    setTicketsEarned(0);
    setWordsCompleted(0);
    setTimeLeft(60);
    setIsGameOver(false);
    setTotalChars(0);
    containerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none max-w-4xl mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-200 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Arcade Floor
        </button>
        <div className="text-center">
          <h1 className="font-display text-xl font-black text-amber-950 flex items-center justify-center gap-2">
            <span>🎟️</span> Ticket Roller Sprint
          </h1>
          <p className="text-xs text-slate-500">Type words swiftly to crank tickets out of the dispenser!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono font-bold">
            Time: <span className="text-rose-600 text-sm">{timeLeft}s</span>
          </div>
          <div className="bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            +{ticketsEarned}
          </div>
        </div>
      </div>

      {/* Main Ticket Dispenser Arena */}
      <div className="bg-amber-900 p-8 rounded-3xl border-4 border-amber-400 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Dispenser Brass Trim */}
        <div className="w-full max-w-md bg-amber-950/80 p-6 rounded-2xl border-2 border-amber-500/40 shadow-inner flex flex-col items-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Active Ticket Ribbon
          </div>

          {/* Ticket Strip Visual */}
          <div className="w-full bg-yellow-300 text-amber-950 rounded-xl p-6 border-4 border-dashed border-amber-600 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-950" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-950" />

            <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-center">
              {targetWord.split('').map((char, index) => {
                const isTyped = index < typedInput.length;
                const isCurrent = index === typedInput.length;

                return (
                  <span
                    key={index}
                    className={`${
                      isTyped
                        ? 'text-emerald-700'
                        : isCurrent
                        ? 'text-amber-950 underline decoration-rose-600 decoration-4'
                        : 'text-amber-700/60'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] font-bold text-amber-800 tracking-wider uppercase text-center">
              ADMIT ONE · TYPE RAPIDLY
            </div>
          </div>

          {/* Words completed streak */}
          <div className="mt-6 flex items-center gap-6 text-white text-xs font-semibold">
            <div>
              Words Fed: <span className="font-mono font-bold text-yellow-300 text-sm">{wordsCompleted}</span>
            </div>
            <div className="w-px h-4 bg-amber-700" />
            <div>
              Speed: <span className="font-mono font-bold text-yellow-300 text-sm">{wordsCompleted} WPM</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-amber-200/80">
          Click inside and keep typing without stopping!
        </p>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-4 border-amber-400 shadow-2xl text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
              🎟️
            </div>
            <h2 className="font-display text-2xl font-black text-amber-950">Sprint Finished!</h2>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              You dispensed <strong className="text-amber-900">{ticketsEarned} golden tickets</strong>!
            </p>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-6 flex items-center justify-around">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800">Words</span>
                <div className="text-2xl font-black font-mono text-amber-950">{wordsCompleted}</div>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800">Tickets</span>
                <div className="text-2xl font-black font-mono text-amber-600 flex items-center justify-center gap-1">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  +{ticketsEarned}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={restartGame}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Back to Arcade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
