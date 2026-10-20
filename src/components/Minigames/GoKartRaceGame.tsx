import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { getGame, WORD_BANKS } from '../../data/games';
import { calcAccuracy, calcWpm, topKeys } from '../../utils/gameStats';
import { GamePhase, GameShell } from './GameShell';
import { GradeLevel } from '../../types';

const PACE_CARS = [
  { id: 'easy', label: 'Kiddie Kart', wpm: 10 },
  { id: 'medium', label: 'Midway Racer', wpm: 18 },
  { id: 'hard', label: 'Big Top Blaze', wpm: 26 },
  { id: 'pro', label: 'Ringmaster Rocket', wpm: 35 },
] as const;

const RACE_SECONDS = 50; // the pace car finishes in this time

const defaultPace = (grade: GradeLevel) =>
  grade === 'Grade 2' ? 0 : grade === 'Grade 3' ? 1 : grade === 'Grade 4' ? 1 : 2;

const buildStream = () => {
  const words = [...WORD_BANKS.race, ...WORD_BANKS.carnival].sort(() => Math.random() - 0.5);
  return words.join(' ');
};

export const GoKartRaceGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const meta = getGame('kart')!;
  const { activeStudent, recordSession } = useApp();
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [paceIdx, setPaceIdx] = useState(() => defaultPace(activeStudent.grade));
  const [text, setText] = useState(buildStream);
  const [pos, setPos] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [errFlash, setErrFlash] = useState(false);
  const [result, setResult] = useState<{ won: boolean; wpm: number; accuracy: number; time: number; tickets: number } | null>(null);
  const counts = useRef({ correct: 0, errors: 0 });
  const missed = useRef<Record<string, number>>({});
  const startedAt = useRef(0);
  const finishedRef = useRef(false);

  const pace = PACE_CARS[paceIdx];
  const finishChars = Math.round(pace.wpm * 5 * (RACE_SECONDS / 60));
  const cpuDistance = Math.min(finishChars, (pace.wpm * 5 * elapsed) / 60);

  const finish = (won: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const time = Math.max(1, (Date.now() - startedAt.current) / 1000);
    const wpm = calcWpm(counts.current.correct, time);
    const accuracy = calcAccuracy(counts.current.correct, counts.current.errors);
    const tickets = won ? 30 + paceIdx * 10 : 12;
    setResult({ won, wpm, accuracy, time: Math.round(time), tickets });
    setPhase('over');
    if (won) sound.playVictoryFanfare();
    else sound.playKeyError();
    if (counts.current.correct + counts.current.errors > 0) {
      recordSession(activeStudent.id, {
        lessonId: meta.sessionId,
        lessonTitle: `Arcade: ${meta.name} (${pace.label})`,
        wpm,
        accuracy,
        durationSeconds: Math.round(time),
        ticketsEarned: tickets,
        struggleKeys: topKeys(missed.current),
        totalKeystrokes: counts.current.correct + counts.current.errors,
        errorKeystrokes: counts.current.errors,
        score: wpm,
      });
    }
  };

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const secs = (Date.now() - startedAt.current) / 1000;
      setElapsed(secs);
      if (secs >= RACE_SECONDS) finishRef.current(false);
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    counts.current = { correct: 0, errors: 0 };
    missed.current = {};
    finishedRef.current = false;
    setText(buildStream());
    setPos(0);
    setDistance(0);
    setElapsed(0);
    setResult(null);
    startedAt.current = Date.now();
    setPhase('playing');
    sound.playTicketChime();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (phase === 'ready') {
      const n = Number(e.key);
      if (n >= 1 && n <= PACE_CARS.length) setPaceIdx(n - 1);
      return;
    }
    if (e.key.length !== 1) return;
    const expected = text[pos];
    if (e.key === expected) {
      counts.current.correct += 1;
      sound.playKeyClick();
      setPos(p => p + 1);
      const d = distance + 1;
      setDistance(d);
      if (d >= finishChars) finish(true);
      if (pos > text.length - 60) setText(t => `${t} ${buildStream()}`);
    } else {
      counts.current.errors += 1;
      missed.current[expected === ' ' ? 'space' : expected] = (missed.current[expected === ' ' ? 'space' : expected] || 0) + 1;
      sound.playKeyError();
      setDistance(d => Math.max(0, d - 2)); // a mistake spins your wheels
      setErrFlash(true);
      setTimeout(() => setErrFlash(false), 200);
    }
  };

  const pct = (d: number) => 6 + (Math.min(d, finishChars) / finishChars) * 82;
  const ahead = text.slice(pos, pos + 48);
  const behind = text.slice(Math.max(0, pos - 14), pos);

  return (
    <GameShell
      meta={meta}
      onBack={onBack}
      phase={phase}
      onStart={start}
      onRestart={start}
      onKey={handleKey}
      timeLeft={phase === 'playing' ? Math.max(0, Math.ceil(RACE_SECONDS - elapsed)) : RACE_SECONDS}
      tickets={result?.tickets ?? 0}
      hud={
        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-bold">
          WPM: <span className="font-mono text-red-600 text-sm">{phase === 'playing' ? calcWpm(counts.current.correct, elapsed) : result?.wpm ?? 0}</span>
        </div>
      }
      instructions={`Type the words to drive your kart. Beat the pace car to the finish line. The pace car types ${pace.wpm} WPM and never makes mistakes; every mistake you make spins your wheels backward.`}
      startOptions={
        <div>
          <div className="text-[11px] uppercase font-bold text-slate-500 mb-1.5">Choose your pace car (press 1-4)</div>
          <div className="grid grid-cols-2 gap-2">
            {PACE_CARS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setPaceIdx(i)}
                className={`px-3 py-2 rounded-xl border-2 text-xs font-bold text-left ${
                  i === paceIdx ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 text-slate-700 hover:border-red-300'
                }`}
              >
                <span className="font-mono mr-1">{i + 1}.</span> {p.label}
                <span className="block font-mono text-[11px] text-slate-500">{p.wpm} WPM</span>
              </button>
            ))}
          </div>
        </div>
      }
      arenaClass="bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-300"
      scoreLabel="WPM"
      resultTitle={result?.won ? '🏁 You won the race!' : 'The pace car got there first'}
      resultNote={result?.won ? `Finished in ${result.time} seconds against ${pace.label}.` : 'Clean typing is faster than rushing. Try again!'}
      resultStats={[
        { label: 'Result', value: result?.won ? 'Win' : 'Try again' },
        { label: 'WPM', value: result?.wpm ?? 0 },
        { label: 'Accuracy', value: `${result?.accuracy ?? 100}%` },
        { label: 'Seconds', value: result?.time ?? 0 },
      ]}
    >
      {/* Grandstand */}
      <div className="absolute top-0 inset-x-0 h-[22%] bg-gradient-to-b from-slate-700 to-slate-600 flex flex-wrap gap-1 p-2 content-start opacity-90">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-full ${['bg-rose-400', 'bg-amber-300', 'bg-sky-300', 'bg-white'][i % 4]}`} />
        ))}
      </div>
      {/* Track */}
      <div className="absolute inset-x-0 top-[26%] h-[40%] bg-slate-600 border-y-8 border-y-white">
        <div className="absolute inset-x-0 top-1/2 border-t-4 border-dashed border-yellow-300" />
        <div
          className="absolute top-0 bottom-0 w-6 left-[89%] bg-[repeating-conic-gradient(#111_0_25%,#fff_0_50%)] [background-size:12px_12px]"
          aria-hidden
        />
        <div className="absolute top-[8%] text-5xl transition-[left] duration-100 -scale-x-100" style={{ left: `${pct(cpuDistance)}%` }} title="Pace car">
          🚙
        </div>
        <div
          className={`absolute bottom-[8%] text-5xl transition-[left] duration-100 -scale-x-100 ${errFlash ? 'rotate-12' : ''}`}
          style={{ left: `${pct(distance)}%` }}
          title="Your kart"
        >
          🏎️
        </div>
        <div className="absolute left-2 top-1 text-[10px] font-bold text-white/80">PACE CAR · {pace.wpm} WPM</div>
        <div className="absolute left-2 bottom-1 text-[10px] font-bold text-white/80">{activeStudent.name.toUpperCase()}</div>
      </div>
      {/* Typing strip */}
      <div className="absolute inset-x-4 bottom-4 h-[24%] bg-slate-900/90 rounded-2xl border-2 border-white/30 flex items-center px-4 overflow-hidden">
        <div className={`font-mono text-2xl sm:text-3xl whitespace-pre ${errFlash ? 'animate-pulse' : ''}`}>
          <span className="text-emerald-400/60">{behind}</span>
          <span className={`${errFlash ? 'bg-rose-500' : 'bg-amber-400'} text-slate-950 rounded px-0.5`}>
            {ahead[0] === ' ' ? '␣' : ahead[0]}
          </span>
          <span className="text-white">{ahead.slice(1)}</span>
        </div>
      </div>
    </GameShell>
  );
};
