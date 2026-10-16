import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { ArrowLeft, Ticket, RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface Balloon {
  id: number;
  letter: string;
  x: number; // percentage 10% - 90%
  y: number; // percentage from top 0% - 85%
  speed: number;
  color: string;
}

const BALLOON_COLORS = [
  'bg-rose-500 border-rose-600',
  'bg-amber-400 border-amber-500 text-slate-900',
  'bg-emerald-500 border-emerald-600',
  'bg-sky-500 border-sky-600',
  'bg-purple-500 border-purple-600',
];

const EASY_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', 'g', 'h', 'e', 'r', 'u', 'i', 'o', 't'];

export const BalloonDartGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeStudent, recordSession } = useApp();
  const [score, setScore] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [misses, setMisses] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // Focus on mount
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsGameOver(true);
      sound.playVictoryFanfare();
      if (tickets > 0) {
        recordSession(activeStudent.id, {
          lessonId: 'game-balloon-dart',
          lessonTitle: 'Arcade: Balloon Dart Pop',
          wpm: Math.round((score / 5) / (45 / 60)),
          accuracy: Math.max(70, Math.round((score / (score + misses || 1)) * 100)),
          durationSeconds: 45,
          ticketsEarned: tickets,
          struggleKeys: [],
          totalKeystrokes: score + misses,
          errorKeystrokes: misses,
        });
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, score, misses, tickets, activeStudent.id, recordSession]);

  // Balloon spawn loop
  useEffect(() => {
    if (isGameOver) return;

    const spawnInterval = setInterval(() => {
      setBalloons(prev => {
        if (prev.length >= 6) return prev;
        const letter = EASY_KEYS[Math.floor(Math.random() * EASY_KEYS.length)];
        const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
        const newBalloon: Balloon = {
          id: nextId.current++,
          letter,
          x: 10 + Math.random() * 80,
          y: 85, // starts at bottom
          speed: 1.2 + Math.random() * 0.8,
          color,
        };
        return [...prev, newBalloon];
      });
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [isGameOver]);

  // Float balloons upward
  useEffect(() => {
    if (isGameOver) return;

    const floatInterval = setInterval(() => {
      setBalloons(prev => {
        return prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => {
            if (b.y <= 5) {
              setMisses(m => m + 1);
              return false;
            }
            return true;
          });
      });
    }, 50);

    return () => clearInterval(floatInterval);
  }, [isGameOver]);

  // Handle keystroke to pop balloon
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isGameOver) return;
    const pressed = e.key.toLowerCase();

    let popped = false;
    setBalloons(prev => {
      // Find lowest balloon matching the letter
      const matchingIdx = prev.findIndex(b => b.letter.toLowerCase() === pressed);
      if (matchingIdx !== -1) {
        popped = true;
        sound.playBalloonPop();
        setScore(s => s + 10);
        setTickets(t => t + 5);
        return prev.filter((_, idx) => idx !== matchingIdx);
      }
      return prev;
    });

    if (!popped && EASY_KEYS.includes(pressed)) {
      sound.playKeyError();
      setMisses(m => m + 1);
    }
  }, [isGameOver]);

  const restartGame = () => {
    setScore(0);
    setTickets(0);
    setBalloons([]);
    setTimeLeft(45);
    setIsGameOver(false);
    setMisses(0);
    containerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none max-w-4xl mx-auto px-4 py-6"
    >
      {/* Top Header */}
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
            <span>🎯</span> Balloon Dart Pop
          </h1>
          <p className="text-xs text-slate-500">Type the letter on each balloon before it floats away!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono font-bold">
            Time: <span className="text-rose-600 text-sm">{timeLeft}s</span>
          </div>
          <div className="bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            +{tickets}
          </div>
        </div>
      </div>

      {/* Game Canvas Arena */}
      <div className="relative w-full h-[450px] bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 rounded-3xl border-4 border-amber-300 shadow-xl overflow-hidden cursor-crosshair">
        {/* Clouds and Carnival bunting backdrop */}
        <div className="absolute top-2 inset-x-0 flex justify-around opacity-40 select-none text-2xl">
          <span>☁️</span>
          <span>☁️</span>
          <span>☁️</span>
        </div>

        {/* Floating Balloons */}
        {balloons.map(b => (
          <div
            key={b.id}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute w-14 h-16 rounded-full border-2 shadow-md flex items-center justify-center text-white font-mono font-black text-2xl transition-transform duration-75 select-none ${b.color}`}
          >
            {b.letter.toUpperCase()}
            {/* Balloon knot */}
            <div className="absolute -bottom-1.5 w-2 h-2 bg-inherit border-inherit rotate-45" />
          </div>
        ))}

        {/* Bottom Launcher Strip */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-amber-200/80 border-t-2 border-amber-400 flex items-center justify-center text-xs font-bold text-amber-900">
          Ready... Tap matching keys on your keyboard!
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-4 border-amber-400 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
              🎈
            </div>
            <h2 className="font-display text-2xl font-black text-amber-950">Round Over!</h2>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              You popped <strong className="text-amber-900">{score / 10} balloons</strong>!
            </p>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-6 flex items-center justify-around">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800">Score</span>
                <div className="text-2xl font-black font-mono text-amber-950">{score}</div>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800">Tickets Won</span>
                <div className="text-2xl font-black font-mono text-amber-600 flex items-center justify-center gap-1">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  +{tickets}
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
