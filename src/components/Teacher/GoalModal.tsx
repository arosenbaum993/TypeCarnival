import React, { useState } from 'react';
import { ClassGoal } from '../../types';
import { X, Target, Check } from 'lucide-react';

interface GoalModalProps {
  goal: ClassGoal;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newGoal: Partial<ClassGoal>) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(goal.title);
  const [targetWpm, setTargetWpm] = useState(goal.targetWpm);
  const [targetAccuracy, setTargetAccuracy] = useState(goal.targetAccuracy);
  const [targetWeeklyMinutes, setTargetWeeklyMinutes] = useState(goal.targetWeeklyMinutes);
  const [targetDate, setTargetDate] = useState(goal.targetDate);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      targetWpm: Number(targetWpm),
      targetAccuracy: Number(targetAccuracy),
      targetWeeklyMinutes: Number(targetWeeklyMinutes),
      targetDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Classroom Target Goals
              </h2>
              <p className="text-xs text-slate-500">Set typing benchmarks for your students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Goal Campaign Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Speed (WPM)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={targetWpm}
                onChange={(e) => setTargetWpm(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:ring-2 focus:ring-amber-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Accuracy (%)
              </label>
              <input
                type="number"
                min="70"
                max="100"
                value={targetAccuracy}
                onChange={(e) => setTargetAccuracy(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:ring-2 focus:ring-amber-400 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Weekly Practice (Min)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={targetWeeklyMinutes}
                onChange={(e) => setTargetWeeklyMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:ring-2 focus:ring-amber-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
