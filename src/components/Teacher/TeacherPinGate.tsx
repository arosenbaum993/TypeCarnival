import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { checkTeacherPin } from '../../utils/teacherPin';

interface TeacherPinGateProps {
  onUnlock: () => void;
  onCancel: () => void;
}

export const TeacherPinGate: React.FC<TeacherPinGateProps> = ({ onUnlock, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkTeacherPin(pin)) {
      onUnlock();
    } else {
      setError('That PIN is not right. Try again.');
      setPin('');
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl text-center space-y-4"
      >
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto border border-amber-300">
          <Lock className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h1 className="font-display text-xl font-black text-amber-950">Teachers Only</h1>
          <p className="text-xs text-slate-500 mt-1">Enter the teacher PIN to open Teacher Command.</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError('');
          }}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-xl tracking-[0.4em] focus:ring-2 focus:ring-amber-400 outline-none"
          aria-label="Teacher PIN"
        />
        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Back to Midway
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Unlock
          </button>
        </div>
      </form>
    </div>
  );
};
