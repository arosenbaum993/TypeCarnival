import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, Student } from '../../types';
import { StudentDrawer } from './StudentDrawer';
import { GoalModal } from './GoalModal';
import { AddStudentModal } from './AddStudentModal';
import { LESSONS } from '../../data/lessons';
import { setTeacherPin } from '../../utils/teacherPin';
import { postToSheet } from '../../utils/sheetsSync';
import {
  Download,
  Plus,
  RotateCcw,
  Search,
  Target,
  GraduationCap,
  Users,
  Gauge,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Trash2,
  KeyRound,
  Sheet,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    students,
    classGoal,
    updateClassGoal,
    addStudent,
    clearRoster,
    removeStudent,
    setActiveStudentId,
    setCurrentView,
  } = useApp();

  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGrade && matchesSearch;
    });
  }, [students, selectedGrade, searchQuery]);

  // Aggregate class statistics
  const stats = useMemo(() => {
    const list = filteredStudents;
    const count = list.length;
    if (count === 0) {
      return { avgWpm: 0, avgAccuracy: 0, totalMinutes: 0, classStruggleKeys: [] };
    }

    let totalWpm = 0;
    let totalAcc = 0;
    let totalSecs = 0;
    let validSessionCount = 0;
    const struggleFreq: Record<string, number> = {};

    list.forEach((st) => {
      (st.sessions || []).forEach((sess) => {
        totalWpm += sess.wpm || 0;
        totalAcc += sess.accuracy || 0;
        totalSecs += sess.durationSeconds || 0;
        validSessionCount += 1;

        (sess.struggleKeys || []).forEach((k) => {
          const lower = k.toLowerCase();
          struggleFreq[lower] = (struggleFreq[lower] || 0) + 1;
        });
      });
    });

    const avgWpm = validSessionCount > 0 ? Math.round(totalWpm / validSessionCount) : 0;
    const avgAccuracy = validSessionCount > 0 ? Math.round(totalAcc / validSessionCount) : 0;
    const totalMinutes = Math.round(totalSecs / 60);

    const sortedStruggle = Object.entries(struggleFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      avgWpm,
      avgAccuracy,
      totalMinutes,
      classStruggleKeys: sortedStruggle,
    };
  }, [filteredStudents]);

  // Goal progress percentage based on target WPM & accuracy
  const goalProgress = useMemo(() => {
    if (stats.avgWpm === 0) return 0;
    const wpmRatio = Math.min(stats.avgWpm / classGoal.targetWpm, 1);
    const accRatio = Math.min(stats.avgAccuracy / classGoal.targetAccuracy, 1);
    return Math.round(((wpmRatio + accRatio) / 2) * 100);
  }, [stats.avgWpm, stats.avgAccuracy, classGoal.targetWpm, classGoal.targetAccuracy]);

  // CSV Report Generator (RFC 4180 compliant)
  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Grade',
      'Daily Streak (Days)',
      'Current Level',
      'Average WPM',
      'Average Accuracy (%)',
      'Sessions Completed',
      'Total Practice Time (Minutes)',
      'Total Tickets Won',
      'Top Struggle Keys',
      'Last Active Date',
    ];

    const rows = filteredStudents.map((st) => {
      const sessCount = st.sessions.length;
      const stAvgWpm = sessCount > 0 ? Math.round(st.sessions.reduce((a, b) => a + b.wpm, 0) / sessCount) : 0;
      const stAvgAcc = sessCount > 0 ? Math.round(st.sessions.reduce((a, b) => a + b.accuracy, 0) / sessCount) : 0;
      const stMinutes = Math.round(st.sessions.reduce((a, b) => a + b.durationSeconds, 0) / 60);

      // Extract unique struggle keys
      const stStruggles = Array.from(new Set(st.sessions.flatMap((s) => s.struggleKeys)))
        .map((k) => (k === ' ' ? 'SPACE' : k.toUpperCase()))
        .join('; ');

      const currentLesson = LESSONS.find((l) => l.id === st.currentLevelId)?.title || 'Tent 1: Home Row Anchor';

      return [
        `"${st.name.replace(/"/g, '""')}"`,
        `"${st.grade}"`,
        st.dailyStreak || 1,
        `"${currentLesson.replace(/"/g, '""')}"`,
        stAvgWpm,
        stAvgAcc,
        sessCount,
        stMinutes,
        st.totalTickets,
        `"${stStruggles}"`,
        `"${st.lastActive}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TypeCarnival_Class_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRemoveStudent = (student: Student) => {
    if (window.confirm(`Remove ${student.name} and all of their progress from this device? This cannot be undone.`)) {
      removeStudent(student.id);
    }
  };

  const handleChangePin = async () => {
    const pin = window.prompt('Enter a new teacher PIN for this device (4 to 12 digits):');
    if (pin === null) return;
    if (!/^\d{4,12}$/.test(pin.trim())) {
      window.alert('PIN must be 4 to 12 digits. Your PIN was not changed.');
      return;
    }
    if (window.prompt('Type the new PIN again to confirm:') !== pin) {
      window.alert('The PINs did not match. Your PIN was not changed.');
      return;
    }
    setTeacherPin(pin);
    window.alert('Teacher PIN updated on this device.');
  };

  const handleTestSync = () => {
    postToSheet({
      timestamp: new Date().toISOString(),
      studentName: 'TEST ROW (delete me)',
      grade: '',
      activity: 'Sheet connection test',
      wpm: '',
      accuracy: '',
      durationSeconds: '',
      ticketsEarned: '',
      struggleKeys: '',
      passed: '',
    });
    window.alert('Test row sent. Open your Google Sheet: a row named "TEST ROW (delete me)" should appear within a few seconds.');
  };

  const handleSwitchToStudent = (studentId: string) => {
    setActiveStudentId(studentId);
    setCurrentView('midway');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            Classroom Educator Portal
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-amber-950">
            Teacher Command &amp; Performance Center
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time elementary keyboarding metrics, track classroom benchmarks, and export gradebook reports.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Enroll Student
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Download CSV performance records for gradebook or parent reports"
          >
            <Download className="w-4 h-4" />
            Export CSV Report
          </button>
          <button
            onClick={handleTestSync}
            className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Send a test row to the class Google Sheet"
          >
            <Sheet className="w-4 h-4" />
            Test Sheet Sync
          </button>
          <button
            onClick={handleChangePin}
            className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl border border-slate-200 transition-colors"
            title="Change Teacher PIN"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Remove ALL students and their progress from this device? This cannot be undone.')) {
                clearRoster();
              }
            }}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
            title="Clear Roster on This Device"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Enrolled */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Students</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-900 tabular-nums">
              {filteredStudents.length}
            </span>
            <span className="text-xs text-slate-500">enrolled in view</span>
          </div>
        </div>

        {/* Metric 2: Average Class Speed */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Class Average WPM</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-blue-600 tabular-nums">
              {stats.avgWpm}
            </span>
            <span className="text-xs text-slate-500">
              target: <strong className="font-mono text-slate-800">{classGoal.targetWpm} WPM</strong>
            </span>
          </div>
        </div>

        {/* Metric 3: Average Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Class Accuracy</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-emerald-600 tabular-nums">
              {stats.avgAccuracy}%
            </span>
            <span className="text-xs text-slate-500">
              benchmark: <strong className="font-mono text-slate-800">{classGoal.targetAccuracy}%</strong>
            </span>
          </div>
        </div>

        {/* Metric 4: Goal Progress Thermometer */}
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-300 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-600" />
              Class Goal Met
            </span>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
            >
              Edit Goal
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono text-3xl font-black text-amber-950 tabular-nums">
              {goalProgress}%
            </span>
            <span className="text-xs text-amber-800 truncate">{classGoal.title}</span>
          </div>
          {/* Visual Thermometer Bar */}
          <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Classroom Struggle Keys Diagnostic Strip */}
      <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="font-display text-sm font-bold text-slate-900">
              Classroom Direct Instruction Focus: Struggle Keys
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Based on error keystrokes aggregated across student practice sessions
          </span>
        </div>

        {stats.classStruggleKeys.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No significant student error patterns recorded yet.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {stats.classStruggleKeys.map(([key, count]) => (
              <div
                key={key}
                className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-xs"
              >
                <kbd className="px-2 py-0.5 bg-white border border-rose-300 rounded font-mono font-bold text-rose-800 shadow-2xs text-sm uppercase">
                  {key === ' ' ? 'SPACE' : key}
                </kbd>
                <span className="text-rose-900 font-medium">
                  {count} errors recorded
                </span>
              </div>
            ))}
            <div className="text-xs text-slate-500 ml-auto">
              Suggested: Assign <em>Midway Booster</em> or focus finger drills on these keys.
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Grade Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-amber-100/70 rounded-xl">
          {['all', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                selectedGrade === grade
                  ? 'bg-amber-950 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              {grade === 'all' ? 'All Grades' : grade}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
      </div>

      {/* Student Roster Table (High Density SaaS discipline) */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-50/70 border-b border-amber-200/80 text-[11px] font-bold text-amber-950 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-3">Grade</th>
                <th className="py-3.5 px-3">Current Lesson</th>
                <th className="py-3.5 px-3 text-right">Avg Speed</th>
                <th className="py-3.5 px-3 text-right">Accuracy</th>
                <th className="py-3.5 px-3 text-right">Sessions</th>
                <th className="py-3.5 px-3 text-right">Practice</th>
                <th className="py-3.5 px-3 text-right">Tickets</th>
                <th className="py-3.5 px-4 text-center">Struggle Keys</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No students match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const sessCount = student.sessions.length;
                  const stAvgWpm = sessCount > 0 ? Math.round(student.sessions.reduce((a, b) => a + b.wpm, 0) / sessCount) : 0;
                  const stAvgAcc = sessCount > 0 ? Math.round(student.sessions.reduce((a, b) => a + b.accuracy, 0) / sessCount) : 0;
                  const stMinutes = Math.round(student.sessions.reduce((a, b) => a + b.durationSeconds, 0) / 60);

                  const uniqueStruggles = Array.from(
                    new Set(student.sessions.flatMap((s) => s.struggleKeys))
                  ).slice(0, 3);

                  const currentLesson = LESSONS.find((l) => l.id === student.currentLevelId)?.title || 'Tent 1: Home Row Anchor';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{student.avatar}</span>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{student.name}</span>
                              <span
                                className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                                title={`${student.dailyStreak || 1}-day practice streak`}
                              >
                                🔥 {student.dailyStreak || 1}d
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Active: {student.lastActive}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-3">
                        <span className="text-slate-600 font-semibold">{student.grade}</span>
                      </td>

                      {/* Current Lesson */}
                      <td className="py-3 px-3 max-w-[180px] truncate text-slate-700" title={currentLesson}>
                        {currentLesson}
                      </td>

                      {/* WPM */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-blue-600 tabular-nums">
                          {stAvgWpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            stAvgAcc >= 90 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {stAvgAcc}%
                        </span>
                      </td>

                      {/* Sessions */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {sessCount}
                      </td>

                      {/* Minutes */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {stMinutes}m
                      </td>

                      {/* Tickets */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                        {student.totalTickets}
                      </td>

                      {/* Struggle Keys */}
                      <td className="py-3 px-4 text-center">
                        {uniqueStruggles.length === 0 ? (
                          <span className="text-[11px] text-emerald-600 font-semibold">None</span>
                        ) : (
                          <div className="flex justify-center gap-1">
                            {uniqueStruggles.map((k) => (
                              <kbd
                                key={k}
                                className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded font-mono text-[10px] uppercase font-bold"
                              >
                                {k === ' ' ? 'SPC' : k}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectedStudent(student)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            Diagnostics
                          </button>
                          <button
                            onClick={() => handleSwitchToStudent(student.id)}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap"
                            title="Switch view to this student"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
                            View
                          </button>
                          <button
                            onClick={() => handleRemoveStudent(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={`Remove ${student.name}`}
                            aria-label={`Remove ${student.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Diagnostic Drawer */}
      <StudentDrawer
        student={inspectedStudent}
        onClose={() => setInspectedStudent(null)}
        onSwitchToStudent={handleSwitchToStudent}
      />

      <GoalModal
        goal={classGoal}
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={updateClassGoal}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAdd={addStudent}
      />
    </div>
  );
};
