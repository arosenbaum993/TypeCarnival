import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import {
  TEST_LEVELS,
  TestLevelId,
  buildTestText,
  getTestLevel,
  levelForGrade,
  parseSpeedTestLessonId,
  rateResult,
  speedTestLessonId,
} from '../data/speedTest';
import { ArrowLeft, RotateCcw, Ticket, Timer, Trophy, Gauge, Target, Sparkles } from 'lucide-react';

const BAND_STYLES: Record<string, string> = {
  beginning: 'bg-rose-50 border-rose-300 text-rose-900',
  developing: 'bg-amber-50 border-amber-300 text-amber-900',
  'on-track': 'bg-sky-50 border-sky-300 text-sky-900',
  strong: 'bg-emerald-50 border-emerald-300 text-emerald-900',
};

const BAND_LABEL: Record<string, string> = {
  beginning: 'Accuracy first',
  developing: 'Building',
  'on-track': 'On track',
  strong: 'Strong',
};

export const SpeedTest: React.FC = () => {
  const { activeStudent, recordSession, setCurrentView, startAdaptiveDrill } = useApp();

  const [levelId, setLevelId] = useState<TestLevelId>(() => levelForGrade(activeStudent.grade));
  const [minutes, setMinutes] = useState<1 | 3>(1);
  const level = getTestLevel(levelId);
  const durationSec = minutes * 60;

  const [text, setText] = useState(() => buildTestText(level, 900));
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [totalKeys, setTotalKeys] = useState(0);
  const [errorKeys, setErrorKeys] = useState(0);
  const [struggle, setStruggle] = useState<Record<string, number>>({});
  const [ticketsWon, setTicketsWon] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const recordedRef = useRef(false);

  const reset = useCallback(
    (nextLevelId: TestLevelId = levelId, nextMinutes: 1 | 3 = minutes) => {
      setText(buildTestText(getTestLevel(nextLevelId), nextMinutes * 400));
      setInput('');
      setStartTime(null);
      setFinished(false);
      setTotalKeys(0);
      setErrorKeys(0);
      setStruggle({});
      setTicketsWon(0);
      recordedRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [levelId, minutes]
  );

  // Clock
  useEffect(() => {
    if (!startTime || finished) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [startTime, finished]);

  const elapsedSec = startTime ? Math.min((now - startTime) / 1000, durationSec) : 0;
  const timeLeft = Math.max(0, Math.ceil(durationSec - elapsedSec));

  const correctChars = useMemo(() => {
    let c = 0;
    for (let i = 0; i < input.length; i++) if (input[i] === text[i]) c++;
    return c;
  }, [input, text]);

  // Standard WPM: 5 characters = 1 word, and only correct characters count.
  const wpm = startTime ? Math.round(correctChars / 5 / (Math.max(elapsedSec, 3) / 60)) : 0;
  const accuracy = totalKeys > 0 ? Math.round(((totalKeys - errorKeys) / totalKeys) * 100) : 100;

  // Finish when time runs out
  useEffect(() => {
    if (!startTime || finished) return;
    if (elapsedSec >= durationSec) setFinished(true);
  }, [elapsedSec, durationSec, startTime, finished]);

  // Record once at the end
  useEffect(() => {
    if (!finished || recordedRef.current || totalKeys === 0) return;
    recordedRef.current = true;
    const finalWpm = Math.round(correctChars / 5 / minutes);
    const rating = rateResult(level, finalWpm, accuracy);
    const tickets = (minutes === 3 ? 60 : 30) + (rating.band === 'strong' ? 20 : rating.band === 'on-track' ? 10 : 0);
    setTicketsWon(tickets);
    sound.playVictoryFanfare();
    const struggleKeys = Object.entries(struggle)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);
    recordSession(activeStudent.id, {
      lessonId: speedTestLessonId(minutes, levelId),
      lessonTitle: `Speed Test: ${minutes} min, ${level.name} text`,
      wpm: finalWpm,
      accuracy,
      durationSeconds: durationSec,
      ticketsEarned: tickets,
      struggleKeys,
      totalKeystrokes: totalKeys,
      errorKeystrokes: errorKeys,
      score: finalWpm,
    });
  }, [finished, totalKeys, correctChars, minutes, level, accuracy, struggle, recordSession, activeStudent.id, levelId, durationSec, errorKeys]);

  // Keep the current character in view
  useEffect(() => {
    currentCharRef.current?.scrollIntoView({ block: 'nearest' });
  }, [input.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;
    const value = e.target.value.replace(/\n/g, '');
    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
      setNow(Date.now());
    }
    if (value.length > input.length) {
      // Score each new character against the passage at the moment it was typed
      let added = 0;
      let wrong = 0;
      const missed: string[] = [];
      for (let i = input.length; i < value.length; i++) {
        added++;
        if (value[i] !== text[i]) {
          wrong++;
          if (text[i] && text[i] !== ' ') missed.push(text[i].toLowerCase());
        }
      }
      setTotalKeys(t => t + added);
      if (wrong > 0) {
        sound.playKeyError();
        setErrorKeys(n => n + wrong);
        setStruggle(prev => {
          const next = { ...prev };
          missed.forEach(k => (next[k] = (next[k] || 0) + 1));
          return next;
        });
      }
      if (value.length > text.length - 120) {
        setText(t => `${t} ${buildTestText(level, 400)}`);
      }
    }
    setInput(value);
  };

  const myTests = (activeStudent.sessions || []).filter(s => s.lessonId.startsWith('speed-test-')).slice(0, 6);
  const bestTest = myTests.reduce<number>((best, s) => Math.max(best, s.wpm), 0);
  const rating = finished ? rateResult(level, Math.round(correctChars / 5 / minutes), accuracy) : null;
  const finalWpm = Math.round(correctChars / 5 / minutes);
  const topStruggles = Object.entries(struggle)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  // Show a window of text around the cursor
  const windowEnd = Math.min(text.length, input.length + 260);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-amber-200">
        <div>
          <button
            onClick={() => setCurrentView('midway')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Midway Map
          </button>
          <h1 className="font-display text-3xl font-black text-amber-950 flex items-center gap-2">
            <span>⏱️</span> Speed Test Booth
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Pick your level, then start typing. The clock starts on your first key. Only correct letters count toward your
            WPM, so careful beats fast.
          </p>
        </div>
        {bestTest > 0 && (
          <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 px-3 py-2 rounded-xl text-xs font-bold text-amber-900">
            <Trophy className="w-4 h-4 text-amber-600" />
            Your best: <span className="font-mono text-base">{bestTest} WPM</span>
          </div>
        )}
      </div>

      {/* Test card */}
      <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-sm p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Text level">
          {TEST_LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => {
                setLevelId(l.id);
                reset(l.id, minutes);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-colors ${
                l.id === levelId
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-white border-rose-200 text-rose-700 hover:border-rose-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2" role="group" aria-label="Test length">
          {([1, 3] as const).map(m => (
            <button
              key={m}
              onClick={() => {
                setMinutes(m);
                reset(levelId, m);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                m === minutes ? 'bg-amber-500 text-amber-950' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        {finished ? (
          <div className="text-center space-y-4 py-2">
            <div className="text-4xl">🎉</div>
            <h2 className="font-display text-3xl font-black text-amber-950">Time's up!</h2>
            <div className="flex justify-center gap-8">
              <div>
                <div className="font-display text-5xl font-black text-blue-600 tabular-nums">{finalWpm}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">WPM</div>
              </div>
              <div>
                <div className="font-display text-5xl font-black text-emerald-600 tabular-nums">{accuracy}%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Accuracy</div>
              </div>
              <div>
                <div className="font-display text-5xl font-black text-amber-600 tabular-nums flex items-center gap-1">
                  <Ticket className="w-8 h-8" />+{ticketsWon}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tickets</div>
              </div>
            </div>
            {rating && (
              <div className={`max-w-xl mx-auto border-2 rounded-2xl px-4 py-3 text-sm ${BAND_STYLES[rating.band]}`}>
                <div className="font-black uppercase text-xs tracking-wider mb-0.5">{BAND_LABEL[rating.band]}</div>
                {rating.message}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => reset()}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              {topStruggles.length > 0 && (
                <button
                  onClick={() => startAdaptiveDrill(topStruggles)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl font-bold text-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Practice my missed keys ({topStruggles.map(k => k.toUpperCase()).join(' ')})
                </button>
              )}
              <button
                onClick={() => setCurrentView('minigames')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm"
              >
                Play Arcade Games
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="relative h-32 overflow-y-auto bg-slate-50 rounded-2xl p-5 font-mono text-lg sm:text-xl leading-relaxed text-slate-800 select-none"
              onClick={() => inputRef.current?.focus()}
              aria-label="Passage to type"
            >
              {text.slice(0, windowEnd).split('').map((ch, i) => {
                let cls = '';
                if (i < input.length) {
                  cls = input[i] === ch ? 'text-emerald-700' : 'bg-rose-200 text-rose-800 rounded-sm';
                } else if (i === input.length) {
                  cls = 'bg-rose-500 text-white rounded-sm';
                }
                return (
                  <span key={i} ref={i === input.length ? currentCharRef : undefined} className={cls}>
                    {ch}
                  </span>
                );
              })}
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleChange}
              onPaste={e => e.preventDefault()}
              onDrop={e => e.preventDefault()}
              onKeyDown={e => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              placeholder="Start typing here. The timer begins with your first key."
              className="w-full h-28 rounded-2xl border-2 border-slate-200 focus:border-amber-400 outline-none p-4 font-mono text-base resize-none"
              aria-label="Type the passage here"
            />
          </>
        )}

        <div className={`justify-center gap-10 pt-1 ${finished ? 'hidden' : 'flex'}`}>
          <div className="text-center">
            <div className="font-display text-3xl font-black text-blue-600 tabular-nums">{finished ? finalWpm : wpm}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">WPM</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-black text-emerald-600 tabular-nums">{accuracy}%</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-black text-orange-500 tabular-nums">{startTime ? timeLeft : durationSec}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Seconds</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Benchmarks */}
        <div className="md:col-span-3 bg-white rounded-3xl border border-amber-200 p-5 sm:p-6">
          <h2 className="font-display text-xl font-black text-amber-950 flex items-center gap-2 mb-1">
            <Gauge className="w-5 h-5 text-blue-600" /> Typing speed targets by grade
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Accuracy matters more than speed for younger typists. Your selected level is highlighted.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-2">Level</th>
                  <th className="py-2 px-2 text-center">Typical WPM</th>
                  <th className="py-2 px-2 text-center">Strong WPM</th>
                  <th className="py-2 pl-2 text-center">Target accuracy</th>
                </tr>
              </thead>
              <tbody>
                {TEST_LEVELS.map(l => (
                  <tr
                    key={l.id}
                    className={`border-b border-slate-100 ${l.id === levelId ? 'bg-amber-50 font-bold text-amber-950' : 'text-slate-700'}`}
                  >
                    <td className="py-2 pr-2">{l.name}</td>
                    <td className="py-2 px-2 text-center font-mono">
                      {l.avgLow}-{l.avgHigh}
                    </td>
                    <td className="py-2 px-2 text-center font-mono">{l.goodWpm}+</td>
                    <td className="py-2 pl-2 text-center font-mono">{l.targetAccuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong className="text-slate-800">How WPM is counted:</strong> every 5 characters (spaces included) is one
              word, and only correct characters count. Mistakes you leave behind lower your score.
            </p>
            <p>
              <strong className="text-slate-800">How often:</strong> once a week is plenty. Use lessons and arcade games in
              between. On an iPad, attach a keyboard before taking a test you want to compare.
            </p>
          </div>
        </div>

        {/* History */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-amber-200 p-5 sm:p-6">
          <h2 className="font-display text-xl font-black text-amber-950 flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-rose-600" /> {activeStudent.name}'s recent tests
          </h2>
          {myTests.length === 0 ? (
            <p className="text-sm text-slate-500">No tests yet. Your first result will show up here.</p>
          ) : (
            <ul className="space-y-2">
              {myTests.map(s => {
                const parsed = parseSpeedTestLessonId(s.lessonId);
                return (
                  <li key={s.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-800">
                        {parsed ? `${parsed.minutes} min · ${parsed.level.label}` : s.lessonTitle}
                      </div>
                      <div className="text-slate-500">{new Date(s.completedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-blue-600 text-sm">{s.wpm} WPM</div>
                      <div className="text-emerald-700">{s.accuracy}%</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Timer className="w-4 h-4" /> Results are saved and sent to the class gradebook sheet.
          </div>
        </div>
      </div>
    </div>
  );
};
