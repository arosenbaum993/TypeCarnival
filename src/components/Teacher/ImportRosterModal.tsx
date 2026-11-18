import React, { useRef, useState } from 'react';
import { X, Upload, Check, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AVATAR_OPTIONS } from './AddStudentModal';
import {
  MAX_ROSTER_FILE_BYTES,
  RosterPlan,
  SUPPORTED_GRADES,
  parseRosterCsv,
  planRosterImport,
} from '../../utils/rosterImport';

interface ImportRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportRosterModal: React.FC<ImportRosterModalProps> = ({ isOpen, onClose }) => {
  const { students, importStudents } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [plan, setPlan] = useState<RosterPlan | null>(null);
  const [error, setError] = useState('');
  const [addedCount, setAddedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setFileName('');
    setPlan(null);
    setError('');
    setAddedCount(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPlan(null);
    setError('');
    setAddedCount(null);
    if (!file) return;
    setFileName(file.name);
    if (file.size > MAX_ROSTER_FILE_BYTES) {
      setError('That file is too large for a roster. Choose a CSV under 2 MB.');
      return;
    }
    try {
      const text = await file.text();
      setPlan(planRosterImport(parseRosterCsv(text), students));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that file.');
    }
  };

  const handleImport = () => {
    if (!plan || plan.toAdd.length === 0) return;
    const added = importStudents(
      plan.toAdd.map((entry, i) => ({
        name: entry.name,
        grade: entry.grade,
        avatar: AVATAR_OPTIONS[i % AVATAR_OPTIONS.length],
      })),
    );
    setPlan(null);
    setAddedCount(added);
  };

  const perGrade = plan
    ? SUPPORTED_GRADES.map((g) => ({ grade: g, count: plan.toAdd.filter((s) => s.grade === g).length }))
    : [];

  const skippedByReason = plan
    ? Object.entries(
        plan.skipped.reduce<Record<string, string[]>>((acc, s) => {
          (acc[s.reason] = acc[s.reason] || []).push(s.name);
          return acc;
        }, {}),
      ).sort((a, b) => b[1].length - a[1].length)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border-2 border-amber-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Import Roster</h2>
              <p className="text-xs text-slate-500">Add a whole class from a CSV file</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {addedCount !== null ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-sm text-emerald-900">
                <strong>{addedCount} students added</strong> to this device&apos;s roster. They start with 50 tickets
                and the first lesson, like anyone you enroll by hand.
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-xs text-slate-600 space-y-1.5">
              <p>
                The first row needs headings. <strong>Name</strong> and <strong>Grade</strong> are required, and a{' '}
                <strong>Student ID</strong> column is used only to catch repeats. It is never saved in TypeCarnival.
              </p>
              <p>
                Only Grades 2 to 5 are added. Names should be first name and last initial, like{' '}
                <span className="font-mono">Jordan S.</span>
              </p>
            </div>

            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="hidden"
                id="roster-file"
              />
              <label
                htmlFor="roster-file"
                className="cursor-pointer w-full py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                {fileName ? 'Choose a different file' : 'Choose CSV file'}
              </label>
              {fileName && <p className="text-xs text-slate-500 mt-2 truncate">Selected: {fileName}</p>}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {plan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                    <div className="font-mono text-2xl font-black text-emerald-700 tabular-nums">{plan.toAdd.length}</div>
                    <div className="text-xs text-emerald-900">will be added</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <div className="font-mono text-2xl font-black text-slate-700 tabular-nums">{plan.skipped.length}</div>
                    <div className="text-xs text-slate-600">skipped</div>
                  </div>
                </div>

                {plan.toAdd.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {perGrade.map((g) => (
                      <span
                        key={g.grade}
                        className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold tabular-nums"
                      >
                        {g.grade}: {g.count}
                      </span>
                    ))}
                  </div>
                )}

                {skippedByReason.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Skipped</div>
                    {skippedByReason.map(([reason, names]) => (
                      <details key={reason} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                        <summary className="cursor-pointer font-medium text-slate-800">
                          {names.length} &middot; {reason}
                        </summary>
                        <p className="mt-2 text-slate-500 leading-relaxed">
                          {names.slice(0, 60).join(', ')}
                          {names.length > 60 ? `, and ${names.length - 60} more` : ''}
                        </p>
                      </details>
                    ))}
                  </div>
                )}

                {plan.toAdd.length === 0 && (
                  <p className="text-xs text-slate-600">Nothing in this file can be added to this device.</p>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!plan || plan.toAdd.length === 0}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {plan && plan.toAdd.length > 0 ? `Import ${plan.toAdd.length} students` : 'Import'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
