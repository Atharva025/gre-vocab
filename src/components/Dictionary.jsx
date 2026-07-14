import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Star, 
  Volume2, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  ArrowLeft,
  RotateCw
} from 'lucide-react';
import { getThemeName, getSentenceTemplate } from '../data/sentenceTemplates';
import { uniqueWords, groupWordsMap, listGroupsMap } from '../hooks/useVocabState';

export default function Dictionary({ vocab, selectedList, setSelectedList }) {
  const { 
    wordStatus, 
    starredWords, 
    setWordStatus, 
    toggleStarred, 
    getWordDetails,
    dictionaryData 
  } = vocab;

  const [searchQuery, setSearchQuery]         = useState('');
  const [activeFilter, setActiveFilter]       = useState('all');
  const [selectedWord, setSelectedWord]       = useState(null);
  const [wordDetails, setWordDetails]         = useState(null);
  const [loadingDetails, setLoadingDetails]   = useState(false);
  const [errorDetails, setErrorDetails]       = useState(null);
  const [expandedGroups, setExpandedGroups]   = useState({});
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (selectedList && selectedList !== 'starred') {
      const groups = listGroupsMap[selectedList] || [];
      const initExpanded = {};
      groups.forEach((g, idx) => { initExpanded[g] = idx === 0; });
      setExpandedGroups(initExpanded);
    }
  }, [selectedList]);

  useEffect(() => {
    if (!selectedWord) { setWordDetails(null); return; }
    let isMounted = true;
    setLoadingDetails(true);
    setErrorDetails(null);
    getWordDetails(selectedWord.word)
      .then(d => { if (isMounted) { setWordDetails(d); setLoadingDetails(false); } })
      .catch(e => { if (isMounted) { setErrorDetails(e.message); setLoadingDetails(false); } });
    return () => { isMounted = false; };
  }, [selectedWord, getWordDetails]);

  const toggleGroup = (g) => setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] }));

  const handleWordSelect = (wordObj) => {
    setSelectedWord(wordObj);
    setShowMobileDetail(true);
  };

  const handlePlayAudio = () => {
    if (audioRef.current) audioRef.current.play().catch(e => console.error(e));
  };

  const getFilteredWords = () => {
    let base = [];
    if (selectedList === 'starred') {
      base = uniqueWords.filter(i => starredWords.includes(i.word.toLowerCase()));
    } else {
      (listGroupsMap[selectedList] || []).forEach(gk => {
        (groupWordsMap[gk] || []).forEach(w => base.push({ word: w, list: selectedList, group: gk }));
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      base = base.filter(i => i.word.toLowerCase().includes(q) || getThemeName(i.group).toLowerCase().includes(q));
    }
    if (activeFilter === 'starred')  base = base.filter(i => starredWords.includes(i.word.toLowerCase()));
    if (activeFilter === 'learning') base = base.filter(i => wordStatus[i.word.toLowerCase()] === 'learning');
    if (activeFilter === 'learned')  base = base.filter(i => wordStatus[i.word.toLowerCase()] === 'learned');
    return base;
  };

  const filteredWords = getFilteredWords();
  const groupedFilteredWords = {};
  filteredWords.forEach(i => {
    if (!groupedFilteredWords[i.group]) groupedFilteredWords[i.group] = [];
    groupedFilteredWords[i.group].push(i);
  });

  const lists = Object.keys(dictionaryData);

  const statusColorMap = {
    learned:     { dot: 'bg-emerald-500', dotSelected: 'bg-emerald-400' },
    learning:    { dot: 'bg-amber-400',   dotSelected: 'bg-amber-300'  },
    not_started: { dot: 'transparent border border-slate-300', dotSelected: 'border border-slate-500' },
  };

  return (
    <div className="flex h-[calc(100vh-90px)] md:h-[calc(100vh-70px)] border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm animate-fade-in">

      {/* ── LEFT PANEL ── */}
      <div className={`w-full md:w-72 lg:w-80 xl:w-96 flex flex-col border-r border-slate-200/80 bg-slate-50/30 ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>

        {/* Header */}
        <div className="p-3 bg-white border-b border-slate-200/80 space-y-2.5">

          {/* List Selector */}
          <select
            value={selectedList}
            onChange={e => { setSelectedList(e.target.value); setSelectedWord(null); setShowMobileDetail(false); }}
            className="w-full text-xs font-semibold bg-slate-100 border-0 rounded-xl px-3 py-2 text-slate-800 cursor-pointer focus:ring-2 focus:ring-indigo-200 outline-none transition-all hover:bg-slate-200/50"
          >
            <option value="starred">⭐ Starred Words ({starredWords.length})</option>
            {lists.map(l => (
              <option key={l} value={l}>List {l.replace('list', '')}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search words or themes…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { key: 'all',      label: 'All' },
              { key: 'learning', label: 'Learning', color: 'bg-amber-400 border-amber-300 text-slate-900' },
              { key: 'learned',  label: 'Learned',  color: 'bg-emerald-500 border-emerald-400 text-white' },
              { key: 'starred',  label: '⭐ Starred' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`
                  px-3 py-1 rounded-full border text-[10px] font-semibold transition-all shrink-0 btn-press
                  ${activeFilter === f.key
                    ? (f.color || 'bg-slate-900 border-slate-900 text-white')
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Word List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {Object.keys(groupedFilteredWords).length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">No words found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search or filters.</p>
              </div>
            </div>
          ) : (
            Object.keys(groupedFilteredWords).map(groupKey => {
              const words = groupedFilteredWords[groupKey];
              const isExpanded = expandedGroups[groupKey] || false;
              const themeName = getThemeName(groupKey);
              const learnedCount = words.filter(i => wordStatus[i.word.toLowerCase()] === 'learned').length;

              return (
                <div key={groupKey} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="text-xs font-semibold text-slate-800 block truncate leading-snug">{themeName}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {learnedCount}/{words.length} learned
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {learnedCount === words.length && words.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      }
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-50 p-1 space-y-px animate-fade-in">
                      {words.map(item => {
                        const status = wordStatus[item.word.toLowerCase()] || 'not_started';
                        const isStarred  = starredWords.includes(item.word.toLowerCase());
                        const isSelected = selectedWord?.word?.toLowerCase() === item.word.toLowerCase() && selectedWord?.group === item.group;
                        const dotStyle = isSelected
                          ? (status === 'learned' ? 'bg-emerald-400' : status === 'learning' ? 'bg-amber-300' : 'border border-slate-500')
                          : (status === 'learned' ? 'bg-emerald-500' : status === 'learning' ? 'bg-amber-400' : 'border border-slate-300');

                        return (
                          <button
                            key={`${item.word}-${item.group}`}
                            onClick={() => handleWordSelect(item)}
                            className={`
                              w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left
                              transition-all duration-150 btn-press
                              ${isSelected
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-50'
                              }
                            `}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
                              <span className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {item.word}
                              </span>
                            </div>
                            {isStarred && (
                              <Star className={`w-3 h-3 shrink-0 ${isSelected ? 'text-yellow-300 fill-yellow-300' : 'text-yellow-400 fill-yellow-400'}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Word Detail ── */}
      <div className={`flex-1 flex flex-col bg-white min-w-0 ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
        {selectedWord ? (
          <div className="flex-1 flex flex-col min-h-0 word-detail-enter">

            {/* Detail Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="p-1.5 -ml-1 rounded-lg hover:bg-slate-100 md:hidden text-slate-500 transition-colors btn-press"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                    {selectedWord.list ? selectedWord.list.replace('list', 'List ') : ''} · Semantic Group
                  </span>
                  <span className="text-xs font-bold text-slate-700">{getThemeName(selectedWord.group)}</span>
                </div>
              </div>

              <button
                onClick={() => toggleStarred(selectedWord.word)}
                className={`p-2 rounded-xl border transition-all btn-press ${
                  starredWords.includes(selectedWord.word.toLowerCase())
                    ? 'border-yellow-200 bg-yellow-50 text-yellow-500 hover:bg-yellow-100'
                    : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Bookmark Word"
              >
                <Star className={`w-4 h-4 transition-all ${starredWords.includes(selectedWord.word.toLowerCase()) ? 'fill-yellow-400' : ''}`} />
              </button>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

              {/* Word Heading */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1.5">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-none">
                    {selectedWord.word}
                  </h1>
                  {wordDetails?.phonetic && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-sm font-mono">{wordDetails.phonetic}</span>
                      {wordDetails.audio && (
                        <>
                          <button
                            onClick={handlePlayAudio}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors btn-press"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <audio ref={audioRef} src={wordDetails.audio} />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Study Status Segmented Control */}
                <div className="bg-slate-100 p-1 rounded-xl flex gap-0.5 shrink-0 self-start">
                  {[
                    { key: 'not_started', label: 'New' },
                    { key: 'learning',    label: 'Learning', activeClass: 'bg-amber-400 text-slate-900 shadow-xs' },
                    { key: 'learned',     label: 'Learned',  activeClass: 'bg-emerald-500 text-white shadow-xs' },
                  ].map(s => {
                    const currentStatus = wordStatus[selectedWord.word.toLowerCase()] || 'not_started';
                    const isActive = currentStatus === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setWordStatus(selectedWord.word, s.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all btn-press ${
                          isActive
                            ? (s.activeClass || 'bg-white text-slate-900 shadow-xs')
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GRE Group Cohort */}
              <div className="space-y-3 bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    GRE Group Cohort — Synonyms
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Words in the same group share a central GRE theme. Knowing them together improves Sentence Equivalence scores.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(groupWordsMap[selectedWord.group] || []).map(w => {
                    const isSelf   = w.toLowerCase() === selectedWord.word.toLowerCase();
                    const wStatus  = wordStatus[w.toLowerCase()];
                    return (
                      <span
                        key={w}
                        onClick={() => !isSelf && handleWordSelect({ ...selectedWord, word: w })}
                        className={`
                          inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border
                          transition-all duration-150
                          ${isSelf
                            ? 'bg-slate-900 border-slate-900 text-white font-bold cursor-default'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer btn-press'
                          }
                        `}
                      >
                        {!isSelf && wStatus === 'learned'  && <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />}
                        {!isSelf && wStatus === 'learning' && <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />}
                        {w}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Dictionary Definition */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Detailed Dictionary Definition
                </h3>

                {loadingDetails ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="skeleton h-3.5 rounded w-1/4" />
                      <div className="skeleton h-3 rounded w-full" />
                      <div className="skeleton h-3 rounded w-5/6" />
                    </div>
                    <div className="space-y-2">
                      <div className="skeleton h-3.5 rounded w-1/3" />
                      <div className="skeleton h-3 rounded w-11/12" />
                    </div>
                  </div>
                ) : wordDetails?.found ? (
                  <div className="space-y-6">
                    {wordDetails.meanings.map((meaning, mIdx) => (
                      <div key={mIdx} className="space-y-3">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg italic">
                          {meaning.partOfSpeech}
                        </span>
                        <ol className="space-y-4 list-decimal pl-4 text-xs text-slate-700">
                          {meaning.definitions.map((def, dIdx) => (
                            <li key={dIdx} className="space-y-1.5">
                              <p className="leading-relaxed text-slate-800">{def.definition}</p>
                              {def.example && (
                                <p className="text-[11px] text-slate-400 italic border-l-2 border-indigo-100 pl-3">
                                  "{def.example}"
                                </p>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {wordDetails?.isOffline ? (
                      <div className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-200/60 text-amber-800 p-3.5 rounded-xl text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <strong className="block font-bold">Offline Mode Active</strong>
                          <span className="opacity-90 block mt-0.5">
                            Public dictionary lookup is currently disabled because you are offline. Using offline thematic fallback. Definitions will fetch automatically once your connection returns.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-xs">Definition not found online — using thematic fallback.</p>
                      </div>
                    )}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Thematic Definition</span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        This word belongs to the semantic group <span className="font-bold text-slate-900">"{getThemeName(selectedWord.group)}"</span>.
                      </p>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Example Usage</span>
                        <p className="text-xs text-slate-600 italic border-l-2 border-indigo-100 pl-3 leading-relaxed">
                          "{getSentenceTemplate(selectedWord.group, selectedWord.word).replace('{blank}', `[${selectedWord.word}]`)}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">No Word Selected</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Select a list, expand a semantic group on the left, and click any word to view its definition and cohort.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
