import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { ArrowLeft, Ticket, RotateCcw, Sparkles } from 'lucide-react';

interface ClawTarget {
  id: number;
  word: string;
  emoji: string;
  name: string;
  x: number;
}

const PLUSH_TARGETS = [
  { word: 'bear', emoji: '🧸', name: 'Teddy Bear', x: 15 },
  { word: 'lion', emoji: '🦁', name: 'Golden Lion', x: 30 },
  { word: 'dino', emoji: '🦖', name: 'Arcade Dino', x: 45 },
  { word: 'duck', emoji: '🦆', name: 'Lucky Duck', x: 60 },
  { word: 'star', emoji: '⭐', name: 'Carnival Star', x: 75 },
  { word: 'cat', emoji: '🐱', name: 'Calico Cat', x: 90 },
];

export const ClawMachineGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeStudent, recordSession } = useApp();
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [ticketsEarned, setTicketsEarned] = useState(0);
  const [plushiesGrabbed, setPlushiesGrabbed] = useState<string[]>([]);
  const [isClawDropping, setIsClawDropping] = useState(false);
  const [roundsLeft, setRoundsLeft] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const currentTarget = PLUSH_TARGETS[currentTargetIdx % PLUSH_TARGETS.length];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isGameOver || isClawDropping) return;

    if (e.key === 'Backspace') {
      setTypedInput(prev => prev.slice(0, -1));
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const targetChar = currentTarget.word[typedInput.length];
      if (e.key.toLowerCase() === targetChar) {
        sound.playKeyClick();
        const nextTyped = typedInput + e.key.toLowerCase();
        setTypedInput(nextTyped);

        // Word completed! Trigger claw drop!
        if (nextTyped === currentTarget.word) {
          setIsClawDropping(true);
          sound.playClawGrab();

          setTimeout(() => {
            sound.playTicketChime();
            setTicketsEarned(prev => prev + 25);
            setPlushiesGrabbed(prev => [...prev, currentTarget.emoji]);
            setIsClawDropping(false);
            setTypedInput('');

            if (roundsLeft - 1 <= 0) {
              setIsGameOver(true);
              sound.playVictoryFanfare();
              recordSession(activeStudent.id, {
                lessonId: 'game-claw-machine',
                lessonTitle: 'Arcade: Claw Machine Word Grab',
                wpm: 18,
                accuracy: 96,
                durationSeconds: 40,
                ticketsEarned: ticketsEarned + 25,
                struggleKeys: [],
                totalKeystrokes: 30,
                errorKeystrokes: 1,
              });
            } else {
              setRoundsLeft(r => r - 1);
              setCurrentTargetIdx(prev => prev + 1);
            }
          }, 1200);
        }
      } else {
        sound.playKeyError();
      }
    }
  }, [isGameOver, isClawDropping, currentTarget, typedInput, roundsLeft, activeStudent.id, recordSession, ticketsEarned]);

  const restartGame = () => {
    setCurrentTargetIdx(0);
    setTypedInput('');
    setTicketsEarned(0);
    setPlushiesGrabbed([]);
    setIsClawDropping(false);
    setRoundsLeft(5);
    setIsGameOver(false);
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
            <span>🕹️</span> Claw Machine Word Grab
          </h1>
          <p className="text-xs text-slate-500">Type the word precisely to command the robotic claw!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono font-bold">
            Prizes Left: <span className="text-indigo-600 text-sm">{roundsLeft}</span>
          </div>
          <div className="bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            +{ticketsEarned}
          </div>
        </div>
      </div>

      {/* Claw Machine Enclosure Split View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Machine Art & Basket Column */}
        <div className="bg-slate-900 rounded-3xl p-4 border-4 border-amber-400 shadow-xl flex flex-col justify-between text-white">
          <div className="rounded-2xl overflow-hidden border-2 border-amber-300/40 relative h-48 mb-4">
            <img
              src={`${import.meta.env.BASE_URL}images/carnival_claw_machine_1792163243612.jpg`}
              alt="Arcade Claw Machine"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Retro Claw Deluxe
              </span>
            </div>
          </div>

          {/* Prize Basket */}
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>Prize Basket</span>
              <span className="font-mono text-amber-300">{plushiesGrabbed.length} Won</span>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[44px] items-center">
              {plushiesGrabbed.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Grab your first prize!</span>
              ) : (
                plushiesGrabbed.map((emoji, idx) => (
                  <span key={idx} className="text-2xl animate-bounce">
                    {emoji}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Interactive Claw Stage (2 columns wide) */}
        <div className="md:col-span-2 bg-slate-950 rounded-3xl p-6 border-4 border-amber-400 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Top Rail & Claw */}
          <div className="relative w-full h-36 border-b-2 border-amber-500/30">
            {/* Top rail */}
            <div className="absolute top-2 inset-x-0 h-2 bg-amber-400 rounded-full shadow-inner" />

            {/* Moving Claw */}
            <div
              style={{
                left: `${currentTarget.x}%`,
                top: isClawDropping ? '75%' : '10%',
                transition: 'top 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="absolute -translate-x-1/2 flex flex-col items-center z-20"
            >
              {/* Claw cable */}
              <div className="w-1 bg-amber-200 h-16 shadow-xs" />
              {/* Mechanical claw body */}
              <div className="w-8 h-6 bg-amber-400 rounded-t-lg border-2 border-amber-300 flex items-center justify-center text-[10px] font-bold text-slate-950">
                ⚙️
              </div>
              {/* Claws */}
              <div className="flex gap-2 -mt-1 text-base">
                <span>🦾</span>
              </div>
            </div>
          </div>

          {/* Target Plush Shelf */}
          <div className="my-6 flex items-center justify-center">
            <div className="bg-slate-900/90 border-2 border-amber-400 p-6 rounded-2xl flex flex-col items-center text-center shadow-lg max-w-sm w-full">
              <span className="text-5xl mb-3 animate-pulse">{currentTarget.emoji}</span>
              <div className="text-xs uppercase font-bold text-amber-300 mb-1">
                Target: {currentTarget.name}
              </div>

              {/* Monospace Word typing challenge */}
              <div className="font-mono text-3xl font-black tracking-widest bg-slate-950 px-4 py-2 rounded-xl border border-amber-300/40 text-amber-100 mt-2">
                {currentTarget.word.split('').map((char, index) => {
                  const isTyped = index < typedInput.length;
                  const isCurrent = index === typedInput.length;

                  return (
                    <span
                      key={index}
                      className={`${
                        isTyped
                          ? 'text-emerald-400 font-bold'
                          : isCurrent
                          ? 'text-amber-300 underline decoration-rose-500 decoration-4'
                          : 'text-slate-600'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Instruction status */}
          <div className="text-center text-xs font-semibold text-slate-400">
            {isClawDropping ? 'GRABBING PLUSH PRIZE...' : 'Type each letter to lower the claw!'}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-4 border-amber-400 shadow-2xl text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
              🧸
            </div>
            <h2 className="font-display text-2xl font-black text-amber-950">Carnival Claw Master!</h2>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              You won {plushiesGrabbed.length} plush toys for your collection!
            </p>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-6 flex items-center justify-around">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800">Plushies</span>
                <div className="text-2xl font-black font-mono text-amber-950">{plushiesGrabbed.length}</div>
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
