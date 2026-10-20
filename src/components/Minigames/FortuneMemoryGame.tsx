import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import { getGame, WORD_BANKS } from '../../data/games';
import { calcAccuracy, topKeys } from '../../utils/gameStats';
import { GamePhase, GameShell } from './GameShell';

const LETTERS = 'asdfghjklqweruiopzxcvbnm'.split('');
const START_LIVES = 3;

type RoundState = 'show' | 'recall' | 'right' | 'wrong';

const makeRound = (length: number, round: number) => {
  // Every third round from length 4 up is a real word, which is easier to remember
  if (round % 3 === 2 && length >= 4) {
    const words = [...WORD_BANKS.carnival, ...WORD_BANKS.sight].filter(w => w.length === length);
    if (words.length > 0) return words[Math.floor(Math.random() * words.length)];
  }
  let s = '';
  while (s.length < length) {
    const c = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (s[s.length - 1] !== c) s += c;
  }
  return s;
};

export const FortuneMemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const meta = getGame('memory')!;
  const { activeStudent, recordSession } = useApp();
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [length, setLength] = useState(3);
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [typed, setTyped] = useState('');
  const [roundState, setRoundState] = useState<RoundState>('show');
  const [lives, setLives] = useState(START_LIVES);
  const [score, setScore] = useState(0);
  const [streakAtLength, setStreakAtLength] = useState(0);
  const counts = useRef({ correct: 0, errors: 0, started: 0 });
  const missed = useRef<Record<string, number>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const beginRound = (len: number, r: number) => {
    const next = makeRound(len, r);
    setAnswer(next);
    setTyped('');
    setRoundState('show');
    later(() => setRoundState('recall'), 1200 + len * 450);
  };

  const start = () => {
    timers.current.forEach(clearTimeout);
    counts.current = { correct: 0, errors: 0, started: Date.now() };
    missed.current = {};
    setLength(3);
    setRound(0);
    setLives(START_LIVES);
    setScore(0);
    setStreakAtLength(0);
    setPhase('playing');
    beginRound(3, 0);
    sound.playTicketChime();
  };

  const finish = (finalScore: number) => {
    setPhase('over');
    sound.playVictoryFanfare();
    const secs = Math.max(1, Math.round((Date.now() - counts.current.started) / 1000));
    if (counts.current.correct + counts.current.errors > 0) {
      recordSession(activeStudent.id, {
        lessonId: meta.sessionId,
        lessonTitle: `Arcade: ${meta.name}`,
        wpm: 0,
        accuracy: calcAccuracy(counts.current.correct, counts.current.errors),
        durationSeconds: secs,
        ticketsEarned: Math.min(finalScore, 60),
        struggleKeys: topKeys(missed.current),
        totalKeystrokes: counts.current.correct + counts.current.errors,
        errorKeystrokes: counts.current.errors,
        score: finalScore,
      });
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (roundState !== 'recall' || e.key.length !== 1 || e.key === ' ') return;
    const key = e.key.toLowerCase();
    const expected = answer[typed.length];
    const nextTyped = typed + key;
    setTyped(nextTyped);

    if (key !== expected) {
      counts.current.errors += 1;
      missed.current[expected] = (missed.current[expected] || 0) + 1;
      sound.playKeyError();
      setRoundState('wrong');
      const left = lives - 1;
      setLives(left);
      setStreakAtLength(0);
      later(() => {
        if (left <= 0) {
          finish(score);
        } else {
          setRound(r => r + 1);
          beginRound(length, round + 1);
        }
      }, 1600);
      return;
    }

    counts.current.correct += 1;
    sound.playKeyClick();
    if (nextTyped.length === answer.length) {
      setRoundState('right');
      sound.playTicketChime();
      const newScore = score + answer.length;
      setScore(newScore);
      const streak = streakAtLength + 1;
      const nextLen = streak >= 2 ? Math.min(length + 1, 9) : length;
      setStreakAtLength(streak >= 2 ? 0 : streak);
      setLength(nextLen);
      later(() => {
        setRound(r => r + 1);
        beginRound(nextLen, round + 1);
      }, 900);
    }
  };

  const showLetters = roundState === 'show' || roundState === 'wrong';

  return (
    <GameShell
      meta={meta}
      onBack={onBack}
      phase={phase}
      onStart={start}
      onRestart={start}
      onKey={handleKey}
      tickets={Math.min(score, 60)}
      hud={
        <>
          <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-sm">
            {Array.from({ length: START_LIVES }).map((_, i) => (
              <span key={i} className={i < lives ? '' : 'opacity-20 grayscale'}>
                💜
              </span>
            ))}
          </div>
          <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-bold">
            Score: <span className="font-mono text-purple-700 text-sm">{score}</span>
          </div>
        </>
      }
      instructions="The crystal ball shows some letters for a moment, then hides them. Type them back in the same order from memory. Get two right in a row and the next fortune grows by one letter. 3 wrong guesses ends the reading."
      arenaClass="bg-gradient-to-b from-indigo-950 via-purple-900 to-fuchsia-900"
      scoreLabel="Score"
      resultTitle="The fortune teller has spoken!"
      resultNote={`Longest fortune: ${length} letters.`}
      resultStats={[
        { label: 'Score', value: score },
        { label: 'Rounds', value: round },
        { label: 'Accuracy', value: `${calcAccuracy(counts.current.correct, counts.current.errors)}%` },
        { label: 'Length', value: length },
      ]}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <div className="text-7xl drop-shadow-[0_0_30px_rgba(216,180,254,0.8)]">🔮</div>
        <div className="flex gap-2">
          {answer.split('').map((c, i) => {
            const typedChar = typed[i];
            const wrongHere = roundState === 'wrong' && i === typed.length - 1;
            let cls = 'bg-purple-200 text-purple-950 border-purple-400';
            let shown: string = showLetters ? c.toUpperCase() : '?';
            if (typedChar !== undefined && !wrongHere) {
              cls = 'bg-emerald-400 text-emerald-950 border-emerald-600';
              shown = typedChar.toUpperCase();
            }
            if (wrongHere) cls = 'bg-rose-500 text-white border-rose-700';
            if (!showLetters && typedChar === undefined) cls = 'bg-indigo-800 text-indigo-200 border-indigo-500';
            return (
              <div
                key={i}
                className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl border-b-4 flex items-center justify-center font-mono font-black text-3xl ${cls}`}
              >
                {wrongHere ? c.toUpperCase() : shown}
              </div>
            );
          })}
        </div>
        <div className="text-purple-100 font-bold text-lg h-7">
          {roundState === 'show' && 'Remember these...'}
          {roundState === 'recall' && 'Now type them!'}
          {roundState === 'right' && '✨ The spirits approve! ✨'}
          {roundState === 'wrong' && 'Not quite. Here was the fortune.'}
        </div>
      </div>
    </GameShell>
  );
};
