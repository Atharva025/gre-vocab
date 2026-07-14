import { useState, useEffect } from 'react';
import dictionaryData from '../data/dictionary.json';

// Flatten the dictionary once for global access
export const allWordsList = [];
export const listGroupsMap = {}; // { listKey: [groupKeys...] }
export const groupWordsMap = {}; // { groupKey: [words...] }

// Build maps
for (const listKey in dictionaryData) {
  listGroupsMap[listKey] = [];
  for (const groupKey in dictionaryData[listKey]) {
    listGroupsMap[listKey].push(groupKey);
    const words = dictionaryData[listKey][groupKey];
    groupWordsMap[groupKey] = words;
    words.forEach(word => {
      const cleanWord = word.trim();
      // Avoid duplicate entries if the exact same word is in the exact same list & group
      const exists = allWordsList.some(item => item.word.toLowerCase() === cleanWord.toLowerCase() && item.list === listKey && item.group === groupKey);
      if (!exists) {
        allWordsList.push({
          word: cleanWord,
          list: listKey,
          group: groupKey
        });
      }
    });
  }
}

// Get unique words globally
export const uniqueWords = Array.from(new Set(allWordsList.map(item => item.word.toLowerCase()))).map(wordStr => {
  // Find first metadata occurrence
  return allWordsList.find(item => item.word.toLowerCase() === wordStr);
});

export function useVocabState() {
  // Word status tracking: { [word]: 'not_started' | 'learning' | 'learned' }
  const [wordStatus, setWordStatusState] = useState(() => {
    const saved = localStorage.getItem('gre_word_status');
    return saved ? JSON.parse(saved) : {};
  });

  // Starred words: Set of words
  const [starredWords, setStarredWords] = useState(() => {
    const saved = localStorage.getItem('gre_starred_words');
    return saved ? JSON.parse(saved) : [];
  });

  // API cache for dictionary definitions
  const [apiCache, setApiCache] = useState(() => {
    const saved = localStorage.getItem('gre_api_cache');
    return saved ? JSON.parse(saved) : {};
  });

  // Performance stats
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('gre_vocab_stats');
    const defaultStats = {
      streak: 0,
      totalQuizzes: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      lastActiveDate: null
    };
    return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('gre_word_status', JSON.stringify(wordStatus));
  }, [wordStatus]);

  useEffect(() => {
    localStorage.setItem('gre_starred_words', JSON.stringify(starredWords));
  }, [starredWords]);

  useEffect(() => {
    localStorage.setItem('gre_api_cache', JSON.stringify(apiCache));
  }, [apiCache]);

  useEffect(() => {
    localStorage.setItem('gre_vocab_stats', JSON.stringify(stats));
  }, [stats]);

  // Daily streak check on boot
  useEffect(() => {
    const todayStr = new Date().toDateString();
    setStats(prev => {
      if (!prev.lastActiveDate) {
        return {
          ...prev,
          streak: 1,
          lastActiveDate: todayStr
        };
      }
      
      if (prev.lastActiveDate === todayStr) {
        return prev;
      }
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (prev.lastActiveDate === yesterdayStr) {
        return {
          ...prev,
          streak: prev.streak + 1,
          lastActiveDate: todayStr
        };
      } else {
        // Streak broken
        return {
          ...prev,
          streak: 1,
          lastActiveDate: todayStr
        };
      }
    });
  }, []);

  // Update study status for a word
  const setWordStatus = (word, status) => {
    const cleanWord = word.trim().toLowerCase();
    setWordStatusState(prev => ({
      ...prev,
      [cleanWord]: status
    }));
  };

  // Toggle star
  const toggleStarred = (word) => {
    const cleanWord = word.trim().toLowerCase();
    setStarredWords(prev => {
      if (prev.includes(cleanWord)) {
        return prev.filter(w => w !== cleanWord);
      } else {
        return [...prev, cleanWord];
      }
    });
  };

  // Record quiz result
  const recordQuizResult = (correctCount, totalCount) => {
    const todayStr = new Date().toDateString();
    setStats(prev => {
      let nextStreak = prev.streak;
      if (prev.lastActiveDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        nextStreak = prev.lastActiveDate === yesterdayStr ? prev.streak + 1 : 1;
      }
      
      return {
        ...prev,
        totalQuizzes: prev.totalQuizzes + 1,
        correctAnswers: prev.correctAnswers + correctCount,
        totalAnswers: prev.totalAnswers + totalCount,
        streak: nextStreak,
        lastActiveDate: todayStr
      };
    });
  };

  // Fetch word details with cache lookup
  const getWordDetails = async (word, forceRefresh = false) => {
    const cleanWord = word.trim().toLowerCase();
    
    if (!forceRefresh && apiCache[cleanWord]) {
      return apiCache[cleanWord];
    }
    
    // Check if browser is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        word,
        phonetic: '',
        audio: '',
        meanings: [],
        found: false,
        isOffline: true
      };
    }
    
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (!res.ok) {
        // Word truly not found in online dictionary (e.g. 404)
        const fallbackPayload = {
          word,
          phonetic: '',
          audio: '',
          meanings: [],
          found: false
        };
        
        // Cache this true negative response
        setApiCache(prev => ({
          ...prev,
          [cleanWord]: fallbackPayload
        }));
        
        return fallbackPayload;
      }
      
      const data = await res.json();
      const entry = data[0] || {};
      const payload = {
        word: entry.word || word,
        phonetic: entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text) || '',
        audio: (entry.phonetics && entry.phonetics.find(p => p.audio && p.audio !== '')?.audio) || '',
        meanings: (entry.meanings || []).map(m => ({
          partOfSpeech: m.partOfSpeech || '',
          definitions: (m.definitions || []).slice(0, 3).map(d => ({
            definition: d.definition || '',
            example: d.example || '',
            synonyms: d.synonyms || [],
            antonyms: d.antonyms || []
          }))
        })),
        found: true
      };
      
      // Save valid payload to cache
      setApiCache(prev => ({
        ...prev,
        [cleanWord]: payload
      }));
      
      return payload;
    } catch (err) {
      console.warn(`Could not fetch online details for "${word}" due to network state:`, err);
      // Return transient fallback with isOffline marker so it can be retried later
      return {
        word,
        phonetic: '',
        audio: '',
        meanings: [],
        found: false,
        isOffline: true
      };
    }
  };

  // Helper stats calculations
  const totalWordsCount = uniqueWords.length;
  const learnedCount = Object.values(wordStatus).filter(status => status === 'learned').length;
  const learningCount = Object.values(wordStatus).filter(status => status === 'learning').length;
  const notStartedCount = totalWordsCount - learnedCount - learningCount;
  
  const completionPercentage = totalWordsCount > 0 ? Math.round((learnedCount / totalWordsCount) * 100) : 0;
  const learningPercentage = totalWordsCount > 0 ? Math.round((learningCount / totalWordsCount) * 100) : 0;

  // Calculate progress list wise
  const getListProgress = (listKey) => {
    const listWords = [];
    const listData = dictionaryData[listKey] || {};
    for (const groupKey in listData) {
      listData[groupKey].forEach(w => {
        const cleanW = w.trim().toLowerCase();
        if (!listWords.includes(cleanW)) {
          listWords.push(cleanW);
        }
      });
    }
    
    const total = listWords.length;
    const learned = listWords.filter(w => wordStatus[w] === 'learned').length;
    const learning = listWords.filter(w => wordStatus[w] === 'learning').length;
    const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
    
    return { total, learned, learning, percent };
  };

  return {
    wordStatus,
    starredWords,
    stats,
    setWordStatus,
    toggleStarred,
    recordQuizResult,
    getWordDetails,
    progress: {
      total: totalWordsCount,
      learned: learnedCount,
      learning: learningCount,
      notStarted: notStartedCount,
      percentComplete: completionPercentage,
      percentLearning: learningPercentage
    },
    getListProgress,
    dictionaryData
  };
}
