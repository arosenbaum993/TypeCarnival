import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { getGame } from '../../data/games';
import { calcAccuracy, calcWpm, getPersonalBest, topKeys } from '../../utils/gameStats';
import { GamePhase, GameShell } from './GameShell';
import { PassageLine } from './engines/PassageLine';

// Passages get harder as the clock runs: plain lowercase, then full sentences, then numbers and punctuation.
const TIERS: string[][] = [
  [
    'the band plays as the gates open',
    'kids line up for the swings and slides',
    'a red kite floats over the big tent',
    'we found a seat near the front row',
    'the smell of popcorn fills the air',
    'my sister won a stuffed frog at the booth',
  ],
  [
    'The juggler tossed three torches into the night sky.',
    'Every ride has a sign that shows how tall you must be.',
    'Our class saved tickets all week for the prize wall.',
    'The trapeze artist swung high above the safety net.',
    'Bright lights blinked on as the sun went down.',
    'A brass band marched past the cotton candy stand.',
  ],
  [
    'Gates open at 5:30, and the last show starts at 9:00.',
    'Ride tickets: 4 for $5, or 12 for $13 (the best deal).',
    '"Step right up!" called the ringmaster. "Who\'s next?"',
    'Booth #27 sold 148 lemonades before noon on Saturday.',
    'Rules: no running, no climbing, and always hold on tight!',
    'The coaster climbs 90 feet, then drops in 3.5 seconds.',
  ],
];

const pick = (tier: number, avoid?: string) => {
  const list = TIERS[tier].filter(p => p !== avoid);
  return list[Math.floor(Math.random() * list.length)];
};

export const RingmasterChallengeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const meta = getGame('ringmaster')!;
  const { activeStudent, recordSession } = useApp();
  const [duration, setDuration] = useState<60 | 120>(60);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [passage, setPassage] = useState(() => pick(0));
  const [pos, setPos] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [errFlash, setErrFlash] = useState(false);
  const [result, setResult] = useState({ score: 0, wpm: 0, accuracy: 100, tickets: 0 });
  const counts = useRef({ correct: 0, errors: 0 });
  const missed = useRef<Record<string, number>>({});
  const startedAt = useRef(0);
  const endedRef = useRef(false);

  const sessionId = `game-ringmaster-${duration}`;
  const tier = Math.min(2, Math.floor((elapsed / duration) * 3));

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    const wpm = calcWpm(counts.current.correct, duration);
    const accuracy = calcAccuracy(counts.current.correct, counts.current.errors);
    const score = wpm * accuracy;
    const tickets = Math.min(Math.round(score / 50) + (duration === 120 ? 15 : 5), 100);
    setResult({ score, wpm, accuracy, tickets });
    setPhase('over');
    sound.playVictoryFanfare();
    if (counts.current.correct + counts.current.errors > 0) {
      recordSession(activeStudent.id, {
        lessonId: sessionId,
        lessonTitle: `Arcade: ${meta.name} (${duration}s)`,
        wpm,
        accuracy,
        durationSeconds: duration,
        ticketsEarned: tickets,
        struggleKeys: topKeys(missed.current),
        totalKeystrokes: counts.current.correct + counts.current.errors,
        errorKeystrokes: counts.current.errors,
        score,
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
      if (secs >= duration) finishRef.current();
    }, 200);
    return () => clearInterval(id);
  }, [phase, duration]);

  const start = () => {
    counts.current = { correct: 0, errors: 0 };
    missed.current = {};
    endedRef.current = false;
    setPassage(pick(0));
    setPos(0);
    setElapsed(0);
    startedAt.current = Date.now();
    setPhase('playing');
    sound.playTicketChime();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (phase === 'ready') {
      if (e.key === '1') setDuration(60);
      if (e.key === '2') setDuration(120);
      return;
    }
    if (e.key.length !== 1) return;
    const expected = passage[pos];
    if (e.key === expected) {
      counts.current.correct += 1;
      sound.playKeyClick();
      if (pos + 1 >= passage.length) {
        sound.playTicketChime();
        setPassage(p => pick(tier, p));
        setPos(0);
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

  const liveWpm = calcWpm(counts.current.correct, elapsed);
  const liveAcc = calcAccuracy(counts.current.correct, counts.current.errors);
  const best60 = getPersonalBest(activeStudent, 'game-ringmaster-60');
  const best120 = getPersonalBest(activeStudent, 'game-ringmaster-120');

  return (
    <GameShell
      meta={meta}
      onBack={onBack}
      phase={phase}
      onStart={start}
      onRestart={start}
      onKey={handleKey}
      bestSessionId={sessionId}
      timeLeft={phase === 'playing' ? Math.max(0, Math.ceil(duration - elapsed)) : duration}
      tickets={phase === 'over' ? result.tickets : 0}
      hud={
        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-bold">
          Score: <span className="font-mono text-blue-700 text-sm">{phase === 'over' ? result.score : liveWpm * liveAcc}</span>
        </div>
      }
      instructions="Type as much as you can, exactly as shown. The passages get harder as the clock runs down: first plain words, then full sentences, then numbers and punctuation. Score = WPM × accuracy, so a careful run can beat a fast, sloppy one."
      startOptions={
        <div>
          <div className="text-[11px] uppercase font-bold text-slate-500 mb-1.5">Choose your challenge (press 1 or 2)</div>
          <div className="grid grid-cols-2 gap-2">
            {([60, 120] as const).map((d, i) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-3 rounded-xl border-2 font-black ${
                  d === duration ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700 hover:border-blue-300'
                }`}
              >
                <span className="font-mono text-xs mr-1">{i + 1}.</span>
                {d} seconds
                <span className="block text-[11px] font-mono font-bold text-slate-500">
                  Best: {(d === 60 ? best60 : best120) || '—'}
                </span>
              </button>
            ))}
          </div>
        </div>
      }
      arenaClass="bg-gradient-to-b from-indigo-950 via-blue-900 to-violet-800"
      scoreLabel="Score"
      resultTitle={`${duration}-second challenge complete!`}
      resultNote={`Score = ${result.wpm} WPM × ${result.accuracy}% accuracy`}
      resultStats={[
        { label: 'Score', value: result.score },
        { label: 'WPM', value: result.wpm },
        { label: 'Accuracy', value: `${result.accuracy}%` },
        { label: 'Seconds', value: duration },
      ]}
    >
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(transparent_95%,rgba(147,197,253,0.6)_95%),linear-gradient(90deg,transparent_95%,rgba(147,197,253,0.6)_95%)] [background-size:40px_40px]" />
      <div className="absolute top-6 inset-x-0 text-center">
        <div className="text-5xl">🎩</div>
        <div className="mt-2 inline-flex gap-2">
          {['Warm-up', 'Sentences', 'Showstopper'].map((t, i) => (
            <span
              key={t}
              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                i === tier ? 'bg-amber-400 text-amber-950' : i < tier ? 'bg-white/20 text-white/70' : 'bg-white/10 text-white/40'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-6 top-[40%] bg-white rounded-2xl border-4 border-sky-300 shadow-2xl p-5 text-center">
        <PassageLine text={passage} pos={pos} error={errFlash} className="text-2xl sm:text-3xl text-slate-800" />
      </div>
      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-8 text-white">
        <div className="text-center">
          <div className="font-display text-3xl font-black">{phase === 'playing' ? liveWpm : result.wpm}</div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-white/70">WPM</div>
        </div>
        <div className="text-center">
          <div className="font-display text-3xl font-black">{phase === 'playing' ? liveAcc : result.accuracy}%</div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-white/70">Accuracy</div>
        </div>
      </div>
    </GameShell>
  );
};
