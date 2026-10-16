import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BalloonDartGame } from './BalloonDartGame';
import { TicketSprintGame } from './TicketSprintGame';
import { ClawMachineGame } from './ClawMachineGame';
import { MinigameType } from '../../types';
import { Ticket, Play, ArrowLeft, Sparkles, Gamepad2 } from 'lucide-react';

export const MinigameHub: React.FC = () => {
  const { currentView, setCurrentView, activeMinigame, startMinigame } = useApp();
  const [selectedGame, setSelectedGame] = useState<MinigameType | null>(activeMinigame);

  if (selectedGame === 'balloons') {
    return <BalloonDartGame onBack={() => setSelectedGame(null)} />;
  }
  if (selectedGame === 'tickets') {
    return <TicketSprintGame onBack={() => setSelectedGame(null)} />;
  }
  if (selectedGame === 'claw') {
    return <ClawMachineGame onBack={() => setSelectedGame(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
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
          <p className="text-xs text-slate-500">
            Put your finger speed to the test with arcade mini-games and rack up tickets!
          </p>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game 1: Balloon Dart Pop */}
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-rose-200">
              🎈
            </div>
            <div className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
              Single-Key Reaction
            </div>
            <h2 className="font-display text-xl font-bold text-amber-950 mt-1">
              Balloon Dart Pop
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Target floating letter balloons before they escape into the sky. Great for honing quick single-finger reflexes!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
              <Ticket className="w-4 h-4 text-amber-500" />
              +5 to 50 Tickets
            </span>
            <button
              onClick={() => setSelectedGame('balloons')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Play
            </button>
          </div>
        </div>

        {/* Game 2: Ticket Roller Sprint */}
        <div className="bg-white rounded-3xl p-6 border-2 border-yellow-400 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-yellow-300">
              🎟️
            </div>
            <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              Word Speed &amp; Rhythm
            </div>
            <h2 className="font-display text-xl font-bold text-amber-950 mt-1">
              Ticket Roller Sprint
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Type full carnival words to crank tickets out of the dispenser in a 60-second burst. Perfect for typing stamina!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
              <Ticket className="w-4 h-4 text-amber-500" />
              +8 Tickets/Word
            </span>
            <button
              onClick={() => setSelectedGame('tickets')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Play
            </button>
          </div>
        </div>

        {/* Game 3: Claw Machine Word Grab */}
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-indigo-200">
              🧸
            </div>
            <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
              Precision &amp; Prizes
            </div>
            <h2 className="font-display text-xl font-bold text-amber-950 mt-1">
              Claw Machine Word Grab
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Type target words with zero errors to trigger the mechanical claw and rescue adorable plushies for your collection!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
              <Ticket className="w-4 h-4 text-amber-500" />
              +25 Tickets/Plush
            </span>
            <button
              onClick={() => setSelectedGame('claw')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
