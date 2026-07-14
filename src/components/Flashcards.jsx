import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  Volume2, 
  RotateCw, 
  Award, 
  Filter, 
  ArrowRight,
  RefreshCw,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { getThemeName, getSentenceTemplate } from '../data/sentenceTemplates';
import { uniqueWords, listGroupsMap, groupWordsMap } from '../hooks/useVocabState';

export default function Flashcards({ vocab }) {
  const { wordStatus, starredWords, setWordStatus, toggleStarred, getWordDetails, dictionaryData } = vocab;

  const [selectedLists, setSelectedLists] = useState(['list1']);
  const [filterStarred,  setFilterStarred]  = useState(false);
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [cardOrder,      setCardOrder]      = useState('random');
  const [deck,           setDeck]           = useState([]);
  const [currentIdx,     setCurrentIdx]     = useState(0);
  const [isFlipped,      setIsFlipped]      = useState(false);
  const [deckHistory,    setDeckHistory]    = useState([]);
  const [isConfigMode,   setIsConfigMode]   = useState(true);
  const [activeDetails,  setActiveDetails]  = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const audioRef = useRef(null);
  const allLists = Object.keys(dictionaryData);

  // Keyboard shortcuts
  useEffect(() => {
    if (isConfigMode || deck.length === 0 || currentIdx >= deck.length) return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setIsFlipped(p => !p); }
      else if (isFlipped) {
        if (e.key === '1') handleGrade('hard');
        else if (e.key === '2') handleGrade('medium');
        else if (e.key === '3') handleGrade('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfigMode, deck, currentIdx, isFlipped]);

  // Load current card details
  useEffect(() => {
    if (isConfigMode || deck.length === 0 || currentIdx >= deck.length) { setActiveDetails(null); return; }
    const card = deck[currentIdx];
    setLoadingDetails(true);
    getWordDetails(card.word)
      .then(d => { setActiveDetails(d); setLoadingDetails(false); })
      .catch(() => { setActiveDetails(null); setLoadingDetails(false); });
  }, [deck, currentIdx, isConfigMode, getWordDetails]);

  const handleToggleList = (k) =>
    setSelectedLists(prev => prev.includes(k) ? (prev.length === 1 ? prev : prev.filter(x => x !== k)) : [...prev, k]);

  const handleSelectAllLists = () => {
    const all = Object.keys(dictionaryData);
    setSelectedLists(selectedLists.length === all.length ? ['list1'] : all);
  };

  const buildDeck = () => {
    let pool = [];
    selectedLists.forEach(lk => {
      (listGroupsMap[lk] || []).forEach(gk => {
        (groupWordsMap[gk] || []).forEach(w => pool.push({ word: w, list: lk, group: gk }));
      });
    });
    if (filterStarred) pool = pool.filter(i => starredWords.includes(i.word.toLowerCase()));
    if (statusFilter === 'not_started') pool = pool.filter(i => !wordStatus[i.word.toLowerCase()] || wordStatus[i.word.toLowerCase()] === 'not_started');
    if (statusFilter === 'learning')    pool = pool.filter(i => wordStatus[i.word.toLowerCase()] === 'learning');
    
    const seen = new Set();
    const unique = [];
    pool.forEach(i => { const c = i.word.toLowerCase(); if (!seen.has(c)) { seen.add(c); unique.push(i); } });

    if (unique.length === 0) { alert('No words match the selected criteria.'); return; }
    if (cardOrder === 'random') for (let i = unique.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [unique[i], unique[j]] = [unique[j], unique[i]]; }

    setDeck(unique); setCurrentIdx(0); setIsFlipped(false); setDeckHistory([]); setIsConfigMode(false);
  };

  const handleGrade = (grade) => {
    const card = deck[currentIdx];
    setWordStatus(card.word, grade === 'easy' ? 'learned' : 'learning');
    setDeckHistory(p => [...p, { word: card.word, grade }]);
    if (grade === 'hard') {
      setDeck(prev => {
        const d = [...prev];
        const remaining = d.length - currentIdx - 1;
        const offset = Math.min(4, remaining);
        if (offset > 0) d.splice(currentIdx + 1 + offset, 0, d[currentIdx]);
        else d.push(d[currentIdx]);
        return d;
      });
    }
    setIsFlipped(false);
    setCurrentIdx(p => p + 1);
  };

  const handlePlayAudio = (e) => {
    e.stopPropagation();
    if (audioRef.current) audioRef.current.play().catch(err => console.error(err));
  };

  const activeCard = deck[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">

      {/* ── Header ── */}
      <div className="card flex items-center justify-between px-5 py-3.5 gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            Spaced Repetition Flashcards
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 ml-9">Grade your recall dynamically to solidify GRE terms.</p>
        </div>
        {!isConfigMode && (
          <button
            onClick={() => { setIsConfigMode(true); setDeck([]); setCurrentIdx(0); }}
            className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-100 transition-colors btn-press shrink-0"
          >
            Configure
          </button>
        )}
      </div>

      {/* ── Configuration ── */}
      {isConfigMode ? (
        <div className="card p-5 md:p-6 space-y-5 animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="section-title flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              Configure Study Deck
            </h2>
          </div>

          <div className="space-y-4">
            {/* List Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="form-label">Word Lists</label>
                <button onClick={handleSelectAllLists} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  {selectedLists.length === allLists.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-1.5">
                {allLists.map(k => (
                  <button
                    key={k}
                    onClick={() => handleToggleList(k)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all btn-press ${
                      selectedLists.includes(k)
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {k.replace('list', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="form-label block">Study Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                >
                  <option value="all">All Words</option>
                  <option value="not_started">Not Started Only</option>
                  <option value="learning">Learning Only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="form-label block">Card Order</label>
                <div className="flex gap-1.5">
                  {['random', 'sequential'].map(o => (
                    <button
                      key={o}
                      onClick={() => setCardOrder(o)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all btn-press capitalize ${
                        cardOrder === o
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Starred toggle */}
            <label className="flex items-center gap-3.5 cursor-pointer bg-slate-50 hover:bg-slate-100/50 p-3 rounded-xl border border-slate-100 transition-colors">
              <div
                onClick={() => setFilterStarred(!filterStarred)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${filterStarred ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${filterStarred ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Starred Words Only</span>
                <span className="text-[11px] text-slate-400">Limit to {starredWords.length} bookmarked words.</span>
              </div>
            </label>
          </div>

          <button
            onClick={buildDeck}
            className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition-all btn-press flex items-center justify-center gap-2"
          >
            Start Practice Deck
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      ) : deck.length === 0 ? (
        <div className="card p-8 text-center space-y-4">
          <p className="text-xs text-slate-500">No words match the selected filters.</p>
          <button onClick={() => setIsConfigMode(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold btn-press">Change Settings</button>
        </div>

      ) : currentIdx < deck.length ? (
        /* ── Active Practice ── */
        <div className="space-y-4 animate-scale-in">

          {/* Progress bar */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(currentIdx / deck.length) * 100}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">{currentIdx + 1} / {deck.length}</span>
          </div>

          {/* 3D Card */}
          <div onClick={() => setIsFlipped(!isFlipped)} className="perspective-1000 w-full h-[340px] cursor-pointer">
            <div className={`relative w-full h-full duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

              {/* FRONT */}
              <div className="absolute w-full h-full backface-hidden bg-white border border-slate-200 rounded-2xl p-6 shadow-md flex flex-col justify-between select-none">
                <div className="flex items-center justify-between">
                  <span className="badge bg-slate-100 text-slate-500 border border-slate-200">
                    {activeCard.list.replace('list', 'List ')}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); toggleStarred(activeCard.word); }}
                    className={`p-1.5 rounded-full transition-colors btn-press ${starredWords.includes(activeCard.word.toLowerCase()) ? 'text-yellow-500' : 'text-slate-300 hover:text-slate-500'}`}
                  >
                    <Star className={`w-4 h-4 ${starredWords.includes(activeCard.word.toLowerCase()) ? 'fill-yellow-400' : ''}`} />
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-5xl font-extrabold tracking-tight text-slate-900 block">{activeCard.word}</span>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                  <RotateCw className="w-3 h-3 animate-spin-slow" />
                  <span>Click to reveal definition</span>
                  <kbd className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono text-[9px]">Space</kbd>
                </div>
              </div>

              {/* BACK */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-lg flex flex-col justify-between overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Semantic Group</span>
                    <span className="text-xs font-bold text-indigo-600">{getThemeName(activeCard.group)}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleStarred(activeCard.word); }}
                    className={`p-1.5 rounded-full transition-colors btn-press ${starredWords.includes(activeCard.word.toLowerCase()) ? 'text-yellow-500' : 'text-slate-300 hover:text-slate-500'}`}
                  >
                    <Star className={`w-4 h-4 ${starredWords.includes(activeCard.word.toLowerCase()) ? 'fill-yellow-400' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 my-3 space-y-3 overflow-y-auto pr-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">{activeCard.word}</span>
                    {activeDetails?.phonetic && (
                      <span className="text-[11px] text-slate-400 font-mono">{activeDetails.phonetic}</span>
                    )}
                    {activeDetails?.audio && (
                      <button onClick={handlePlayAudio} className="p-1 text-slate-400 hover:text-slate-600 btn-press">
                        <Volume2 className="w-3.5 h-3.5" />
                        <audio ref={audioRef} src={activeDetails.audio} />
                      </button>
                    )}
                  </div>

                  {loadingDetails ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="skeleton h-3 rounded w-1/4" />
                      <div className="skeleton h-3 rounded w-full" />
                    </div>
                  ) : activeDetails?.found ? (
                    <div className="space-y-2">
                      {activeDetails.meanings.slice(0, 1).map((m, i) => (
                        <div key={i} className="space-y-1.5">
                          <span className="text-[9px] font-bold uppercase text-slate-400 italic">{m.partOfSpeech}</span>
                          <p className="text-xs text-slate-700 leading-relaxed">{m.definitions[0]?.definition}</p>
                          {m.definitions[0]?.example && (
                            <p className="text-[10px] text-slate-400 italic border-l-2 border-indigo-100 pl-2.5 leading-relaxed">"{m.definitions[0].example}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic border-l-2 border-indigo-100 pl-3 leading-relaxed">
                      "{getSentenceTemplate(activeCard.group, activeCard.word).replace('{blank}', `[${activeCard.word}]`)}"
                    </p>
                  )}

                  {/* Synonyms */}
                  <div className="border-t border-slate-100 pt-2.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Group Cohort</span>
                    <div className="flex flex-wrap gap-1">
                      {(groupWordsMap[activeCard.group] || [])
                        .filter(w => w.toLowerCase() !== activeCard.word.toLowerCase())
                        .map(w => (
                          <span key={w} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{w}</span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-2.5">
                  <RotateCw className="w-3 h-3" />
                  <span>Click to hide</span>
                </div>
              </div>

            </div>
          </div>

          {/* SRS Grade Controls */}
          <div className="card p-4 space-y-3">
            {isFlipped ? (
              <div className="space-y-3 animate-fade-in">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Rate Your Recall</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { grade: 'hard',   label: 'Hard',   sub: 'Review again',    color: 'border-rose-200 bg-rose-50/70 hover:bg-rose-50 text-rose-700', key: '1' },
                    { grade: 'medium', label: 'Medium', sub: 'Mark Learning',   color: 'border-amber-200 bg-amber-50/70 hover:bg-amber-50 text-amber-700', key: '2' },
                    { grade: 'easy',   label: 'Easy',   sub: 'Mark Learned',   color: 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 text-emerald-700', key: '3' },
                  ].map(g => (
                    <button
                      key={g.grade}
                      onClick={() => handleGrade(g.grade)}
                      className={`flex flex-col items-center py-3 rounded-xl border transition-all btn-press shadow-2xs ${g.color}`}
                    >
                      <span className="text-sm font-bold">{g.label}</span>
                      <span className="text-[9px] mt-0.5 opacity-70">{g.sub}</span>
                      <kbd className="mt-1.5 bg-white/60 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold opacity-60">{g.key}</kbd>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-3.5 rounded-xl transition-all btn-press flex items-center justify-center gap-2"
              >
                Reveal Definition
                <kbd className="text-[10px] opacity-60 bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">Space</kbd>
              </button>
            )}
            <p className="text-[9px] text-slate-300 text-center flex items-center justify-center gap-1.5">
              <Info className="w-2.5 h-2.5" />
              [Space] flip · [1] Hard · [2] Medium · [3] Easy
            </p>
          </div>

        </div>

      ) : (
        /* ── Complete Screen ── */
        <div className="card p-8 text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">Deck Complete!</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              You reviewed <strong>{deck.length}</strong> terms and updated their spaced repetition queue.
            </p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-xs mx-auto">
            {[
              { grade: 'easy',   label: 'Easy',   color: 'text-emerald-600' },
              { grade: 'medium', label: 'Medium', color: 'text-amber-600' },
              { grade: 'hard',   label: 'Hard',   color: 'text-rose-600' },
            ].map(g => (
              <div key={g.grade} className="text-center">
                <span className={`text-2xl font-extrabold block ${g.color}`}>
                  {deckHistory.filter(h => h.grade === g.grade).length}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">{g.label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center max-w-sm mx-auto">
            <button onClick={() => buildDeck()} className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 rounded-xl btn-press flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Study Again
            </button>
            <button onClick={() => setIsConfigMode(true)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-50 btn-press flex items-center justify-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Configure
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
