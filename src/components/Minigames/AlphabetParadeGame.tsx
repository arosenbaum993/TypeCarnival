import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { getGame } from '../../data/games';
import { calcAccuracy, topKeys } from '../../utils/gameStats';
import { GamePhase, GameShell } from './GameShell';

const PARADE: { letter: string; animal: string; emoji: string }[] = [
  { letter: 'a', animal: 'Ant', emoji: '🐜' },
  { letter: 'b', animal: 'Bear', emoji: '🐻' },
  { letter: 'c', animal: 'Cat', emoji: '🐱' },
  { letter: 'd', animal: 'Dog', emoji: '🐶' },
  { letter: 'e', animal: 'Elephant', emoji: '🐘' },
  { letter: 'f', animal: 'Fox', emoji: '🦊' },
  { letter: 'g', animal: 'Giraffe', emoji: '🦒' },
  { letter: 'h', animal: 'Horse', emoji: '🐴' },
  { letter: 'i', animal: 'Inchworm', emoji: '🐛' },
  { letter: 'j', animal: 'Jaguar', emoji: '🐆' },
  { letter: 'k', animal: 'Koala', emoji: '🐨' },
  { letter: 'l', animal: 'Lion', emoji: '🦁' },
  { letter: 'm', animal: 'Monkey', emoji: '🐒' },
  { letter: 'n', animal: 'Newt', emoji: '🦎' },
  { letter: 'o', animal: 'Octopus', emoji: '🐙' },
  { letter: 'p', animal: 'Pig', emoji: '🐷' },
  { letter: 'q', animal: 'Queen Bee', emoji: '🐝' },
  { letter: 'r', animal: 'Rabbit', emoji: '🐰' },
  { letter: 's', animal: 'Snake', emoji: '🐍' },
  { letter: 't', animal: 'Tiger', emoji: '🐯' },
  { letter: 'u', animal: 'Unicorn', emoji: '🦄' },
  { letter: 'v', animal: 'Vampire Bat', emoji: '🦇' },
  { letter: 'w', animal: 'Whale', emoji: '🐳' },
  { letter: 'x', animal: 'X-ray Fish', emoji: '🐟' },
  { letter: 'y', animal: 'Yak', emoji: '🐃' },
  { letter: 'z', animal: 'Zebra', emoji: '🦓' },
];

export const AlphabetParadeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const meta = getGame('parade')!;
  const { activeStudent, recordSession } = useApp();
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [idx, setIdx] = useState(0);
  const [errors, setErrors] = useState(0);
  const [shake, setShake] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const missed = useRef<Record<string, number>>({});
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackRef.current?.querySelector('[data-current="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [idx]);

  const start = () => {
    setIdx(0);
    setErrors(0);
    missed.current = {};
    setStartedAt(Date.now());
    setPhase('playing');
    sound.playTicketChime();
  };

  const finish = (errCount: number) => {
    const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setSeconds(secs);
    setPhase('over');
    sound.playVictoryFanfare();
    const accuracy = calcAccuracy(26, errCount);
    recordSession(activeStudent.id, {
      lessonId: meta.sessionId,
      lessonTitle: `Arcade: ${meta.name}`,
      wpm: Math.round((26 / 5) / (secs / 60)),
      accuracy,
      durationSeconds: secs,
      ticketsEarned: 25,
      struggleKeys: topKeys(missed.current),
      totalKeystrokes: 26 + errCount,
      errorKeystrokes: errCount,
      score: accuracy, // best parade = most accurate
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key.length !== 1 || e.key === ' ') return;
    const expected = PARADE[idx].letter;
    if (e.key.toLowerCase() === expected) {
      sound.playKeyClick();
      if (idx === PARADE.length - 1) {
        setIdx(PARADE.length);
        finish(errors);
      } else {
        setIdx(i => i + 1);
      }
    } else {
      sound.playKeyError();
      setErrors(n => n + 1);
      missed.current[expected] = (missed.current[expected] || 0) + 1;
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  const current = PARADE[Math.min(idx, PARADE.length - 1)];
  const accuracy = calcAccuracy(Math.min(idx, 26), errors);

  return (
    <GameShell
      meta={meta}
      onBack={onBack}
      phase={phase}
      onStart={start}
      onRestart={start}
      onKey={handleKey}
      tickets={phase === 'over' ? 25 : 0}
      hud={
        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-bold">
          Letters: <span className="font-mono text-emerald-700 text-sm">{Math.min(idx, 26)}/26</span>
        </div>
      }
      instructions="Type the alphabet from A to Z. Each correct letter brings a new animal into the circus parade. There is no timer, so look carefully for each key."
      arenaClass="bg-gradient-to-b from-sky-300 via-sky-100 to-lime-200"
      scoreLabel="Accuracy"
      resultTitle="Parade complete!"
      resultNote={`All 26 animals marched in ${seconds} seconds.`}
      resultStats={[
        { label: 'Letters', value: 26 },
        { label: 'Oops keys', value: errors },
        { label: 'Accuracy', value: `${calcAccuracy(26, errors)}%` },
        { label: 'Seconds', value: seconds },
      ]}
    >
      <div className="absolute top-0 inset-x-0 h-5 flex">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={`flex-1 ${['bg-rose-500', 'bg-amber-400', 'bg-sky-500', 'bg-lime-500'][i % 4]}`} />
        ))}
      </div>

      {/* Big prompt */}
      <div className="absolute inset-x-0 top-[12%] flex flex-col items-center">
        <div className="text-sm font-bold text-sky-900 uppercase tracking-wider">Find this letter</div>
        <div
          className={`mt-2 w-28 h-28 rounded-3xl bg-white border-4 border-amber-400 shadow-xl flex items-center justify-center font-display font-black text-7xl text-amber-950 transition-transform ${
            shake ? 'translate-x-2 border-rose-500' : ''
          }`}
        >
          {current.letter.toUpperCase()}
        </div>
        <div className="mt-2 text-lg font-bold text-sky-950">
          {current.letter.toUpperCase()} is for {current.animal} <span className="text-2xl">{current.emoji}</span>
        </div>
        <div className="text-xs text-sky-900/70 mt-1">Accuracy so far: {accuracy}%</div>
      </div>

      {/* Parade track */}
      <div ref={trackRef} className="absolute bottom-0 inset-x-0 h-[34%] bg-lime-400/70 border-t-4 border-lime-600 overflow-x-auto overflow-y-hidden">
        <div className="flex items-end gap-2 h-full px-6 pb-3 w-max">
          {PARADE.map((p, i) => (
            <div
              key={p.letter}
              data-current={i === idx}
              className={`flex flex-col items-center w-14 shrink-0 transition-all ${
                i < idx ? 'opacity-100' : i === idx ? 'opacity-80' : 'opacity-25 grayscale'
              }`}
            >
              <span className={`text-4xl ${i < idx ? 'bob' : ''}`}>{p.emoji}</span>
              <span
                className={`mt-1 w-9 h-9 rounded-lg font-mono font-black flex items-center justify-center text-base border-b-4 ${
                  i < idx
                    ? 'bg-emerald-500 text-white border-emerald-700'
                    : i === idx
                      ? 'bg-amber-300 text-amber-950 border-amber-500'
                      : 'bg-white text-slate-500 border-slate-300'
                }`}
              >
                {p.letter.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
