import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRIZES } from '../data/prizes';
import { PrizeItem } from '../types';
import { Ticket, Sparkles, Check, Lock, Palette } from 'lucide-react';

export const PrizeBooth: React.FC = () => {
  const {
    activeStudent,
    unlockPrize,
    setStudentTheme,
    playPrizeRedeem,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'plushie' | 'theme' | 'badge'>('all');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const filteredPrizes = PRIZES.filter(p => activeCategory === 'all' || p.category === activeCategory);

  const handleBuy = (prize: PrizeItem) => {
    if (activeStudent.unlockedPrizes.includes(prize.id)) {
      if (prize.category === 'theme') {
        setStudentTheme(activeStudent.id, prize.id);
        playPrizeRedeem();
        setPurchaseNotice(`Switched theme to ${prize.name}!`);
        setTimeout(() => setPurchaseNotice(null), 3000);
      }
      return;
    }

    const success = unlockPrize(activeStudent.id, prize.id, prize.cost);
    if (success) {
      setPurchaseNotice(`🎉 Unlocked ${prize.name}!`);
      setTimeout(() => setPurchaseNotice(null), 3500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with generated Prize Booth Art */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-amber-300 bg-amber-950">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/carnival_ticket_booth_1792163244013.jpg"
            alt="Carnival Prize Booth"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-65 mix-blend-luminosity brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-yellow-950 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Carnival Redemption Center
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              The Grand <span className="text-yellow-400">Prize Booth</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-amber-100/90 max-w-xl">
              Spend your hard-earned golden tickets on carnival plushies, custom keyboard themes, and prestige badges!
            </p>
          </div>

          {/* Student Ticket Counter */}
          <div className="bg-yellow-400 text-amber-950 p-4 rounded-2xl shadow-xl flex items-center gap-3 shrink-0 border-2 border-yellow-300">
            <Ticket className="w-8 h-8 text-amber-800" />
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-amber-800">
                Your Tickets
              </div>
              <div className="text-3xl font-black font-mono leading-none">
                {activeStudent.totalTickets}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Notification Banner */}
      {purchaseNotice && (
        <div className="bg-emerald-500 text-white font-bold text-sm px-4 py-3 rounded-2xl text-center shadow-lg animate-bounce flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          {purchaseNotice}
        </div>
      )}

      {/* Category Segmented Tabs (buttons as interactive controls per frontend-design) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-amber-100/70 rounded-2xl w-fit">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-amber-950 text-white shadow-xs'
              : 'text-amber-900 hover:bg-amber-200/60'
          }`}
        >
          All Items ({PRIZES.length})
        </button>
        <button
          onClick={() => setActiveCategory('plushie')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeCategory === 'plushie'
              ? 'bg-amber-950 text-white shadow-xs'
              : 'text-amber-900 hover:bg-amber-200/60'
          }`}
        >
          Plush Toys 🧸
        </button>
        <button
          onClick={() => setActiveCategory('theme')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeCategory === 'theme'
              ? 'bg-amber-950 text-white shadow-xs'
              : 'text-amber-900 hover:bg-amber-200/60'
          }`}
        >
          Keyboard Themes 🎨
        </button>
        <button
          onClick={() => setActiveCategory('badge')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeCategory === 'badge'
              ? 'bg-amber-950 text-white shadow-xs'
              : 'text-amber-900 hover:bg-amber-200/60'
          }`}
        >
          Badges &amp; Hats 🎖️
        </button>
      </div>

      {/* Prizes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPrizes.map((prize) => {
          const isOwned = activeStudent.unlockedPrizes.includes(prize.id);
          const isCurrentTheme = prize.category === 'theme' && activeStudent.activeTheme === prize.id;
          const canAfford = activeStudent.totalTickets >= prize.cost;

          return (
            <div
              key={prize.id}
              className={`rounded-3xl p-6 border-2 flex flex-col justify-between transition-all duration-200 ${
                isOwned
                  ? 'bg-white border-emerald-300 shadow-xs'
                  : canAfford
                  ? 'bg-white border-amber-300 hover:border-amber-400 hover:shadow-lg'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}
            >
              <div>
                {/* Icon Container */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-inner border border-amber-200/60"
                  style={{
                    backgroundColor: prize.previewColor ? `${prize.previewColor}20` : '#fef3c7',
                  }}
                >
                  {prize.icon}
                </div>

                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {prize.category}
                </div>
                <h3 className="font-display text-lg font-bold text-amber-950 mt-0.5">
                  {prize.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {prize.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Price:</span>
                  <span className="flex items-center gap-1 font-mono text-amber-700">
                    <Ticket className="w-3.5 h-3.5 text-amber-500" />
                    {prize.cost === 0 ? 'FREE' : `${prize.cost} Tickets`}
                  </span>
                </div>

                {isOwned ? (
                  prize.category === 'theme' ? (
                    isCurrentTheme ? (
                      <button
                        disabled
                        className="w-full py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                        Active Theme
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(prize)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Palette className="w-4 h-4" />
                        Apply Theme
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      In Collection
                    </button>
                  )
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => handleBuy(prize)}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Need {prize.cost - activeStudent.totalTickets} More
                      </>
                    ) : (
                      <>
                        <Ticket className="w-3.5 h-3.5 text-yellow-800" />
                        Redeem Prize
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
