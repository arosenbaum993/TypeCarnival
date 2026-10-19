import React, { useState } from 'react';
import { GradeLevel } from '../../types';
import { X, UserPlus, Check } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, grade: GradeLevel, avatar: string) => void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  // Hides Cancel/close for the first-run screen, where there is nothing to go back to.
  required?: boolean;
}

const AVATAR_OPTIONS = ['🦊', '🦁', '🐯', '🐼', '🐨', '🦄', '🚀', '⭐', '🦖', '🤖'];

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  title = 'Enroll New Student',
  subtitle = 'Add a student to your active class roster',
  submitLabel = 'Add Student',
  required = false,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Grade 3');
  const [avatar, setAvatar] = useState('🦊');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), grade, avatar);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                {title}
              </h2>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          {!required && <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              First Name &amp; Last Initial
            </label>
            <input
              type="text"
              placeholder="e.g. Jordan S."
              maxLength={40}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Grade Level
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                    avatar === emoji
                      ? 'border-amber-500 bg-amber-100 scale-110 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            {!required && <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>}
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
