import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
  Timer,
  Zap,
  Settings,
  AlertCircle
} from 'lucide-react';
import { getThemeName, getSentenceTemplate } from '../data/sentenceTemplates';
import { listGroupsMap, groupWordsMap } from '../hooks/useVocabState';

const getThematicCategory = (groupKey) => {
  const key = groupKey.toLowerCase();
  if (key.includes('angry') || key.includes('scold') || key.includes('criticize') ||
    key.includes('hate') || key.includes('complain') || key.includes('mock') ||
    key.includes('disrespect') || key.includes('belli') || key.includes('argue') ||
    key.includes('fight') || key.includes('danger') || key.includes('ill_will') ||
    key.includes('causing_fear') || key.includes('troubled') || key.includes('sinister'))
    return 'negative_tone';
  if (key.includes('praise') || key.includes('agree') || key.includes('harmony') ||
    key.includes('equal') || key.includes('skill') || key.includes('flex') ||
    key.includes('talent') || key.includes('optimistic') || key.includes('attractive') ||
    key.includes('aesthetic') || key.includes('coalesce') || key.includes('rally') ||
    key.includes('generous') || key.includes('frugal') || key.includes('saving'))
    return 'positive_tone';
  if (key.includes('intellect') || key.includes('know') || key.includes('instruct') ||
    key.includes('teach') || key.includes('confus') || key.includes('clear') ||
    key.includes('understand') || key.includes('secret') || key.includes('mysterious') ||
    key.includes('prediction') || key.includes('warning') || key.includes('circuitous') ||
    key.includes('complex'))
    return 'cognitive';
  if (key.includes('abund') || key.includes('scarce') || key.includes('waste') ||
    key.includes('greedy') || key.includes('unimport') || key.includes('silly') ||
    key.includes('serious') || key.includes('sad') || key.includes('frivolous') ||
    key.includes('minor'))
    return 'quantity_value';
  return 'general';
};

export default function Quiz({ vocab }) {
  const { recordQuizResult, dictionaryData } = vocab;

  const [selectedLists, setSelectedLists] = useState(['list1']);
  const [questionCount, setQuestionCount] = useState(10);
  const [isHardMode, setIsHardMode] = useState(false);
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [enabledTypes, setEnabledTypes] = useState({
    theme_mcq: true,
    sentence_completion: true,
    sentence_equivalence: true,
    odd_man_out: true,
    match_following: true,
  });

  const [quizMode, setQuizMode] = useState('config');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizHistory, setQuizHistory] = useState([]);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);
  const [matchingLeft, setMatchingLeft] = useState(null);
  const [matchingPairs, setMatchingPairs] = useState({});
  const [reviewExpanded, setReviewExpanded] = useState({});

  const allLists = Object.keys(dictionaryData);

  const getRecentWords = () => {
    try { return JSON.parse(localStorage.getItem('gre_quiz_recent_words') || '[]'); }
    catch { return []; }
  };
  const addRecentWords = (words) => {
    const recent = getRecentWords();
    localStorage.setItem('gre_quiz_recent_words', JSON.stringify([...words, ...recent].slice(0, 150)));
  };

  useEffect(() => {
    if (quizMode !== 'active' || !isTimed || submitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(timeLimit);
    setTimedOut(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleTimeOut(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizMode, isTimed, submitted, currentIdx, timeLimit]);

  const handleTimeOut = () => { setTimedOut(true); handleSubmitAnswer(true); };

  const handleToggleList = (listKey) =>
    setSelectedLists(prev =>
      prev.includes(listKey)
        ? (prev.length === 1 ? prev : prev.filter(k => k !== listKey))
        : [...prev, listKey]
    );

  const handleToggleType = (type) =>
    setEnabledTypes(prev => {
      const copy = { ...prev, [type]: !prev[type] };
      return Object.values(copy).some(v => v) ? copy : prev;
    });

  const getRandElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandSubarray = (arr, size) => [...arr].sort(() => 0.5 - Math.random()).slice(0, size);

  const generateQuiz = () => {
    const activeTypes = Object.keys(enabledTypes).filter(k => enabledTypes[k]);
    const generated = [];

    const groupPool = [];
    const wordPool = [];
    selectedLists.forEach(listKey => {
      (listGroupsMap[listKey] || []).forEach(groupKey => {
        groupPool.push({ groupKey, listKey });
        (groupWordsMap[groupKey] || []).forEach(word => wordPool.push({ word: word.trim(), group: groupKey, list: listKey }));
      });
    });

    if (wordPool.length < 15) {
      alert('Too few words in selected lists. Please select more lists.');
      return;
    }

    const recentWords = getRecentWords();
    let freshPool = wordPool.filter(w => !recentWords.includes(w.word.toLowerCase()));
    if (freshPool.length < questionCount) { localStorage.removeItem('gre_quiz_recent_words'); freshPool = wordPool; }

    const usedTargets = new Set();
    const typeOrder = [];
    for (let j = 0; j < questionCount; j++) typeOrder.push(activeTypes[j % activeTypes.length]);
    typeOrder.sort(() => 0.5 - Math.random());

    const MAX_ATTEMPTS = 8;

    for (let i = 0; i < questionCount; i++) {
      let qObj = null;
      let qType = typeOrder[i];

      for (let attempt = 0; attempt < MAX_ATTEMPTS && !qObj; attempt++) {
        const avail = freshPool.filter(w => !usedTargets.has(w.word.toLowerCase()));
        const pool = avail.length > 0 ? avail : wordPool;

        try {
          if (qType === 'theme_mcq') {
            const isW2T = Math.random() > 0.5;
            const target = getRandElem(pool);
            usedTargets.add(target.word.toLowerCase());
            const correctTheme = getThemeName(target.group);

            let distThemes = groupPool.filter(g => g.groupKey !== target.group).map(g => getThemeName(g.groupKey));
            if (isHardMode) {
              const cat = getThematicCategory(target.group);
              const lg = listGroupsMap[target.list] || [];
              const hard = lg.filter(g => g !== target.group && getThematicCategory(g) === cat).map(g => getThemeName(g));
              if (hard.length >= 3) distThemes = hard;
              else distThemes = Array.from(new Set([...hard, ...lg.filter(g => g !== target.group).map(g => getThemeName(g))]));
            }
            const uniqueT = Array.from(new Set(distThemes));
            if (uniqueT.length < 3) continue;
            const chosen3T = getRandSubarray(uniqueT, 3);

            if (isW2T) {
              const opts = [...chosen3T, correctTheme].sort(() => 0.5 - Math.random());
              qObj = { type: 'theme_mcq', prompt: `What is the primary semantic theme of the word "${target.word}"?`, options: opts, correctAnswers: [correctTheme], explanation: `"${target.word}" belongs to the group "${correctTheme}".`, selectedList: target.list };
            } else {
              let dwPool = wordPool.filter(w => w.group !== target.group).map(w => w.word);
              if (isHardMode) {
                const cat = getThematicCategory(target.group);
                const hard = wordPool.filter(w => w.group !== target.group && getThematicCategory(w.group) === cat).map(w => w.word);
                if (hard.length >= 3) dwPool = hard;
              }
              const chosen3W = getRandSubarray(Array.from(new Set(dwPool)), 3);
              if (chosen3W.length < 3) continue;
              const opts = [...chosen3W, target.word].sort(() => 0.5 - Math.random());
              qObj = { type: 'theme_mcq', prompt: `Which word best aligns with the semantic theme "${correctTheme}"?`, options: opts, correctAnswers: [target.word], explanation: `"${target.word}" is classified under "${correctTheme}".`, selectedList: target.list };
            }
          }
          else if (qType === 'sentence_completion') {
            const target = getRandElem(pool);
            usedTargets.add(target.word.toLowerCase());
            const sentence = getSentenceTemplate(target.group, target.word).replace('{blank}', '________');
            let dwPool = wordPool.filter(w => w.group !== target.group).map(w => w.word);
            if (isHardMode) {
              const cat = getThematicCategory(target.group);
              const hard = wordPool.filter(w => w.group !== target.group && getThematicCategory(w.group) === cat).map(w => w.word);
              if (hard.length >= 3) dwPool = hard;
            }
            const chosen = getRandSubarray(Array.from(new Set(dwPool)), 3);
            if (chosen.length < 3) continue;
            const opts = [...chosen, target.word].sort(() => 0.5 - Math.random());
            qObj = { type: 'sentence_completion', prompt: `Select the word that best completes the sentence:\n\n"${sentence}"`, options: opts, correctAnswers: [target.word], explanation: `"${target.word}" fits the context. Theme: "${getThemeName(target.group)}".`, selectedList: target.list };
          }
          else if (qType === 'sentence_equivalence') {
            const validG = groupPool.filter(g => (groupWordsMap[g.groupKey] || []).length >= 2);
            if (validG.length === 0) { qType = 'theme_mcq'; continue; }
            const tg = getRandElem(validG);
            const tWords = getRandSubarray(groupWordsMap[tg.groupKey] || [], 2);
            if (tWords.length < 2) continue;
            tWords.forEach(w => usedTargets.add(w.toLowerCase()));
            const sentence = getSentenceTemplate(tg.groupKey, tWords[0]).replace('{blank}', '________');
            let dwPool = wordPool.filter(w => w.group !== tg.groupKey).map(w => w.word);
            if (isHardMode) {
              const cat = getThematicCategory(tg.groupKey);
              const hard = wordPool.filter(w => w.group !== tg.groupKey && getThematicCategory(w.group) === cat).map(w => w.word);
              if (hard.length >= 4) dwPool = hard;
            }
            const chosen = getRandSubarray(Array.from(new Set(dwPool)), 4);
            if (chosen.length < 4) continue;
            const opts = [...chosen, ...tWords].sort(() => 0.5 - Math.random());
            qObj = { type: 'sentence_equivalence', prompt: `Select TWO words that best fit the blank and create sentences alike in meaning:\n\n"${sentence}"`, options: opts, correctAnswers: tWords, explanation: `"${tWords[0]}" and "${tWords[1]}" are synonyms from "${getThemeName(tg.groupKey)}".`, selectedList: tg.listKey };
          }
          else if (qType === 'odd_man_out') {
            const validG = groupPool.filter(g => (groupWordsMap[g.groupKey] || []).length >= 3);
            if (validG.length === 0) { qType = 'theme_mcq'; continue; }
            const tg = getRandElem(validG);
            const cohort = getRandSubarray(groupWordsMap[tg.groupKey] || [], 3);
            if (cohort.length < 3) continue;
            const dPool = wordPool.filter(w => w.group !== tg.groupKey);
            if (dPool.length === 0) { qType = 'theme_mcq'; continue; }
            let distractor;
            if (isHardMode) {
              const cat = getThematicCategory(tg.groupKey);
              const hard = dPool.filter(w => w.list === tg.listKey && getThematicCategory(w.group) !== cat);
              distractor = getRandElem(hard.length > 0 ? hard : dPool).word;
            } else {
              distractor = getRandElem(dPool).word;
            }
            usedTargets.add(distractor.toLowerCase());
            const opts = [...cohort, distractor].sort(() => 0.5 - Math.random());
            qObj = { type: 'odd_man_out', prompt: `Which word does NOT belong to the same semantic group as the other three?`, options: opts, correctAnswers: [distractor], explanation: `"${cohort[0]}", "${cohort[1]}", and "${cohort[2]}" share the theme "${getThemeName(tg.groupKey)}"; "${distractor}" belongs to a different theme.`, selectedList: tg.listKey };
          }
          else if (qType === 'match_following') {
            if (groupPool.length < 4) { qType = 'theme_mcq'; continue; }
            const chosen4 = getRandSubarray(groupPool, 4);
            const lw = [], rt = [];
            let valid = true;
            chosen4.forEach((g, index) => {
              const gw = groupWordsMap[g.groupKey] || [];
              if (gw.length === 0) { valid = false; return; }
              const word = getRandElem(gw);
              lw.push({ id: index, word });
              rt.push({ id: index, theme: getThemeName(g.groupKey) });
              usedTargets.add(word.toLowerCase());
            });
            if (!valid || lw.length < 4) continue;
            const shuffledR = [...rt].sort(() => 0.5 - Math.random());
            qObj = {
              type: 'match_following',
              prompt: 'Match the vocabulary words on the left with their correct semantic themes on the right.',
              leftWords: lw,
              rightThemes: shuffledR,
              correctMapping: lw.reduce((acc, curr) => { acc[curr.id] = shuffledR.findIndex(r => r.id === curr.id); return acc; }, {}),
              explanation: lw.map(l => `"${l.word}" fits the theme "${getThemeName(chosen4[l.id].groupKey)}"`).join('. '),
              selectedList: chosen4[0].listKey
            };
          }
        } catch (err) {
          console.error('Q gen error attempt', attempt, err);
        }
      }

      if (qObj) generated.push(qObj);
    }

    addRecentWords(Array.from(usedTargets));

    if (generated.length === 0) {
      alert('Could not generate questions. Please select more lists or enable more question types.');
      return;
    }

    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedAnswers([]);
    setSubmitted(false);
    setScore(0);
    setQuizHistory([]);
    setMatchingLeft(null);
    setMatchingPairs({});
    setTimedOut(false);
    setQuizMode('active');
  };

  const handleSelectAnswer = (option) => {
    if (submitted) return;
    const cq = questions[currentIdx];
    if (cq.type === 'sentence_equivalence') {
      setSelectedAnswers(prev =>
        prev.includes(option) ? prev.filter(o => o !== option)
          : prev.length >= 2 ? [prev[1], option]
          : [...prev, option]
      );
    } else {
      setSelectedAnswers([option]);
    }
  };

  const handleMatchLeftClick = (idx) => { if (!submitted) setMatchingLeft(idx); };

  const handleMatchRightClick = (rightIdx) => {
    if (submitted || matchingLeft === null) return;
    setMatchingPairs(prev => {
      const u = { ...prev };
      Object.keys(u).forEach(lk => { if (u[lk] === rightIdx) delete u[lk]; });
      u[matchingLeft] = rightIdx;
      return u;
    });
    setMatchingLeft(null);
  };

  const clearMatchingPairs = () => { if (!submitted) { setMatchingPairs({}); setMatchingLeft(null); } };

  const handleSubmitAnswer = (forceTimeOut = false) => {
    if (submitted) return;
    const cq = questions[currentIdx];
    let isCorrect = false;

    if (cq.type === 'match_following') {
      if (Object.keys(matchingPairs).length !== 4 && !forceTimeOut) { alert('Please match all words before submitting.'); return; }
      let correct = 0;
      Object.keys(matchingPairs).forEach(lid => { if (matchingPairs[lid] === cq.correctMapping[lid]) correct++; });
      isCorrect = correct === 4;
      if (isCorrect) setScore(p => p + 1);
      setQuizHistory(p => [...p, { question: cq, userMapping: matchingPairs, isCorrect, timedOut: forceTimeOut }]);
    } else if (cq.type === 'sentence_equivalence') {
      if (selectedAnswers.length < 2 && !forceTimeOut) { alert('Please select exactly two options.'); return; }
      isCorrect = selectedAnswers.length === 2 && selectedAnswers.filter(a => cq.correctAnswers.includes(a)).length === 2;
      if (isCorrect) setScore(p => p + 1);
      setQuizHistory(p => [...p, { question: cq, selected: selectedAnswers, isCorrect, timedOut: forceTimeOut }]);
    } else {
      if (selectedAnswers.length === 0 && !forceTimeOut) { alert('Please select an answer.'); return; }
      isCorrect = selectedAnswers.length > 0 && cq.correctAnswers.includes(selectedAnswers[0]);
      if (isCorrect) setScore(p => p + 1);
      setQuizHistory(p => [...p, { question: cq, selected: selectedAnswers, isCorrect, timedOut: forceTimeOut }]);
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(p => p + 1);
      setSelectedAnswers([]);
      setSubmitted(false);
      setMatchingLeft(null);
      setMatchingPairs({});
      setTimedOut(false);
    } else {
      recordQuizResult(score, questions.length);
      setQuizMode('results');
      const collapse = {};
      questions.forEach((_, i) => { collapse[i] = false; });
      setReviewExpanded(collapse);
    }
  };

  const handleRestartQuiz = () => generateQuiz();
  const handleConfigureNew = () => { setQuizMode('config'); setQuestions([]); setCurrentIdx(0); };
  const toggleReview = (idx) => setReviewExpanded(p => ({ ...p, [idx]: !p[idx] }));

  const currentQuestion = questions[currentIdx];
  const getTimerColor = () => {
    const pct = (timeLeft / timeLimit) * 100;
    return pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">

      {/* Header */}
      <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
            </div>
            Adaptive Quiz Center
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 ml-9">Timed, high-variety GRE vocabulary practice.</p>
        </div>
        {quizMode !== 'config' && (
          <button onClick={handleConfigureNew} className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-100 transition-colors btn-press self-start sm:self-center">
            Configure Test
          </button>
        )}
      </div>

      {/* ── CONFIG ── */}
      {quizMode === 'config' && (
        <div className="card p-5 md:p-6 space-y-5 animate-scale-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-4 h-4 text-slate-500" />
            <h2 className="section-title">Practice Test Settings</h2>
          </div>

          <div className="space-y-4">
            {/* Sourcing Strategy */}
            <div className="space-y-2">
              <label className="form-label block">Sourcing Strategy</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLists(['list1'])}
                  className={`p-3 rounded-xl border text-left transition-all btn-press ${
                    selectedLists.length < allLists.length && selectedLists.length > 0 && !selectedLists._isRandomMix
                      ? 'bg-indigo-50/20 border-indigo-200 text-indigo-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold block">Custom Selection</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Toggle specific lists manually below.</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLists(allLists);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all btn-press ${
                    selectedLists.length === allLists.length
                      ? 'bg-indigo-50/20 border-indigo-200 text-indigo-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold block">Combined Mega Mix</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">System-mix words from all 13 lists.</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const count = Math.floor(Math.random() * 4) + 3; // 3 to 6
                    const shuffled = [...allLists].sort(() => 0.5 - Math.random());
                    const selection = shuffled.slice(0, count);
                    selection._isRandomMix = true;
                    setSelectedLists(selection);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all btn-press ${
                    selectedLists._isRandomMix
                      ? 'bg-indigo-50/20 border-indigo-200 text-indigo-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold block">Randomized System Mix</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Auto-combine 3 to 6 random lists.</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="form-label block">Word Lists</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {allLists.map(k => (
                  <button key={k} onClick={() => {
                    const next = selectedLists.includes(k)
                      ? (selectedLists.length === 1 ? selectedLists : selectedLists.filter(x => x !== k))
                      : [...selectedLists, k];
                    next._isRandomMix = false;
                    setSelectedLists(next);
                  }}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all btn-press ${selectedLists.includes(k) ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >{k.replace('list', '')}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="form-label block">Difficulty</label>
                <div onClick={() => setIsHardMode(!isHardMode)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isHardMode ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'}`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${isHardMode ? 'text-indigo-600' : 'text-slate-400'}`} />
                      Extreme Hard Mode
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Semantically confusing distractors.</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0 ml-4 ${isHardMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${isHardMode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="form-label block">Time Limits</label>
                <div className="flex gap-1.5">
                  <button onClick={() => setIsTimed(false)} className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all btn-press ${!isTimed ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>Untimed</button>
                  <button onClick={() => setIsTimed(true)} className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all btn-press flex items-center justify-center gap-1.5 ${isTimed ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                    <Timer className="w-3.5 h-3.5" /> Timed
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isTimed && (
                <div className="space-y-2 animate-fade-in">
                  <label className="form-label block">Timer per Question</label>
                  <div className="flex gap-1.5">
                    {[{ sec: 15, label: 'Hard' }, { sec: 30, label: 'Std' }, { sec: 45, label: 'Easy' }].map(t => (
                      <button key={t.sec} onClick={() => setTimeLimit(t.sec)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all btn-press ${timeLimit === t.sec ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >{t.sec}s <span className="opacity-60 font-normal">({t.label})</span></button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="form-label block">Question Count</label>
                <div className="flex gap-1.5">
                  {[5, 10, 20, 30].map(c => (
                    <button key={c} onClick={() => setQuestionCount(c)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all btn-press ${questionCount === c ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="form-label block">Question Formats</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { key: 'theme_mcq', label: 'Theme Match (MCQ)' },
                  { key: 'sentence_completion', label: 'Fill in the Blanks' },
                  { key: 'sentence_equivalence', label: 'Sentence Equivalence' },
                  { key: 'odd_man_out', label: 'Odd Man Out' },
                  { key: 'match_following', label: 'Match the Following' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => handleToggleType(key)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all btn-press text-left ${enabledTypes[key] ? 'bg-indigo-50/20 border-indigo-200 text-indigo-900 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <span>{label}</span>
                    {enabledTypes[key] && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={generateQuiz} className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all btn-press flex items-center justify-center gap-2">
            Start Practice Test
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── ACTIVE QUIZ ── */}
      {quizMode === 'active' && currentQuestion && (
        <div className="space-y-4">
          <div className="card px-5 py-3.5 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-700">Q {currentIdx + 1} / {questions.length}</span>
            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isTimed && (
                <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${timeLeft <= 10 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                  <Timer className="w-3.5 h-3.5" />{timeLeft}s
                </div>
              )}
              {isHardMode && <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100"><Zap className="w-2.5 h-2.5 mr-0.5" /> Hard</span>}
              <span className="text-xs font-semibold text-slate-600">Score: <strong className="text-slate-900">{score}</strong></span>
            </div>
          </div>

          <div className="card overflow-hidden relative">
            {isTimed && !submitted && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
                <div className={`h-full transition-all duration-1000 ease-linear rounded-r-full ${getTimerColor()}`} style={{ width: `${(timeLeft / timeLimit) * 100}%` }} />
              </div>
            )}
            <div className="p-5 md:p-6 space-y-5 pt-6">
              <div className="flex items-center gap-2">
                <span className="badge bg-slate-100 text-slate-500 border border-slate-200">{currentQuestion.type.replace(/_/g, ' ')}</span>
                {currentQuestion.selectedList && <span className="text-[10px] text-slate-400 font-semibold">{currentQuestion.selectedList.replace('list', 'List ')}</span>}
              </div>

              <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">{currentQuestion.prompt}</p>

              {currentQuestion.type === 'match_following' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <span className="form-label block">Words</span>
                      {currentQuestion.leftWords.map((item, idx) => (
                        <button key={item.id} onClick={() => handleMatchLeftClick(idx)}
                          className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all btn-press flex justify-between items-center ${matchingLeft === idx ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : matchingPairs[idx] !== undefined ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}
                        >
                          <span className="font-semibold">{item.word}</span>
                          {matchingPairs[idx] !== undefined && <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full shrink-0">to {String.fromCharCode(65 + matchingPairs[idx])}</span>}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <span className="form-label block">Themes</span>
                      {currentQuestion.rightThemes.map((item, rightIdx) => {
                        let matchedWord = null;
                        Object.keys(matchingPairs).forEach(lk => { if (matchingPairs[lk] === rightIdx) matchedWord = currentQuestion.leftWords[lk]?.word; });
                        return (
                          <button key={rightIdx} onClick={() => handleMatchRightClick(rightIdx)}
                            className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all btn-press ${matchingLeft !== null ? 'bg-indigo-50/20 border-indigo-200 hover:bg-indigo-50 text-slate-800' : matchedWord ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white border-slate-200 text-slate-600'}`}
                          >
                            <strong className="text-slate-400 mr-1.5">{String.fromCharCode(65 + rightIdx)}.</strong>
                            {item.theme}
                            {matchedWord && <span className="ml-2 text-[9px] font-bold text-slate-400">from {matchedWord}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 pt-3">
                    <span>{matchingLeft !== null ? 'Now click a theme to pair.' : 'Click a word to start pairing.'}</span>
                    {Object.keys(matchingPairs).length > 0 && !submitted && (
                      <button onClick={clearMatchingPairs} className="text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold transition-colors btn-press">
                        <Trash2 className="w-3 h-3" /> Reset
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentQuestion.options.map(option => {
                    const isSel = selectedAnswers.includes(option);
                    const isCorrect = currentQuestion.correctAnswers.includes(option);
                    let cls = 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50';
                    if (isSel && !submitted) cls = 'bg-slate-900 border-slate-900 text-white shadow-xs';
                    else if (submitted && isCorrect) cls = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                    else if (submitted && isSel) cls = 'bg-rose-50 border-rose-300 text-rose-800';
                    else if (submitted) cls = 'bg-slate-50/40 border-slate-100 text-slate-400';
                    return (
                      <button key={option} onClick={() => handleSelectAnswer(option)}
                        className={`w-full p-3.5 rounded-xl border text-xs text-left transition-all btn-press flex items-center justify-between gap-3 ${cls}`}
                      >
                        <span className="font-semibold">{option}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {submitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                          {submitted && isSel && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                          {currentQuestion.type === 'sentence_equivalence' && !submitted && (
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSel ? 'border-white bg-white' : 'border-slate-300'}`}>
                              {isSel && <Check className="w-2.5 h-2.5 text-slate-900" />}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {timedOut && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span><strong>Time's Up!</strong> Question auto-submitted.</span>
                </div>
              )}

              {submitted && (
                <div className={`p-4 rounded-xl border space-y-3 animate-fade-in ${quizHistory[quizHistory.length - 1]?.isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                  <span className="form-label block">Explanation</span>
                  {currentQuestion.type === 'match_following' && (
                    <div className="text-xs space-y-1.5 pb-2 border-b border-slate-100 mb-2">
                      {currentQuestion.leftWords.map(l => {
                        const ri = currentQuestion.correctMapping[l.id];
                        const correctTheme = currentQuestion.rightThemes[ri]?.theme;
                        const userRi = matchingPairs[l.id];
                        const userTheme = currentQuestion.rightThemes[userRi]?.theme || 'Unmatched';
                        const ok = userRi === ri;
                        return (
                          <div key={l.id} className="flex items-center gap-1.5 text-slate-800">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <strong>{l.word}</strong> &rarr; {correctTheme}
                            {!ok && <span className="text-[10px] text-rose-500 italic ml-1">(yours: {userTheme})</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-slate-700 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-50">
                {!submitted ? (
                  <button onClick={() => handleSubmitAnswer(false)} className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-6 py-3 rounded-xl btn-press">
                    Submit Answer
                  </button>
                ) : (
                  <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl btn-press flex items-center gap-2">
                    {currentIdx + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {quizMode === 'results' && (
        <div className="space-y-5 animate-scale-in">
          <div className="card p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900">Practice Test Complete</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">Keep practicing to target difficult vocabulary clusters.</p>
            </div>
            <div className="flex gap-3 max-w-xs mx-auto">
              <div className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="form-label block mb-1">Score</span>
                <span className="text-3xl font-extrabold text-slate-900">{score}<span className="text-lg text-slate-400 font-bold">/{questions.length}</span></span>
              </div>
              <div className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="form-label block mb-1">Accuracy</span>
                <span className="text-3xl font-extrabold text-slate-900">{questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}<span className="text-lg text-slate-400 font-bold">%</span></span>
              </div>
            </div>
            <div className="flex gap-3 max-w-xs mx-auto">
              <button onClick={handleRestartQuiz} className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 rounded-xl btn-press flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>
              <button onClick={handleConfigureNew} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-50 btn-press">
                New Settings
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              Detailed Item Review
            </h3>
            <div className="divide-y divide-slate-100">
              {quizHistory.map((item, idx) => {
                const q = item.question;
                const isOpen = reviewExpanded[idx] || false;
                return (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <button onClick={() => toggleReview(idx)} className="w-full flex justify-between items-start text-left">
                      <div className="space-y-0.5 pr-4 min-w-0">
                        <span className="form-label">Q{idx + 1} &middot; {q.type.replace(/_/g, ' ')}</span>
                        <p className="text-xs text-slate-700 font-semibold leading-snug line-clamp-1">{q.prompt.substring(0, 90)}&hellip;</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-0.5">
                        {item.timedOut && <span className="badge bg-amber-50 text-amber-600 border border-amber-100">Timed Out</span>}
                        {item.isCorrect
                          ? <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-100"><Check className="w-2.5 h-2.5 mr-0.5" />Correct</span>
                          : <span className="badge bg-rose-50 text-rose-600 border border-rose-100">Wrong</span>
                        }
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="mt-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-xs space-y-3 animate-fade-in">
                        <p className="font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">{q.prompt}</p>
                        <div className="space-y-1.5">
                          <div>
                            <span className="text-slate-400 mr-1.5">Correct:</span>
                            {q.type === 'match_following' ? (
                              <div className="pl-3 mt-1 space-y-0.5 font-mono text-[11px] text-slate-600">
                                {q.leftWords.map(l => <div key={l.id}>{l.word} &rarr; {q.rightThemes[q.correctMapping[l.id]]?.theme}</div>)}
                              </div>
                            ) : (
                              <span className="font-bold text-slate-900">{q.correctAnswers.join(', ')}</span>
                            )}
                          </div>
                          {q.type !== 'match_following' && (
                            <div>
                              <span className="text-slate-400 mr-1.5">Your Answer:</span>
                              <span className={`font-bold ${item.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {item.selected?.length ? item.selected.join(', ') : 'No Selection'}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-500 italic leading-relaxed border-t border-slate-100 pt-3">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}