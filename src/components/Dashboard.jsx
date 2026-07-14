import React from 'react';
import { 
  BookOpen, 
  Flame, 
  Star, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  Zap,
  ClipboardList,
} from 'lucide-react';
import { listGroupsMap } from '../hooks/useVocabState';

export default function Dashboard({ vocab, setView, setSelectedList }) {
  const { progress, stats, getListProgress, dictionaryData } = vocab;
  const lists = Object.keys(dictionaryData);

  const handleListClick = (listKey) => {
    setSelectedList(listKey);
    setView('dictionary');
  };

  const getAccuracy = () => {
    if (stats.totalAnswers === 0) return 0;
    return Math.round((stats.correctAnswers / stats.totalAnswers) * 100);
  };

  const studyTips = [
    {
      title: "Context is King",
      text: "GRE words rarely have one definition. Click any word in the Dictionary to fetch full definitions and read context sentences.",
      icon: BookOpen,
      color: "indigo"
    },
    {
      title: "Sentence Equivalence",
      text: "Look for synonym pairs. The two correct answers must both fit the blank and create sentences of identical meaning.",
      icon: HelpCircle,
      color: "violet"
    },
    {
      title: "Spaced Repetition",
      text: "Use Flashcards daily. Rate your recall honestly to let the repetition engine guide focus toward harder words.",
      icon: Zap,
      color: "amber"
    },
    {
      title: "Active Testing",
      text: "Quizzes force active retrieval. Try Odd Man Out and Match the Following to solidify semantic connections.",
      icon: ClipboardList,
      color: "emerald"
    }
  ];

  const statCards = [
    {
      label: "Overall Mastery",
      value: `${progress.percentComplete}%`,
      sub: `${progress.learned} words`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      extra: (
        <div className="mt-4 space-y-1.5">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-500" style={{ width: `${progress.percentComplete}%` }} />
            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${progress.percentLearning}%` }} />
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Learned</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Learning</span>
          </div>
        </div>
      )
    },
    {
      label: "Daily Streak",
      value: stats.streak,
      sub: "days active",
      icon: Flame,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      iconFill: "fill-orange-500",
      extra: <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">Practice every day to build long-term retention.</p>
    },
    {
      label: "Starred Words",
      value: vocab.starredWords.length,
      sub: "bookmarked",
      icon: Star,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      iconFill: "fill-yellow-400",
      extra: (
        <button
          onClick={() => { setSelectedList('starred'); setView('dictionary'); }}
          className="mt-4 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors group"
        >
          Study starred words
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      )
    },
    {
      label: "Quiz Accuracy",
      value: `${getAccuracy()}%`,
      sub: `${stats.totalQuizzes} quizzes`,
      icon: TrendingUp,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      extra: <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">{stats.correctAnswers} of {stats.totalAnswers} questions correct.</p>
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden border border-slate-700/50">
        {/* decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-slate-300 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/10 mb-4 backdrop-blur-sm">
            <GraduationCap className="w-3.5 h-3.5" />
            GRE Verbal Prep Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-none mb-2.5">
            Master the GRE Vocabulary
          </h1>
          <p className="text-slate-300 text-[13px] leading-relaxed max-w-lg">
            Prepare systematically for Sentence Equivalence, Text Completion, and Reading Comprehension. Track learning progress, test with 5 quiz styles, and explore words by semantic theme.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => setView('flashcards')}
              className="inline-flex items-center gap-2 bg-white text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:bg-slate-100 transition-all btn-press"
            >
              <Zap className="w-4 h-4" />
              Start Flashcards
            </button>
            <button
              onClick={() => setView('quiz')}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-white/15 transition-all btn-press"
            >
              <ClipboardList className="w-4 h-4" />
              Take a Quiz
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 stagger-children">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card animate-fade-in-up p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="form-label block mb-1.5">{card.label}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold tracking-tight text-slate-950">{card.value}</span>
                    <span className="text-xs text-slate-400 font-medium">{card.sub}</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl shrink-0 ${card.iconBg}`}>
                  <Icon className={`w-5 h-5 ${card.iconColor} ${card.iconFill || ''}`} />
                </div>
              </div>
              {card.extra}
            </div>
          );
        })}
      </div>

      {/* ── Word List Progress ── */}
      <div className="card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Word List Progress
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Click any list to study it in the Dictionary.</p>
          </div>
          <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100">
            {lists.length} Lists
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {lists.map((listKey) => {
            const lp = getListProgress(listKey);
            const listNum = listKey.replace('list', '');
            const groupsCount = listGroupsMap[listKey]?.length || 0;
            const isComplete = lp.percent === 100;

            return (
              <button
                key={listKey}
                onClick={() => handleListClick(listKey)}
                className="group text-left p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-200 btn-press space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isComplete && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                    <span className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                      List {listNum}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">{groupsCount} groups</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>

                <div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex mb-1.5">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-300 rounded-full" style={{ width: `${lp.percent}%` }} />
                    <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${lp.total > 0 ? (lp.learning / lp.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{lp.learned} of {lp.total} learned</span>
                    <span className="font-bold text-slate-700">{lp.percent}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Row: Tips + Exam Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Study Strategy */}
        <div className="card lg:col-span-2 p-5 md:p-6">
          <h2 className="section-title flex items-center gap-2 mb-6">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            GRE-Specific Study Strategy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {studyTips.map((tip, idx) => {
              const Icon = tip.icon;
              const colorMap = {
                indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', num: 'bg-indigo-100 text-indigo-700' },
                violet: { bg: 'bg-violet-50', text: 'text-violet-600', num: 'bg-violet-100 text-violet-700' },
                amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  num: 'bg-amber-100 text-amber-700'  },
                emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',num: 'bg-emerald-100 text-emerald-700' },
              };
              const c = colorMap[tip.color];
              return (
                <div key={idx} className="flex gap-3.5">
                  <div className={`p-2 rounded-xl ${c.bg} shrink-0 h-fit mt-0.5`}>
                    <Icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-xs">{tip.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{tip.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam Format */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            Exam Format Reminder
          </h2>
          <div className="space-y-3">
            {[
              {
                title: "Sentence Equivalence",
                body: "Find exactly 2 synonymous words that complete the blank so both sentences have identical meaning."
              },
              {
                title: "Text Completion",
                body: "Choose 1–3 words for corresponding blanks. Analyze context and vocabulary shift signals carefully."
              },
              {
                title: "Reading Comprehension",
                body: "Vocabulary in context often tests nuanced word meanings — knowing themes speeds up passage reading."
              }
            ].map((item, i) => (
              <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
