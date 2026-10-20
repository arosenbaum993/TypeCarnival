import React from 'react';
import { TargetGame, TargetGameConfig, TypedWord } from './engines/TargetGame';
import { getGame, WORD_BANKS } from '../../data/games';

type Props = { onBack: () => void };

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const CANDY = [
  'bg-rose-500 border-rose-700',
  'bg-amber-400 border-amber-600 text-amber-950',
  'bg-emerald-500 border-emerald-700',
  'bg-sky-500 border-sky-700',
  'bg-violet-500 border-violet-700',
  'bg-orange-500 border-orange-700',
];

const label = (s: string) => (s === ';' ? ';' : s.toUpperCase());

/* ---------- Confetti Cannon: falling letters for Pre-K to 1st ---------- */
const confetti: TargetGameConfig = {
  meta: getGame('confetti')!,
  mode: 'char',
  pool: ALPHABET,
  direction: 'down',
  duration: 60,
  spawnMs: 1900,
  speed: [6, 9],
  maxOnScreen: 4,
  ticketsPerHit: 3,
  rampUp: true,
  arenaClass: 'bg-gradient-to-b from-pink-200 via-sky-100 to-yellow-50',
  hitWord: 'Caught',
  instructions:
    'Letters fall from the confetti cannon. Find each letter on your keyboard and press it before it reaches the ground. Take your time and look for the letter.',
  scenery: (
    <>
      <div className="absolute top-3 inset-x-0 flex justify-around text-3xl opacity-60">
        <span>🎉</span>
        <span>🎊</span>
        <span>🎉</span>
        <span>🎊</span>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[12%] bg-gradient-to-t from-lime-400 to-lime-300 border-t-4 border-lime-500" />
    </>
  ),
  renderTarget: t => (
    <div
      className={`w-16 h-16 rounded-full border-4 shadow-lg flex items-center justify-center font-display font-black text-3xl text-white ${CANDY[t.variant]}`}
    >
      {label(t.text)}
    </div>
  ),
};

/* ---------- Home Row Ring Toss ---------- */
const ringtoss: TargetGameConfig = {
  meta: getGame('ringtoss')!,
  mode: 'char',
  pool: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  direction: 'down',
  duration: 60,
  spawnMs: 1300,
  speed: [8, 12],
  maxOnScreen: 5,
  ticketsPerHit: 2,
  rampUp: true,
  arenaClass: 'bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50',
  hitWord: 'Ringers',
  instructions:
    'Rest your fingers on A S D F and J K L ;. Feel the bumps on F and J. Bottles drop with home row letters; press the key to land a ring. Never look down!',
  scenery: (
    <>
      <div className="absolute top-0 inset-x-0 h-6 flex">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className={`flex-1 ${i % 2 ? 'bg-white' : 'bg-rose-500'}`} />
        ))}
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[12%] bg-amber-700 border-t-4 border-amber-900 flex items-center justify-center gap-1">
        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'].map(k => (
          <span
            key={k}
            className={`w-8 h-8 rounded-md bg-amber-50 border-b-4 border-amber-300 font-mono font-black text-amber-950 flex items-center justify-center text-sm ${
              k === 'F' || k === 'J' ? 'underline underline-offset-4' : ''
            }`}
          >
            {k}
          </span>
        ))}
      </div>
    </>
  ),
  renderTarget: t => (
    <div className="flex flex-col items-center">
      <div className="w-3 h-4 bg-emerald-800 rounded-t-sm" />
      <div className="w-14 h-16 rounded-b-xl rounded-t-md bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-emerald-800 shadow-lg flex items-center justify-center font-mono font-black text-3xl text-white">
        {label(t.text)}
      </div>
    </div>
  ),
};

/* ---------- Top Row Ferris Wheel ---------- */
const ferris: TargetGameConfig = {
  meta: getGame('ferris')!,
  mode: 'char',
  pool: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  direction: 'down',
  duration: 60,
  spawnMs: 1300,
  speed: [8, 12],
  maxOnScreen: 5,
  ticketsPerHit: 2,
  rampUp: true,
  arenaClass: 'bg-gradient-to-b from-indigo-400 via-orange-200 to-amber-100',
  hitWord: 'Riders',
  instructions:
    'Ferris wheel carts drop with top row letters: Q W E R T Y U I O P. Reach up with the finger that lives below the key, press it, then return to home row.',
  scenery: (
    <>
      <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border-[10px] border-white/40" />
      <div className="absolute -right-16 -top-16 w-72 h-72 flex items-center justify-center">
        <div className="w-full h-1.5 bg-white/40 absolute" />
        <div className="w-1.5 h-full bg-white/40 absolute" />
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[12%] bg-orange-800/80 border-t-4 border-orange-900 flex items-center justify-center gap-1">
        {'QWERTYUIOP'.split('').map(k => (
          <span key={k} className="w-8 h-8 rounded-md bg-orange-50 border-b-4 border-orange-300 font-mono font-black text-orange-950 flex items-center justify-center text-sm">
            {k}
          </span>
        ))}
      </div>
    </>
  ),
  renderTarget: t => (
    <div className="flex flex-col items-center">
      <div className="w-1 h-5 bg-slate-700" />
      <div
        className={`w-16 h-14 rounded-b-3xl rounded-t-lg border-4 shadow-lg flex items-center justify-center font-mono font-black text-3xl text-white ${CANDY[t.variant]}`}
      >
        {label(t.text)}
      </div>
    </div>
  ),
};

/* ---------- Bottom Row Bumper Cars ---------- */
const bumper: TargetGameConfig = {
  meta: getGame('bumper')!,
  mode: 'char',
  pool: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  direction: 'left',
  lanes: [22, 42, 62, 80],
  duration: 60,
  spawnMs: 1400,
  speed: [11, 16],
  maxOnScreen: 5,
  ticketsPerHit: 2,
  rampUp: true,
  arenaClass: 'bg-slate-700',
  hitWord: 'Bumped',
  instructions:
    'Bumper cars drive in from the right carrying Z X C V B N M. Reach down from home row, press the letter, and bump the car off the track before it hits the wall.',
  scenery: (
    <>
      <div className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-amber-400 to-amber-300 border-r-4 border-amber-600 flex items-center justify-center">
        <span className="text-amber-950 font-black text-xs [writing-mode:vertical-rl]">WALL</span>
      </div>
      {[32, 52, 71].map(y => (
        <div key={y} className="absolute left-[7%] right-0 border-t-2 border-dashed border-yellow-300/50" style={{ top: `${y}%` }} />
      ))}
      <div className="absolute top-0 inset-x-0 h-[10%] bg-slate-900 flex items-center justify-center gap-1">
        {'ZXCVBNM'.split('').map(k => (
          <span key={k} className="w-7 h-7 rounded-md bg-teal-50 border-b-4 border-teal-300 font-mono font-black text-teal-950 flex items-center justify-center text-sm">
            {k}
          </span>
        ))}
      </div>
    </>
  ),
  renderTarget: t => (
    <div
      className={`relative w-24 h-12 rounded-2xl border-4 shadow-xl flex items-center justify-center font-mono font-black text-2xl text-white ${CANDY[t.variant]}`}
    >
      <span className="absolute -bottom-2 left-3 w-4 h-4 rounded-full bg-slate-900" />
      <span className="absolute -bottom-2 right-3 w-4 h-4 rounded-full bg-slate-900" />
      {label(t.text)}
    </div>
  ),
};

/* ---------- Lucky Number Wheel ---------- */
const numbers: TargetGameConfig = {
  meta: getGame('numbers')!,
  mode: 'char',
  pool: '0123456789'.split(''),
  direction: 'up',
  duration: 60,
  spawnMs: 1600,
  speed: [7, 11],
  maxOnScreen: 4,
  ticketsPerHit: 3,
  rampUp: true,
  arenaClass: 'bg-gradient-to-b from-violet-900 via-violet-700 to-fuchsia-500',
  hitWord: 'Caught',
  instructions:
    'Lucky numbers float up from the prize wheel. Find 0 through 9 on the top number row and press it before the number floats off the screen.',
  scenery: (
    <>
      <div className="absolute top-2 inset-x-0 flex justify-around text-xl opacity-70">
        <span>⭐</span>
        <span>✨</span>
        <span>⭐</span>
        <span>✨</span>
        <span>⭐</span>
      </div>
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full border-[12px] border-amber-300 bg-[conic-gradient(#f43f5e_0_12.5%,#facc15_0_25%,#22c55e_0_37.5%,#3b82f6_0_50%,#f43f5e_0_62.5%,#facc15_0_75%,#22c55e_0_87.5%,#3b82f6_0_100%)] opacity-90" />
    </>
  ),
  renderTarget: t => (
    <div className="w-16 h-16 rounded-full bg-amber-300 border-4 border-amber-500 shadow-[0_0_20px_rgba(250,204,21,0.6)] flex items-center justify-center font-display font-black text-3xl text-violet-900">
      {t.text}
    </div>
  ),
};

/* ---------- Cotton Candy Clouds: rising sight words ---------- */
const clouds: TargetGameConfig = {
  meta: getGame('clouds')!,
  mode: 'word',
  pool: [...WORD_BANKS.sight, ...WORD_BANKS.carnival.filter(w => w.length <= 7)],
  direction: 'up',
  duration: 75,
  spawnMs: 2600,
  speed: [4.5, 6.5],
  maxOnScreen: 4,
  ticketsPerHit: 4,
  rampUp: true,
  arenaClass: 'bg-gradient-to-b from-sky-300 via-pink-100 to-pink-200',
  hitWord: 'Grabbed',
  escapeWord: 'Floated',
  instructions:
    'Words drift up on cotton candy clouds. Start typing a word and it lights up. Finish the whole word to grab the cloud before it floats away.',
  scenery: (
    <div className="absolute bottom-0 inset-x-0 h-[10%] bg-gradient-to-t from-pink-400 to-pink-300 border-t-4 border-pink-500" />
  ),
  renderTarget: (t, s) => (
    <div
      className={`px-5 py-3 rounded-full shadow-lg border-4 text-2xl ${
        s.locked ? 'bg-fuchsia-600 border-yellow-300 scale-110' : 'bg-pink-300 border-white'
      } transition-transform`}
    >
      <TypedWord text={t.text} typed={s.typed} done="text-yellow-200" rest={s.locked ? 'text-white' : 'text-fuchsia-950'} />
    </div>
  ),
};

/* ---------- Haunted Funhouse: ghosts drift left toward the lantern ---------- */
const funhouse: TargetGameConfig = {
  meta: getGame('funhouse')!,
  mode: 'word',
  pool: WORD_BANKS.spooky,
  direction: 'left',
  lanes: [22, 40, 58, 75],
  duration: 90,
  lives: 3,
  spawnMs: 2600,
  speed: [5, 7],
  maxOnScreen: 4,
  ticketsPerHit: 4,
  rampUp: true,
  arenaClass: 'bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-900',
  hitWord: 'Ghosts home',
  escapeWord: 'Reached lantern',
  instructions:
    'Friendly ghosts float toward the lantern, each carrying a word. Type the word to send its ghost home. If 3 ghosts reach the lantern, the funhouse closes!',
  scenery: (
    <>
      <div className="absolute top-5 right-10 w-16 h-16 rounded-full bg-yellow-100 shadow-[0_0_40px_rgba(254,249,195,0.7)]" />
      <div className="absolute top-12 left-1/3 text-2xl opacity-60">🦇</div>
      <div className="absolute top-24 right-1/3 text-xl opacity-50">🦇</div>
      <div className="absolute inset-y-0 left-0 w-[9%] flex items-center justify-center">
        <div className="text-5xl drop-shadow-[0_0_18px_rgba(251,146,60,0.9)]">🏮</div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[8%] bg-slate-950 flex items-end justify-around px-6">
        {['🎃', '🪦', '🎃', '🪦', '🎃'].map((e, i) => (
          <span key={i} className="text-2xl -mb-1">
            {e}
          </span>
        ))}
      </div>
    </>
  ),
  renderTarget: (t, s) => (
    <div className="flex flex-col items-center bob">
      <div
        className={`px-3 py-1 rounded-lg border-2 text-xl mb-1 ${
          s.locked ? 'bg-amber-400 border-amber-200' : 'bg-slate-900/90 border-purple-300'
        }`}
      >
        <TypedWord text={t.text} typed={s.typed} done={s.locked ? 'text-slate-900' : 'text-emerald-300'} rest={s.locked ? 'text-slate-900/60' : 'text-white'} />
      </div>
      <div className="text-5xl">👻</div>
    </div>
  ),
};

export const ConfettiCannonGame: React.FC<Props> = ({ onBack }) => <TargetGame config={confetti} onBack={onBack} />;
export const RingTossGame: React.FC<Props> = ({ onBack }) => <TargetGame config={ringtoss} onBack={onBack} />;
export const FerrisWheelGame: React.FC<Props> = ({ onBack }) => <TargetGame config={ferris} onBack={onBack} />;
export const BumperCarsGame: React.FC<Props> = ({ onBack }) => <TargetGame config={bumper} onBack={onBack} />;
export const NumberWheelGame: React.FC<Props> = ({ onBack }) => <TargetGame config={numbers} onBack={onBack} />;
export const CottonCandyCloudsGame: React.FC<Props> = ({ onBack }) => <TargetGame config={clouds} onBack={onBack} />;
export const HauntedFunhouseGame: React.FC<Props> = ({ onBack }) => <TargetGame config={funhouse} onBack={onBack} />;
