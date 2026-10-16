import React from 'react';
import { Student } from '../../types';
import { X, Calendar, Clock, Award, AlertCircle, ArrowUpRight } from 'lucide-react';
import { KEYBOARD_ROWS } from '../../utils/keyboardData';

interface StudentDrawerProps {
  student: Student | null;
  onClose: () => void;
  onSwitchToStudent: (studentId: string) => void;
}

export const StudentDrawer: React.FC<StudentDrawerProps> = ({
  student,
  onClose,
  onSwitchToStudent,
}) => {
  if (!student) return null;

  // Calculate student averages
  const totalSessions = student.sessions.length;
  const avgWpm = totalSessions > 0
    ? Math.round(student.sessions.reduce((sum, s) => sum + s.wpm, 0) / totalSessions)
    : 0;
  const avgAccuracy = totalSessions > 0
    ? Math.round(student.sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions)
    : 0;
  const totalMinutes = Math.round(
    student.sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  );

  // Aggregate struggle keys frequency
  const struggleCounts: Record<string, number> = {};
  (student.sessions || []).forEach(s => {
    (s.struggleKeys || []).forEach(k => {
      const lower = k.toLowerCase();
      struggleCounts[lower] = (struggleCounts[lower] || 0) + 1;
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-4xl bg-amber-100 p-2 rounded-2xl border border-amber-300">
                {student.avatar}
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {student.name}
                </h2>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {student.grade}
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    🔥 {student.dailyStreak || 1}d Streak
                  </span>
                  <span>·</span>
                  <span>Last active: {student.lastActive}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Avg Speed</span>
              <div className="font-mono text-lg font-black text-blue-600 mt-1 tabular-nums">
                {avgWpm} <span className="text-xs font-normal">WPM</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
              <div className="font-mono text-lg font-black text-emerald-600 mt-1 tabular-nums">
                {avgAccuracy}%
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Practice</span>
              <div className="font-mono text-lg font-black text-purple-600 mt-1 tabular-nums">
                {totalMinutes} <span className="text-xs font-normal">min</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tickets</span>
              <div className="font-mono text-lg font-black text-amber-600 mt-1 tabular-nums">
                {student.totalTickets}
              </div>
            </div>
          </div>

          {/* Individual Error Heatmap Visual */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Keyboard Error Diagnostic Heatmap
              </h3>
              <span className="text-[11px] text-slate-500">
                Darker red = higher miss frequency
              </span>
            </div>

            {/* Mini Keyboard Layout Showing Heatmap */}
            <div className="p-2.5 bg-slate-900 rounded-xl overflow-x-auto">
              <div className="flex flex-col gap-1 min-w-[340px]">
                {KEYBOARD_ROWS.slice(1, 4).map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1">
                    {row.map((k) => {
                      const count = struggleCounts[k.key.toLowerCase()] || 0;
                      let heatClass = 'bg-slate-800 text-slate-300 border-slate-700';
                      if (count >= 3) {
                        heatClass = 'bg-rose-600 text-white font-bold border-rose-400 animate-pulse';
                      } else if (count >= 1) {
                        heatClass = 'bg-amber-500 text-slate-950 font-bold border-amber-300';
                      }

                      return (
                        <div
                          key={k.key}
                          title={`${k.key.toUpperCase()}: ${count} misses`}
                          className={`w-7 h-7 rounded text-[11px] font-mono flex items-center justify-center border ${heatClass}`}
                        >
                          {k.key.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-700">Top Focus Keys:</span>
              {Object.keys(struggleCounts).length === 0 ? (
                <span className="text-emerald-700 italic">No significant errors recorded!</span>
              ) : (
                Object.entries(struggleCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([k, count]) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 bg-white border border-rose-300 text-rose-800 rounded font-mono font-bold text-[11px]"
                    >
                      {k.toUpperCase()} ({count}×)
                    </span>
                  ))
              )}
            </div>
          </div>

          {/* Session History Log */}
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Typing Sessions ({student.sessions.length})
            </h3>

            {student.sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No sessions completed yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {student.sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{sess.lessonTitle}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(sess.completedAt).toLocaleDateString()} · {Math.round(sess.durationSeconds)}s
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="font-mono font-bold text-blue-600">{sess.wpm} WPM</span>
                        <div className="text-[11px] font-mono text-emerald-600">{sess.accuracy}% Acc</div>
                      </div>
                      <div className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        +{sess.ticketsEarned}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 mt-6 flex gap-3">
          <button
            onClick={() => {
              onSwitchToStudent(student.id);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            Switch to Student View
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
