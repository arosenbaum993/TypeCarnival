import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BalloonDartGame } from './BalloonDartGame';
import { TicketSprintGame } from './TicketSprintGame';
import { ClawMachineGame } from './ClawMachineGame';
import {
  BumperCarsGame,
  ConfettiCannonGame,
  CottonCandyCloudsGame,
  FerrisWheelGame,
  HauntedFunhouseGame,
  NumberWheelGame,
  RingTossGame,
} from './TargetGames';
import { AlphabetParadeGame } from './AlphabetParadeGame';
import { FortuneMemoryGame } from './FortuneMemoryGame';
import { GoKartRaceGame } from './GoKartRaceGame';
import { SentenceParadeGame } from './SentenceParadeGame';
import { RingmasterChallengeGame } from './RingmasterChallengeGame';
import { ALL_SKILLS, GAMES, GRADE_CHIPS, GameMeta, GameSkill, gradeLabel } from '../../data/games';
import { levelForGrade, TestLevelId } from '../../data/speedTest';
import { getPersonalBest, getPlayCount } from '../../utils/gameStats';
import { ArrowLeft, Play, Search, Star, Clock, Trophy, Timer, ChevronDown } from 'lucide-react';

const GAME_COMPONENTS: Record<string, React.FC<{ onBack: () => void }>> = {
  balloons: BalloonDartGame,
  tickets: TicketSprintGame,
  claw: ClawMachineGame,
  confetti: ConfettiCannonGame,
  parade: AlphabetParadeGame,
  numbers: NumberWheelGame,
  ringtoss: RingTossGame,
  ferris: FerrisWheelGame,
  bumper: BumperCarsGame,
  memory: FortuneMemoryGame,
  clouds: CottonCandyCloudsGame,
  funhouse: HauntedFunhouseGame,
  kart: GoKartRaceGame,
  sentences: SentenceParadeGame,
  ringmaster: RingmasterChallengeGame,
};

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="inline-flex" aria-label={`Difficulty ${n} of 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
    ))}
  </span>
);

const PICK_GUIDE: { grades: string; text: string }[] = [
  { grades: 'Pre-K & K', text: 'Start with letter hunting: Confetti Cannon and Alphabet Parade. No speed pressure.' },
  { grades: '1st & 2nd', text: 'Build the home row habit with Ring Toss, then reach up (Ferris Wheel) and down (Bumper Cars).' },
  { grades: '3rd & 4th', text: 'Move to whole words: Cotton Candy Clouds, Haunted Funhouse, and the Go-Kart race.' },
  { grades: '5th & up', text: 'Push sentences and speed: Sentence Parade and the Ringmaster Challenge.' },
];

export const MinigameHub: React.FC = () => {
  const { setCurrentView, activeMinigame, activeStudent } = useApp();
  const [selectedGame, setSelectedGame] = useState<string | null>(activeMinigame);
  const [grade, setGrade] = useState<TestLevelId | 'all'>('all');
  const [skill, setSkill] = useState<GameSkill | 'all'>('all');
  const [query, setQuery] = useState('');

  const myBand = levelForGrade(activeStudent.grade);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter(g => {
      if (grade !== 'all' && !g.grades.includes(grade)) return false;
      if (skill !== 'all' && !g.skills.includes(skill)) return false;
      if (q && !`${g.name} ${g.tagline} ${g.skills.join(' ')} ${g.seasonal || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [grade, skill, query]);

  const forYou = useMemo(
    () => GAMES.filter(g => g.grades.includes(myBand)).sort((a, b) => a.difficulty - b.difficulty).slice(0, 3),
    [myBand]
  );

  const Game = selectedGame ? GAME_COMPONENTS[selectedGame] : null;
  if (Game) return <Game onBack={() => setSelectedGame(null)} />;

  const card = (g: GameMeta) => {
    const best = getPersonalBest(activeStudent, g.sessionId);
    const plays = getPlayCount(activeStudent, g.sessionId);
    return (
      <div
        key={g.id}
        className={`bg-white rounded-3xl border-2 ${g.border} shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden`}
      >
        <button onClick={() => setSelectedGame(g.id)} className={`relative h-28 ${g.tint} flex items-center justify-center text-6xl`} aria-label={`Play ${g.name}`}>
          <span className="drop-shadow">{g.emoji}</span>
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[75%]">
            {g.grades.map(gr => (
              <span key={gr} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-blue-700">
                {gradeLabel(gr)}
              </span>
            ))}
          </div>
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {g.isNew && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">NEW</span>}
            {g.seasonal && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500 text-white">🎃 {g.seasonal}</span>}
          </div>
        </button>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display text-lg font-black text-amber-950">{g.name}</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed flex-1">{g.tagline}</p>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
            <Stars n={g.difficulty} />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{g.minutes} min
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {g.skills.map(s => (
              <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              {plays > 0 ? (
                <>
                  Best <strong className="font-mono text-slate-800">{best}</strong> · {plays} play{plays === 1 ? '' : 's'}
                </>
              ) : (
                'Not played yet'
              )}
            </span>
            <button
              onClick={() => setSelectedGame(g.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 ${g.button}`}
            >
              <Play className="w-3.5 h-3.5" /> Play
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-amber-200">
        <div>
          <button
            onClick={() => setCurrentView('midway')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Midway Map
          </button>
          <h1 className="font-display text-3xl font-black text-amber-950 flex items-center gap-2">
            <span>🕹️</span> Carnival Arcade Floor
          </h1>
          <p className="text-sm text-slate-600">
            {GAMES.length} typing games sorted by grade and skill. Every game earns tickets for the Prize Booth.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('speedtest')}
          className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
        >
          <Timer className="w-4 h-4" /> Take the Speed Test
        </button>
      </div>

      {/* For you */}
      <div className="bg-amber-950 rounded-3xl p-5 sm:p-6 text-white">
        <div className="text-xs font-black uppercase tracking-wider text-amber-300">
          Picked for {activeStudent.name} · {activeStudent.grade}
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {forYou.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl p-3 text-left transition-colors"
            >
              <span className={`w-12 h-12 rounded-xl ${g.tint} flex items-center justify-center text-2xl shrink-0`}>{g.emoji}</span>
              <span>
                <span className="block font-display font-black">{g.name}</span>
                <span className="block text-[11px] text-amber-100/80">{g.skills.slice(0, 2).join(' · ')}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-amber-200 p-4 sm:p-5 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${GAMES.length} games: try ghost, numbers, home row...`}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 w-12">Grade</span>
          {[{ id: 'all' as const, label: 'All' }, ...GRADE_CHIPS].map(c => (
            <button
              key={c.id}
              onClick={() => setGrade(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                grade === c.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
              } ${c.id === myBand && grade !== c.id ? 'ring-2 ring-amber-300' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 w-12">Skill</span>
          {(['all', ...ALL_SKILLS] as const).map(s => (
            <button
              key={s}
              onClick={() => setSkill(s)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                skill === s ? 'bg-amber-500 border-amber-500 text-amber-950' : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500">
          {filtered.length} game{filtered.length === 1 ? '' : 's'}
          {(grade !== 'all' || skill !== 'all' || query) && (
            <button
              onClick={() => {
                setGrade('all');
                setSkill('all');
                setQuery('');
              }}
              className="ml-2 underline hover:text-slate-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-10">No games match. Try a different grade or skill.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(card)}</div>
      )}

      {/* How to pick + comparison */}
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-amber-200 p-5">
          <h2 className="font-display text-lg font-black text-amber-950 mb-3">How to pick a game</h2>
          <ul className="space-y-2.5">
            {PICK_GUIDE.map(p => (
              <li key={p.grades} className="text-sm text-slate-700">
                <strong className="text-slate-900">{p.grades}:</strong> {p.text}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-4">
            Best routine: a lesson tent first, then a game or two. Take the Speed Test about once a week to see progress.
          </p>
        </div>
        <details className="lg:col-span-3 self-start bg-white rounded-3xl border border-amber-200 p-5 group">
          <summary className="font-display text-lg font-black text-amber-950 cursor-pointer list-none flex items-center justify-between">
            Compare every game
            <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-2">Game</th>
                  <th className="py-2 px-2">Grades</th>
                  <th className="py-2 px-2">Skills</th>
                  <th className="py-2 px-2 text-center">Min</th>
                  <th className="py-2 pl-2 text-center">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {[...GAMES].sort((a, b) => a.difficulty - b.difficulty).map(g => (
                  <tr key={g.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">
                      <button onClick={() => setSelectedGame(g.id)} className="font-bold text-blue-700 hover:underline text-left">
                        {g.emoji} {g.name}
                      </button>
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">{g.grades.map(gradeLabel).join(', ')}</td>
                    <td className="py-2 px-2">{g.skills.join(', ')}</td>
                    <td className="py-2 px-2 text-center font-mono">{g.minutes}</td>
                    <td className="py-2 pl-2 text-center font-mono">{g.difficulty}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
};
