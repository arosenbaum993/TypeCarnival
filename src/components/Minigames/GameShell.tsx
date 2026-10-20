import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GameMeta, gradeLabel } from '../../data/games';
import { getHallOfFame, getPersonalBest } from '../../utils/gameStats';
import { ArrowLeft, Maximize2, Minimize2, Play, RotateCcw, Ticket, Trophy, Crown } from 'lucide-react';

export type GamePhase = 'ready' | 'playing' | 'over';

export interface ResultStat {
  label: string;
  value: string | number;
}

interface GameShellProps {
  meta: GameMeta;
  onBack: () => void;
  phase: GamePhase;
  onStart: () => void;
  onRestart: () => void;
  onKey: (e: React.KeyboardEvent) => void;
  timeLeft?: number;
  tickets: number;
  hud?: React.ReactNode; // extra pills in the header (lives, score)
  instructions: string;
  startOptions?: React.ReactNode; // mode picker shown on the start screen
  startHint?: string;
  resultTitle?: string;
  resultStats?: ResultStat[];
  resultNote?: string;
  scoreLabel?: string;
  bestSessionId?: string; // when a game keeps separate bests per mode
  arenaClass: string; // background for the play area
  children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({
  meta,
  onBack,
  phase,
  onStart,
  onRestart,
  onKey,
  timeLeft,
  tickets,
  hud,
  instructions,
  startOptions,
  startHint = 'Press Space or Enter to start',
  resultTitle = 'Round over!',
  resultStats = [],
  resultNote,
  scoreLabel = 'Score',
  bestSessionId,
  arenaClass,
  children,
}) => {
  const { activeStudent, students } = useApp();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);
  const sessionId = bestSessionId || meta.sessionId;
  const best = getPersonalBest(activeStudent, sessionId);
  const hall = getHallOfFame(students, sessionId);

  useEffect(() => {
    wrapperRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        wrapperRef.current?.requestFullscreen?.();
      }
    } catch {
      // some browsers block fullscreen; the game still works in the page
    }
    wrapperRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (phase === 'ready') {
      if (e.key === ' ' || e.key === 'Enter') onStart();
      else onKey(e); // lets games use number keys to pick a mode
      return;
    }
    if (phase === 'playing') onKey(e);
  };

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="game-wrapper outline-none max-w-5xl mx-auto px-4 py-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-200 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Arcade
        </button>
        <div className="text-center">
          <h1 className="font-display text-xl sm:text-2xl font-black text-amber-950 flex items-center justify-center gap-2">
            <span>{meta.emoji}</span> {meta.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {hud}
          {typeof timeLeft === 'number' && (
            <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono font-bold">
              Time: <span className="text-rose-600 text-sm">{timeLeft}s</span>
            </div>
          )}
          <div className="bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />+{tickets}
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900"
            title={isFull ? 'Exit full screen' : 'Full screen'}
            aria-label={isFull ? 'Exit full screen' : 'Full screen'}
          >
            {isFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div
        className={`game-arena relative w-full h-[460px] rounded-3xl border-4 border-amber-300 shadow-xl overflow-hidden select-none ${arenaClass}`}
      >
        {children}

        {phase === 'ready' && (
          <div className="absolute inset-0 z-30 bg-slate-950/55 backdrop-blur-[2px] flex overflow-y-auto p-4">
            <div className="m-auto bg-white rounded-3xl max-w-lg w-full p-5 border-4 border-amber-400 shadow-2xl text-center">
              <div className="text-4xl mb-1">{meta.emoji}</div>
              <h2 className="font-display text-2xl font-black text-amber-950">{meta.name}</h2>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {meta.grades.map(g => (
                  <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {gradeLabel(g)}
                  </span>
                ))}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  ~{meta.minutes} min
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{instructions}</p>
              {startOptions && <div className="mt-3">{startOptions}</div>}
              <button
                onClick={onStart}
                className={`mt-4 px-8 py-3 rounded-2xl font-black text-base shadow-md inline-flex items-center gap-2 ${meta.button}`}
              >
                <Play className="w-5 h-5" /> Play
              </button>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-2">{startHint}</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Your best
                  </div>
                  <div className="font-mono font-black text-xl text-amber-950">{best > 0 ? best : '—'}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Class hall of fame
                  </div>
                  {hall.length === 0 ? (
                    <div className="text-xs text-slate-400 mt-1">Be the first!</div>
                  ) : (
                    <ol className="text-xs mt-1 space-y-0.5">
                      {hall.map((h, i) => (
                        <li key={h.name + i} className="flex justify-between gap-2">
                          <span className="truncate">
                            {i + 1}. {h.avatar} {h.name}
                          </span>
                          <span className="font-mono font-bold">{h.score}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'over' && (
          <div className="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px] flex overflow-y-auto p-4">
            <div className="m-auto bg-white rounded-3xl max-w-md w-full p-6 border-4 border-amber-400 shadow-2xl text-center">
              <div className="text-4xl mb-1">{meta.emoji}</div>
              <h2 className="font-display text-2xl font-black text-amber-950">{resultTitle}</h2>
              {resultNote && <p className="text-sm text-slate-600 mt-1">{resultNote}</p>}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {resultStats.map(s => (
                  <div key={s.label}>
                    <div className="text-[10px] uppercase font-bold text-amber-800">{s.label}</div>
                    <div className="text-xl font-black font-mono text-amber-950">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm font-bold text-amber-800 flex items-center justify-center gap-1">
                <Ticket className="w-4 h-4 text-amber-500" /> +{tickets} tickets
                <span className="text-slate-400 font-medium ml-2">
                  Best {scoreLabel.toLowerCase()}: {Math.max(best, 0) || '—'}
                </span>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={onRestart}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
                <button onClick={onBack} className={`flex-1 py-2.5 font-bold text-sm rounded-xl ${meta.button}`}>
                  Back to Arcade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
