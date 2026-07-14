import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Zap, 
  ClipboardList, 
  Menu, 
  X, 
  GraduationCap,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useVocabState } from './hooks/useVocabState';
import Dashboard from './components/Dashboard';
import Dictionary from './components/Dictionary';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';

export default function App() {
  const vocab = useVocabState();
  const [view, setView] = useState('dashboard');
  const [selectedList, setSelectedList] = useState('list1');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'dictionary', label: 'Dictionary',   icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards',   icon: Zap },
    { id: 'quiz',       label: 'Quiz Center',  icon: ClipboardList },
  ];

  const handleNavClick = (viewId) => {
    setView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-800 antialiased">

      {/* ── MOBILE HEADER ── */}
      <header className="md:hidden bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-900 text-white rounded-lg shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">
            GRE Vocab Master
          </span>
          {!isOnline && (
            <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-bold uppercase animate-pulse">
              Offline
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors btn-press"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0
        transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
        w-64 flex-shrink-0 bg-white border-r border-slate-200/80
        flex flex-col z-50 md:z-30
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>

        {/* Sidebar inner scroll wrapper */}
        <div className="flex flex-col flex-1 overflow-y-auto p-5 gap-5">

          {/* Logo */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                  GRE Vocab Master
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Verbal Prep Platform</span>
              </div>
            </div>
            {!isOnline && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold animate-pulse shrink-0">
                Offline
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-1.5">
              Navigation
            </span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all duration-150 btn-press text-left
                    ${isActive
                      ? 'bg-slate-900 text-white shadow-sm nav-item-active'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mt-auto space-y-4 border-t border-slate-100 pt-4">
            {/* Daily Streak */}
            <div className="flex items-center justify-between px-1 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="p-1.5 bg-orange-50 rounded-lg">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                </div>
                <span>Daily Streak</span>
              </div>
              <span className="font-bold text-slate-900 text-sm">{vocab.stats.streak}<span className="text-[10px] font-medium text-slate-400 ml-1">days</span></span>
            </div>

            {/* Mastery Progress */}
            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Mastery
                </span>
                <span className="font-bold text-slate-900">{vocab.progress.percentComplete}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${vocab.progress.percentComplete}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{vocab.progress.learned} of {vocab.progress.total} words mastered</p>
            </div>
          </div>

        </div>
      </aside>

      {/* ── MOBILE BACKDROP ── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <div className="flex-1 p-3 md:p-5 lg:p-6 max-w-6xl w-full mx-auto">
          {view === 'dashboard'  && <Dashboard vocab={vocab} setView={setView} setSelectedList={setSelectedList} />}
          {view === 'dictionary' && <Dictionary vocab={vocab} selectedList={selectedList} setSelectedList={setSelectedList} />}
          {view === 'flashcards' && <Flashcards vocab={vocab} />}
          {view === 'quiz'       && <Quiz vocab={vocab} />}
        </div>
      </main>

    </div>
  );
}
