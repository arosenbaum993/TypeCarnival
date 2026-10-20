import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { sound } from '../../../utils/audio';
import { GameMeta } from '../../../data/games';
import { calcAccuracy, calcWpm, topKeys } from '../../../utils/gameStats';
import { GamePhase, GameShell } from '../GameShell';

export interface Target {
  id: number;
  text: string; // lowercase answer
  x: number; // % from left (center)
  y: number; // % from top (center)
  speed: number; // % per second
  variant: number;
}

export interface TargetRenderState {
  locked: boolean;
  typed: number; // letters typed so far (word mode)
}

export interface TargetGameConfig {
  meta: GameMeta;
  mode: 'char' | 'word';
  pool: string[];
  direction: 'down' | 'up' | 'left';
  duration: number; // seconds
  lives?: number; // when set, every escape costs a life
  spawnMs: number;
  speed: [number, number];
  maxOnScreen: number;
  ticketsPerHit: number;
  ticketCap?: number;
  rampUp?: boolean; // spawns and speed increase over the round
  lanes?: number[]; // fixed y positions for 'left' movers
  arenaClass: string;
  instructions: string;
  scenery?: React.ReactNode;
  renderTarget: (t: Target, s: TargetRenderState) => React.ReactNode;
  hitWord?: string; // "Caught", "Popped"...
  escapeWord?: string;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  label: string;
}

const START_POS = { down: -8, up: 108, left: 108 };

export const TargetGame: React.FC<{ config: TargetGameConfig; onBack: () => void }> = ({ config, onBack }) => {
  const { activeStudent, recordSession } = useApp();
  const {
    meta,
    mode,
    pool,
    direction,
    duration,
    lives: startLives,
    spawnMs,
    speed,
    maxOnScreen,
    ticketsPerHit,
    ticketCap = 80,
    rampUp,
    lanes,
  } = config;

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [, setFrame] = useState(0);

  const targetsRef = useRef<Target[]>([]);
  const burstsRef = useRef<Burst[]>([]);
  const lockedRef = useRef<number | null>(null);
  const typedRef = useRef(0);
  const nextId = useRef(1);
  const spawnTimer = useRef(0);
  const elapsedRef = useRef(0);
  const livesRef = useRef(startLives ?? 0);
  const stats = useRef({ hits: 0, escapes: 0, correct: 0, errors: 0, streak: 0, bestStreak: 0 });
  const struggle = useRef<Record<string, number>>({});
  const [final, setFinal] = useState({ tickets: 0, wpm: 0, accuracy: 100, hits: 0, escapes: 0, bestStreak: 0 });

  const tickets = Math.min(stats.current.hits * ticketsPerHit, ticketCap);

  const pickText = useCallback(() => {
    const onScreen = targetsRef.current;
    for (let tries = 0; tries < 12; tries++) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (mode === 'word') {
        // Keep first letters unique on screen so the first key picks one word
        if (!onScreen.some(t => t.text[0] === candidate[0])) return candidate;
      } else if (!onScreen.some(t => t.text === candidate)) {
        return candidate;
      }
    }
    return null;
  }, [pool, mode]);

  const spawn = useCallback(() => {
    if (targetsRef.current.length >= maxOnScreen) return;
    const text = pickText();
    if (!text) return;
    const ramp = rampUp ? 1 + Math.min(elapsedRef.current / duration, 1) * 0.6 : 1;
    const s = (speed[0] + Math.random() * (speed[1] - speed[0])) * ramp;
    let x = 0;
    let y = 0;
    if (direction === 'left') {
      x = START_POS.left;
      const options = lanes || [20, 38, 56, 74];
      const free = options.filter(l => !targetsRef.current.some(t => Math.abs(t.y - l) < 4 && t.x > 80));
      if (free.length === 0) return;
      y = free[Math.floor(Math.random() * free.length)];
    } else {
      y = START_POS[direction];
      for (let tries = 0; tries < 8; tries++) {
        x = 10 + Math.random() * 80;
        const nearY = direction === 'down' ? 15 : 85;
        if (!targetsRef.current.some(t => Math.abs(t.x - x) < 14 && Math.abs(t.y - nearY) < 25)) break;
      }
    }
    targetsRef.current = [
      ...targetsRef.current,
      { id: nextId.current++, text, x, y, speed: s, variant: Math.floor(Math.random() * 6) },
    ];
  }, [maxOnScreen, pickText, rampUp, duration, speed, direction, lanes]);

  const endGame = useCallback(() => {
    const st = stats.current;
    const seconds = Math.round(elapsedRef.current);
    const wpm = calcWpm(st.correct, seconds);
    const accuracy = calcAccuracy(st.correct, st.errors);
    const earned = Math.min(st.hits * ticketsPerHit, ticketCap);
    setFinal({ tickets: earned, wpm, accuracy, hits: st.hits, escapes: st.escapes, bestStreak: st.bestStreak });
    setPhase('over');
    sound.playVictoryFanfare();
    if (st.correct + st.errors > 0) {
      recordSession(activeStudent.id, {
        lessonId: meta.sessionId,
        lessonTitle: `Arcade: ${meta.name}`,
        wpm,
        accuracy,
        durationSeconds: Math.max(seconds, 1),
        ticketsEarned: earned,
        struggleKeys: topKeys(struggle.current),
        totalKeystrokes: st.correct + st.errors,
        errorKeystrokes: st.errors,
        score: st.hits,
      });
    }
  }, [ticketsPerHit, ticketCap, recordSession, activeStudent.id, meta]);

  const endGameRef = useRef(endGame);
  endGameRef.current = endGame;
  const spawnRef = useRef(spawn);
  spawnRef.current = spawn;

  // Main loop
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    let last = performance.now();
    let ended = false;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsedRef.current += dt;

      spawnTimer.current += dt * 1000;
      const ramp = rampUp ? 1 - Math.min(elapsedRef.current / duration, 1) * 0.35 : 1;
      if (spawnTimer.current >= spawnMs * ramp || targetsRef.current.length === 0) {
        spawnTimer.current = 0;
        spawnRef.current();
      }

      const survivors: Target[] = [];
      for (const t of targetsRef.current) {
        const moved = { ...t };
        if (direction === 'down') moved.y += t.speed * dt;
        else if (direction === 'up') moved.y -= t.speed * dt;
        else moved.x -= t.speed * dt;
        const escaped =
          (direction === 'down' && moved.y >= 88) ||
          (direction === 'up' && moved.y <= 6) ||
          (direction === 'left' && moved.x <= 9);
        if (escaped) {
          stats.current.escapes += 1;
          stats.current.streak = 0;
          struggle.current[t.text[0]] = (struggle.current[t.text[0]] || 0) + 1;
          if (lockedRef.current === t.id) {
            lockedRef.current = null;
            typedRef.current = 0;
          }
          if (startLives) livesRef.current -= 1;
          sound.playKeyError();
        } else {
          survivors.push(moved);
        }
      }
      targetsRef.current = survivors;

      const timeUp = elapsedRef.current >= duration;
      const outOfLives = !!startLives && livesRef.current <= 0;
      if ((timeUp || outOfLives) && !ended) {
        ended = true;
        endGameRef.current();
        return;
      }
      setFrame(f => (f + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, spawnMs, direction, duration, startLives, rampUp]);

  const pop = (t: Target) => {
    targetsRef.current = targetsRef.current.filter(x => x.id !== t.id);
    const burst = { id: t.id, x: t.x, y: t.y, label: mode === 'word' ? t.text : t.text.toUpperCase() };
    burstsRef.current = [...burstsRef.current, burst];
    setTimeout(() => {
      burstsRef.current = burstsRef.current.filter(b => b.id !== burst.id);
    }, 360);
    stats.current.hits += 1;
    stats.current.streak += 1;
    stats.current.bestStreak = Math.max(stats.current.bestStreak, stats.current.streak);
    if (mode === 'word') sound.playTicketChime();
    else sound.playBalloonPop();
  };

  // Closest to escaping goes first
  const danger = (t: Target) => (direction === 'down' ? t.y : direction === 'up' ? -t.y : -t.x);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key.length !== 1) return;
    const key = e.key.toLowerCase();
    const st = stats.current;

    if (mode === 'char') {
      const matches = targetsRef.current.filter(t => t.text === key);
      if (matches.length === 0) {
        if (key === ' ') return;
        st.errors += 1;
        st.streak = 0;
        sound.playKeyError();
        return;
      }
      const target = matches.sort((a, b) => danger(b) - danger(a))[0];
      st.correct += 1;
      pop(target);
      return;
    }

    // word mode
    if (key === ' ') return;
    let locked = targetsRef.current.find(t => t.id === lockedRef.current);
    if (!locked) {
      const starts = targetsRef.current.filter(t => t.text[0] === key).sort((a, b) => danger(b) - danger(a));
      if (starts.length === 0) {
        st.errors += 1;
        st.streak = 0;
        sound.playKeyError();
        return;
      }
      locked = starts[0];
      lockedRef.current = locked.id;
      typedRef.current = 0;
    }
    const expected = locked.text[typedRef.current];
    if (key === expected) {
      st.correct += 1;
      typedRef.current += 1;
      sound.playKeyClick();
      if (typedRef.current >= locked.text.length) {
        pop(locked);
        lockedRef.current = null;
        typedRef.current = 0;
      }
    } else {
      st.errors += 1;
      st.streak = 0;
      struggle.current[expected] = (struggle.current[expected] || 0) + 1;
      sound.playKeyError();
    }
    setFrame(f => f + 1);
  };

  const start = () => {
    targetsRef.current = [];
    burstsRef.current = [];
    lockedRef.current = null;
    typedRef.current = 0;
    spawnTimer.current = 0;
    elapsedRef.current = 0;
    livesRef.current = startLives ?? 0;
    stats.current = { hits: 0, escapes: 0, correct: 0, errors: 0, streak: 0, bestStreak: 0 };
    struggle.current = {};
    setPhase('playing');
    sound.playTicketChime();
  };

  const timeLeft = Math.max(0, Math.ceil(duration - elapsedRef.current));
  const hitWord = config.hitWord || 'Caught';
  const escapeWord = config.escapeWord || 'Missed';

  const hud = (
    <>
      {startLives ? (
        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-sm" aria-label={`${livesRef.current} lives left`}>
          {Array.from({ length: startLives }).map((_, i) => (
            <span key={i} className={i < livesRef.current ? '' : 'opacity-20 grayscale'}>
              ❤️
            </span>
          ))}
        </div>
      ) : null}
      <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-bold">
        {hitWord}: <span className="font-mono text-emerald-700 text-sm">{phase === 'over' ? final.hits : stats.current.hits}</span>
      </div>
    </>
  );

  return (
    <GameShell
      meta={meta}
      onBack={onBack}
      phase={phase}
      onStart={start}
      onRestart={start}
      onKey={handleKey}
      timeLeft={phase === 'ready' ? duration : timeLeft}
      tickets={phase === 'over' ? final.tickets : tickets}
      hud={hud}
      instructions={config.instructions}
      arenaClass={config.arenaClass}
      scoreLabel={hitWord}
      resultTitle={startLives && livesRef.current <= 0 ? 'Out of lives!' : "Time's up!"}
      resultStats={[
        { label: hitWord, value: final.hits },
        { label: escapeWord, value: final.escapes },
        { label: 'Accuracy', value: `${final.accuracy}%` },
        mode === 'word' ? { label: 'WPM', value: final.wpm } : { label: 'Best streak', value: final.bestStreak },
      ]}
    >
      {config.scenery}
      {targetsRef.current.map(t => (
        <div
          key={t.id}
          data-target={t.text}
          className="absolute z-10"
          style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {config.renderTarget(t, { locked: lockedRef.current === t.id, typed: lockedRef.current === t.id ? typedRef.current : 0 })}
        </div>
      ))}
      {burstsRef.current.map(b => (
        <div
          key={`burst-${b.id}`}
          className="pop-burst absolute z-20 font-display font-black text-3xl text-amber-400 drop-shadow"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
        >
          ✨
        </div>
      ))}
    </GameShell>
  );
};

// Shared helper: a word with the typed part highlighted
export const TypedWord: React.FC<{ text: string; typed: number; done?: string; rest?: string }> = ({
  text,
  typed,
  done = 'text-emerald-400',
  rest = 'text-white',
}) => (
  <span className="font-mono font-black tracking-wide">
    <span className={done}>{text.slice(0, typed)}</span>
    <span className={rest}>{text.slice(typed)}</span>
  </span>
);
