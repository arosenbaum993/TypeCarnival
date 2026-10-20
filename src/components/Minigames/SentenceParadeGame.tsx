import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { getGame } from '../../data/games';
import { calcAccuracy, calcWpm, topKeys } from '../../utils/gameStats';
import { GamePhase, GameShell } from './GameShell';
import { PassageLine } from './engines/PassageLine';

const SECONDS = 90;

// Original sentences. Each one practices capitals, end marks, commas, or apostrophes.
const SENTENCES = [
  'The lion tamer bowed, and the crowd cheered.',
  'Can you juggle five red balls at once?',
  'Wow! The acrobat flipped across the high wire.',
  'Maya, Leo, and Sam shared a bag of popcorn.',
  "The clown's shoes were bigger than a canoe.",
  'On Saturday, the circus train rolled into town.',
  'Please hold the ladder while I hang the banner.',
  'The seal balanced a ball on its nose for ten seconds.',
  "We didn't expect the elephant to dance!",
  'After the parade, we rode the Ferris wheel twice.',
  'Did the magician really pull a rabbit from his hat?',
  'The band played loudly, and the drums shook the tent.',
  "Grandma's lemonade won first prize at the fair.",
  'Look out! The stilt walker is coming this way.',
  'Tickets cost two dollars, so I saved my allowance.',
  'Under the big top, the spotlight found the ringmaster.',
];

const RINGS = ['🦁', '🐘', '🦒', '🐒', '🦓', '🐪', '🦜', '🐯'];

export const SentenceParadeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const meta = getGame('sentences')!;
  const { activeStudent, recordSession } = useApp();
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [order, setOrder] = useState<string[]>(SENTENCES);
  const [sIdx, setSIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [errFlash, setErrFlash] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(0);
  const [result, setResult] = useState({ wpm: 0, accuracy: 100, tickets: 0, done: 0 });
  const counts = useRef({ correct: 0, errors: 0 });
  const missed = useRef<Record<string, number>>({});
  const startedAt = useRef(0);
  const endedRef = useRef(false);

  const finish = (completed: number) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const secs = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const wpm = calcWpm(counts.current.correct, secs);
    const accuracy = calcAccuracy(counts.current.correct, counts.current.errors);
    const tickets = Math.min(completed * 8 + (accuracy >= 95 ? 15 : 0), 90);
    setResult({ wpm, accuracy, tickets, done: completed });
    setPhase('over');
    sound.playVictoryFanfare();
    if (counts.current.correct + counts.current.errors > 0) {
      recordSession(activeStudent.id, {
        lessonId: meta.sessionId,
        lessonTitle: `Arcade: ${meta.name}`,
        wpm,
        accuracy,
        durationSeconds: secs,
        ticketsEarned: tickets,
        struggleKeys: topKeys(missed.current),
        totalKeystrokes: counts.current.correct + counts.current.errors,
        errorKeystrokes: counts.current.errors,
        score: completed,
      });
    }
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const secs = (Date.now() - startedAt.current) / 1000;
      setElapsed(secs);
      if (secs >= SECONDS) finishRef.current(doneRef.current);
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    setOrder([...SENTENCES].sort(() => Math.random() - 0.5));
    setSIdx(0);
    setPos(0);
    setDone(0);
    setElapsed(0);
    counts.current = { correct: 0, errors: 0 };
    missed.current = {};
    endedRef.current = false;
    startedAt.current = Date.now();
    setPhase('playing');
    sound.playTicketChime();
  };

  const sentence = order[sIdx % order.length];

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key.length !== 1) return;
    const expected = sentence[pos];
    if (e.key === expected) {
      counts.current.correct += 1;
      sound.playKeyClick();
      if (pos + 1 >= sentence.length) {
        const completed = done + 1;
        setDone(completed);
        sound.playTicketChime();
        setSIdx(i => i + 1);
        setPos(0);
        if (completed >= RINGS.length * 2) finish(completed);
      } else {
        setPos(pos + 1);
      }
    } else {
      counts.current.errors += 1;
      const k = expected === ' ' ? 'space' : expected.toLowerCase();
      missed.current[k] = (missed.current[k] || 0) + 1;
      sound.playKeyError();
      setErrFlash(true);
      setTimeout(() => setErrFlash(false), 180);
    }
  };

  const ring = done % RINGS.length;
  const marcherLeft = 6 + (ring / (RINGS.length - 1)) * 86;

  return (
    <GameShell
      meta={meta}
      onBack={onBack}
      phase={phase}
      onStart={start}
      onRestart={start}
      onKey={handleKey}
      timeLeft={phase === 'playing' ? Math.max(0, Math.ceil(SECONDS - elapsed)) : SECONDS}
      tickets={phase === 'over' ? result.tickets : Math.min(done * 8, 90)}
      hud={
        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-bold">
          Sentences: <span className="font-mono text-amber-700 text-sm">{phase === 'over' ? result.done : done}</span>
        </div>
      }
      instructions="Type each sentence exactly: every capital letter, comma, apostrophe, and end mark counts. Each finished sentence marches the parade to the next ring. You have 90 seconds."
      arenaClass="bg-gradient-to-b from-orange-300 via-amber-200 to-amber-100"
      scoreLabel="Sentences"
      resultTitle="Parade's over!"
      resultNote={`You marched through ${result.done} sentence${result.done === 1 ? '' : 's'}.`}
      resultStats={[
        { label: 'Sentences', value: result.done },
        { label: 'WPM', value: result.wpm },
        { label: 'Accuracy', value: `${result.accuracy}%` },
        { label: 'Seconds', value: SECONDS },
      ]}
    >
      {/* Big top stripes */}
      <div className="absolute top-0 inset-x-0 h-[16%] flex">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className={`flex-1 ${i % 2 ? 'bg-white' : 'bg-red-500'} rounded-b-full`} />
        ))}
      </div>

      {/* Sentence card */}
      <div className="absolute inset-x-6 top-[20%] bg-slate-900 rounded-2xl border-4 border-amber-300 shadow-xl p-5 text-center">
        <div className="text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-2">
          Type it exactly · capitals and punctuation count
        </div>
        <PassageLine text={sentence} pos={pos} error={errFlash} className="text-2xl sm:text-3xl text-white" />
      </div>

      {/* Parade route */}
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-amber-700 to-amber-500 border-t-4 border-amber-800">
        <div className="absolute inset-x-[6%] top-[42%] border-t-4 border-dotted border-amber-200/70" />
        {RINGS.map((animal, i) => (
          <div
            key={i}
            className="absolute top-[18%] -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${6 + (i / (RINGS.length - 1)) * 86}%` }}
          >
            <div
              className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-2xl ${
                i <= ring && done > 0 ? 'bg-amber-200 border-red-500' : 'bg-amber-100/40 border-amber-200/60 grayscale opacity-60'
              }`}
            >
              {animal}
            </div>
          </div>
        ))}
        <div className="absolute bottom-2 -translate-x-1/2 text-4xl transition-[left] duration-500" style={{ left: `${marcherLeft}%` }}>
          🎺
        </div>
      </div>
    </GameShell>
  );
};
