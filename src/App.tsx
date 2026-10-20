import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MidwayMap } from './components/MidwayMap';
import { TypingArena } from './components/TypingArena';
import { MinigameHub } from './components/Minigames/MinigameHub';
import { PrizeBooth } from './components/PrizeBooth';
import { SpeedTest } from './components/SpeedTest';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';
import { TeacherPinGate } from './components/Teacher/TeacherPinGate';
import { AddStudentModal } from './components/Teacher/AddStudentModal';
import { RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'An unexpected error occurred' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TypeCarnival Error caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    if (!window.confirm('This erases every student\'s tickets and progress saved on this device. Continue?')) return;
    try {
      localStorage.removeItem('typecarnival_students_v3');
      localStorage.removeItem('typecarnival_goal_v3');
      localStorage.removeItem('typecarnival_active_student_v3');
      localStorage.removeItem('typecarnival_sound_muted');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border-4 border-amber-400 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-amber-300">
              🎪
            </div>
            <h1 className="font-display text-2xl font-black text-amber-950 uppercase tracking-tight">
              TypeCarnival Refresh
            </h1>
            <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
              We encountered a bump on the midway track. Click below to reload the carnival. Your tickets and progress are still saved.
            </p>
            {this.state.errorMessage && (
              <div className="mb-6 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-mono text-rose-800 text-left overflow-x-auto">
                {this.state.errorMessage}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Carnival
            </button>
            <button
              onClick={this.handleReset}
              className="mt-3 text-[11px] text-slate-400 hover:text-rose-600 underline"
            >
              Still broken? Teachers: clear saved data on this device
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mounted only while Teacher Command is open, so leaving it locks it again.
const TeacherArea: React.FC = () => {
  const { setCurrentView } = useApp();
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <TeacherPinGate onUnlock={() => setUnlocked(true)} onCancel={() => setCurrentView('midway')} />;
  }
  return <TeacherDashboard />;
};

const MainContent: React.FC = () => {
  const { currentView, students, addStudent } = useApp();

  if (currentView === 'teacher') {
    return (
      <main className="flex-1">
        <TeacherArea />
      </main>
    );
  }

  if (students.length === 0) {
    return (
      <main className="flex-1">
        <AddStudentModal
          isOpen
          required
          onClose={() => {}}
          onAdd={addStudent}
          title="Welcome to TypeCarnival!"
          subtitle="Type your name to make your typist"
          submitLabel="Let's Go!"
        />
      </main>
    );
  }

  return (
    <main className="flex-1">
      {currentView === 'midway' && <MidwayMap />}
      {currentView === 'lesson' && <TypingArena />}
      {currentView === 'minigames' && <MinigameHub />}
      {currentView === 'prizes' && <PrizeBooth />}
      {currentView === 'speedtest' && <SpeedTest />}
    </main>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-slate-800 selection:bg-amber-300 selection:text-amber-950">
          <Navbar />
          <MainContent />
          <footer className="py-6 border-t border-amber-200/80 bg-white/60 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-medium">
                TypeCarnival · Keyboarding &amp; Diagnostics for Elementary Classrooms (Grades 2–5)
              </span>
              <span className="text-slate-400">
                Designed for classroom Chromebooks &amp; desktop keyboards
              </span>
            </div>
          </footer>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}
