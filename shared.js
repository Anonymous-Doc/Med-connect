

// Translations
const TRANSLATIONS = {
    en: {
        reviewHistory: "Review History",
        sessionHistory: "Session History",
        noHistory: "No questions answered yet.",
        newSession: "New Session",
        clickDrop: "Click column to drop.",
        soloTitle: "Solo Quiz",
        soloDesc: "Focus on accuracy.",
        resume: "Resume Quiz",
        nextPrize: "Next Prize",
        currentQ: "Current Question",
        revealQ: "Reveal Question",
        ladder: "Career Ladder",
        config: "Configuration",
        mode: "Mode",
        mSolo: "Solo",
        mQuiz: "Quiz",
        mConnect: "Connect 4",
        mStrategy: "Strategy",
        mResidency: "Residency",
        mHighStakes: "High Stakes",
        topic: "Topic",
        tMixed: "All Topics",
        tDerma: "Derma",
        tPatho: "Patho",
        tRiddles: "Riddles",
        progress: "Bank Progress",
        resetHist: "Reset History",
        questions: "Questions",
        teams: "Teams",
        gridWidth: "Grid Width",
        startGame: "Start Game",
        startQuiz: "Start Quiz",
        beginRes: "Begin Residency",
        loading: "Loading...",
        lVitals: "Vitals",
        lConsult: "Consult",
        finishEarly: "Finish Early",
        mistakes: "Mistakes",
        flagged: "Flagged",
        fAll: "All",
        clearList: "Clear List",
        playAgain: "Play Again",
        correct: "Correct!",
        wrong: "Wrong!",
        goodJob: "Good Job!",
        answerRevealed: "Answer Revealed",
        correctAnswer: "The correct answer is:",
        yourAnswer: "Your Answer:",
        nextQuestion: "Next Question",
        continueClimb: "Continue Climbing",
        seeResults: "See Results",
        dropPiece: "Drop Piece",
        endTurn: "End Turn",
        giveUp: "I give up, show me the answer",
        submit: "Submit Answer",
        typeAnswer: "Type your answer here...",
        victory: "VICTORY!",
        completed: "COMPLETED!",
        eliminated: "ELIMINATED!",
        youWin: "Wins!",
        score: "Score",
        noItems: "No items found."
    },
    ar: {
        reviewHistory: "سجل المراجعة",
        sessionHistory: "سجل الجلسة",
        noHistory: "لم يتم الإجابة على أي سؤال بعد.",
        newSession: "جلسة جديدة",
        clickDrop: "انقر على العمود للإسقاط.",
        soloTitle: "اختبار فردي",
        soloDesc: "ركز على الدقة.",
        resume: "استكمال الاختبار",
        nextPrize: "الجائزة التالية",
        currentQ: "السؤال الحالي",
        revealQ: "كشف السؤال",
        ladder: "سلم المسار المهني",
        config: "الإعدادات",
        mode: "النمط",
        mSolo: "فردي",
        mQuiz: "اختبار",
        mConnect: "توصيل 4",
        mStrategy: "استراتيجية",
        mResidency: "الإقامة",
        mHighStakes: "تحدي عالي",
        topic: "الموضوع",
        tMixed: "كل المواضيع",
        tDerma: "جلدية",
        tPatho: "باثولوجي",
        tRiddles: "أحجيات",
        progress: "تقدم البنك",
        resetHist: "إعادة تعيين",
        questions: "الأسئلة",
        teams: "الفرق",
        gridWidth: "عرض الشبكة",
        startGame: "ابدأ اللعبة",
        startQuiz: "ابدأ الاختبار",
        beginRes: "ابدأ الإقامة",
        loading: "جار التحميل...",
        lVitals: "العلامات الحيوية",
        lConsult: "استشارة",
        finishEarly: "إنهاء مبكر",
        mistakes: "أخطاء",
        flagged: "محفوظة",
        fAll: "الكل",
        clearList: "مسح القائمة",
        playAgain: "العب مرة أخرى",
        correct: "صحيح!",
        wrong: "خطأ!",
        goodJob: "أحسنت!",
        answerRevealed: "تم كشف الإجابة",
        correctAnswer: "الإجابة الصحيحة هي:",
        yourAnswer: "إجابتك:",
        nextQuestion: "السؤال التالي",
        continueClimb: "تابع الصعود",
        seeResults: "النتائج",
        dropPiece: "إسقاط القطعة",
        endTurn: "إنهاء الدور",
        giveUp: "استسلم، أرني الإجابة",
        submit: "إرسال الإجابة",
        typeAnswer: "اكتب إجابتك هنا...",
        victory: "انتصار!",
        completed: "مكتمل!",
        eliminated: "تم الإقصاء!",
        youWin: "فاز!",
        score: "النتيجة",
        noItems: "لا توجد عناصر."
    }
};

const PLAYERS_CONFIG = [
    { id: 1, name: "Red", colorClass: "bg-red-500", ringClass: "ring-red-500", textClass: "text-red-500", bgLight: "bg-red-100", bgDark: "bg-red-900/30" },
    { id: 2, name: "Yellow", colorClass: "bg-yellow-400", ringClass: "ring-yellow-400", textClass: "text-yellow-400", bgLight: "bg-yellow-100", bgDark: "bg-yellow-900/30" },
    { id: 3, name: "Green", colorClass: "bg-green-500", ringClass: "ring-green-500", textClass: "text-green-500", bgLight: "bg-green-100", bgDark: "bg-green-900/30" },
    { id: 4, name: "Purple", colorClass: "bg-purple-500", ringClass: "ring-purple-500", textClass: "text-purple-500", bgLight: "bg-purple-100", bgDark: "bg-purple-900/30" },
    { id: 5, name: "Cyan", colorClass: "bg-cyan-400", ringClass: "ring-cyan-400", textClass: "text-cyan-400", bgLight: "bg-cyan-100", bgDark: "bg-cyan-900/30" },
    { id: 6, name: "Orange", colorClass: "bg-orange-500", ringClass: "ring-orange-500", textClass: "text-orange-500", bgLight: "bg-orange-100", bgDark: "bg-orange-900/30" }
];

const LADDER = [
    { val: 100, safe: false }, { val: 200, safe: false }, { val: 300, safe: false },
    { val: 500, safe: true },
    { val: 1000, safe: false }, { val: 2000, safe: false }, { val: 4000, safe: false },
    { val: 8000, safe: true },
    { val: 16000, safe: false }, { val: 32000, safe: false }, { val: 64000, safe: false },
    { val: 125000, safe: true },
    { val: 250000, safe: false }, { val: 500000, safe: false }, { val: 1000000, safe: true }
];

let loadedDerma = null;
let loadedPatho = null;
let loadedRiddles = null;
let loadedGeography = null;
let loadedSeerah = null;

// --- PERSISTENCE LOGIC ---
const STORAGE_KEY_SOLVED = 'medconnect_solved_ids';
const STORAGE_KEY_MISTAKES = 'medconnect_mistakes';
const STORAGE_KEY_FLAGGED = 'medconnect_flagged';

function getScopedKey(baseKey) {
    return `${baseKey}_${state.lang || 'en'}`;
}

function getSolvedIDs() {
    const stored = localStorage.getItem(getScopedKey(STORAGE_KEY_SOLVED));
    return stored ? JSON.parse(stored) : [];
}

function markQuestionSolved(id) {
    const solved = getSolvedIDs();
    if (!solved.includes(id)) {
        solved.push(id);
        localStorage.setItem(getScopedKey(STORAGE_KEY_SOLVED), JSON.stringify(solved));
    }
}

function resetProgress() {
    if(confirm("Are you sure you want to reset your learning progress?")) {
        localStorage.removeItem(getScopedKey(STORAGE_KEY_SOLVED));
        if (typeof updateBankStats === 'function') {
            updateBankStats();
        }
    }
}

// --- MISTAKES HISTORY ---
function saveMistake(question, userAnswerIdx, topic) {
    const mistakes = getMistakes();
    const today = new Date().toISOString().split('T')[0];
    const entry = {
        id: question.id,
        q: question,
        userIdx: userAnswerIdx,
        date: today,
        timestamp: Date.now(),
        topic: topic
    };
    mistakes.unshift(entry); 
    if (mistakes.length > 200) mistakes.pop();
    localStorage.setItem(getScopedKey(STORAGE_KEY_MISTAKES), JSON.stringify(mistakes));
}

function getMistakes() {
    const stored = localStorage.getItem(getScopedKey(STORAGE_KEY_MISTAKES));
    return stored ? JSON.parse(stored) : [];
}

function clearMistakes(filter = 'all') {
    let msg = "Clear all mistake history?";
    if(filter !== 'all') msg = `Clear ${filter.toUpperCase()} mistake history?`;
    
    if(confirm(msg)) {
        if(filter === 'all') {
            localStorage.removeItem(getScopedKey(STORAGE_KEY_MISTAKES));
        } else {
            let mistakes = getMistakes();
            mistakes = mistakes.filter(m => {
                let t = m.topic || '';
                if(!t && m.q && m.q.id) {
                    if(m.q.id.startsWith('dermatology')) t = 'derma';
                    else if (m.q.id.startsWith('clinical')) t = 'patho';
                    else if (m.q.id.startsWith('riddles')) t = 'riddles';
                    else if (m.q.id.startsWith('geo')) t = 'geography';
                    else if (m.q.id.startsWith('seerah')) t = 'seerah';
                }
                return t !== filter;
            });
            localStorage.setItem(getScopedKey(STORAGE_KEY_MISTAKES), JSON.stringify(mistakes));
        }
        return true;
    }
    return false;
}

// --- FLAGGED QUESTIONS ---
function toggleFlagQuestion(question, topic) {
    let flagged = getFlagged();
    const existingIndex = flagged.findIndex(f => f.id === question.id);
    
    if (existingIndex > -1) {
        flagged.splice(existingIndex, 1); // Remove
    } else {
        flagged.unshift({
            id: question.id,
            q: question,
            date: new Date().toISOString().split('T')[0],
            topic: topic
        });
    }
    localStorage.setItem(getScopedKey(STORAGE_KEY_FLAGGED), JSON.stringify(flagged));
    return existingIndex === -1;
}

function isQuestionFlagged(id) {
    const flagged = getFlagged();
    return flagged.some(f => f.id === id);
}

function getFlagged() {
    const stored = localStorage.getItem(getScopedKey(STORAGE_KEY_FLAGGED));
    return stored ? JSON.parse(stored) : [];
}

function clearFlagged(filter = 'all') {
    let msg = "Clear all flagged questions?";
    if(filter !== 'all') msg = `Clear ${filter.toUpperCase()} flagged questions?`;

    if(confirm(msg)) {
        if(filter === 'all') {
            localStorage.removeItem(getScopedKey(STORAGE_KEY_FLAGGED));
        } else {
            let flagged = getFlagged();
            flagged = flagged.filter(f => {
                let t = f.topic || '';
                if(!t && f.q && f.q.id) {
                    if(f.q.id.startsWith('dermatology')) t = 'derma';
                    else if (f.q.id.startsWith('clinical')) t = 'patho';
                    else if (f.q.id.startsWith('riddles')) t = 'riddles';
                    else if (f.q.id.startsWith('geo')) t = 'geography';
                    else if (f.q.id.startsWith('seerah')) t = 'seerah';
                }
                return t !== filter;
            });
            localStorage.setItem(getScopedKey(STORAGE_KEY_FLAGGED), JSON.stringify(flagged));
        }
        return true;
    }
    return false;
}
// -------------------------

async function loadQuestionBank(type) {
    const startBtn = document.querySelector('#setup-modal button[onclick="startGame()"]');
    
    // Determine language and base path from config or defaults
    const lang = state.lang || 'en';
    const config = window.gameConfig || {};
    const basePath = config.basePath || '';
    
    // Construct default global path
    const globalPrefix = `${basePath}qbank/${lang}/`;
    
    // Helper to get URL: prefers specific topic config, falls back to global path
    const getUrl = (topicKey, defaultFile) => {
        if (config.topics && config.topics[topicKey]) {
            return config.topics[topicKey];
        }
        return globalPrefix + defaultFile;
    };
    
    const needsDerma = !loadedDerma && (type === 'derma' || type === 'mixed');
    const needsPatho = !loadedPatho && (type === 'patho' || type === 'mixed');
    const needsRiddles = !loadedRiddles && (type === 'riddles' || type === 'mixed');
    const needsGeography = !loadedGeography && (type === 'geography' || type === 'mixed');
    const needsSeerah = !loadedSeerah && (type === 'seerah' || type === 'mixed');
    
    const needsFetch = needsDerma || needsPatho || needsRiddles || needsGeography || needsSeerah;
    
    if (needsFetch && startBtn) {
        startBtn.disabled = true;
        startBtn.classList.add('opacity-75', 'cursor-wait');
        const textEl = document.getElementById('start-btn-text');
        if(textEl) textEl.innerText = getText('loading');
    }

    let questions = [];

    try {
        const promises = [];
        
        if (needsDerma) {
            promises.push(
                fetch(getUrl('derma', 'dermatology.json'))
                .then(r => r.json())
                .then(d => loadedDerma = d)
                .catch(e => { console.warn("Failed to load derma:", e); loadedDerma = []; })
            );
        }
        if (needsPatho) {
            promises.push(
                fetch(getUrl('patho', 'clinical_pathology.json'))
                .then(r => r.json())
                .then(d => loadedPatho = d)
                .catch(e => { console.warn("Failed to load patho:", e); loadedPatho = []; })
            );
        }
        if (needsRiddles) {
            promises.push(
                fetch(getUrl('riddles', 'riddles.json'))
                .then(r => r.json())
                .then(d => loadedRiddles = d)
                .catch(e => { console.warn("Failed to load riddles:", e); loadedRiddles = []; })
            );
        }
        if (needsGeography) {
            promises.push(
                fetch(getUrl('geography', 'geography.json'))
                .then(r => r.json())
                .then(d => loadedGeography = d)
                .catch(e => { console.warn("Failed to load geography:", e); loadedGeography = []; })
            );
        }
        if (needsSeerah) {
            promises.push(
                fetch(getUrl('seerah', 'seerah.json'))
                .then(r => r.json())
                .then(d => loadedSeerah = d)
                .catch(e => { console.warn("Failed to load seerah:", e); loadedSeerah = []; })
            );
        }
        
        await Promise.all(promises);

        if (type === 'derma') questions = [...(loadedDerma || [])];
        else if (type === 'patho') questions = [...(loadedPatho || [])];
        else if (type === 'riddles') questions = [...(loadedRiddles || [])];
        else if (type === 'geography') questions = [...(loadedGeography || [])];
        else if (type === 'seerah') questions = [...(loadedSeerah || [])];
        else if (type === 'mixed') {
            if(loadedDerma) questions.push(...loadedDerma);
            if(loadedPatho) questions.push(...loadedPatho);
            if(loadedRiddles) questions.push(...loadedRiddles);
            if(loadedGeography) questions.push(...loadedGeography);
            if(loadedSeerah) questions.push(...loadedSeerah);
        }
        
    } catch (error) {
        console.error("Critical error loading question bank", error);
    } finally {
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-75', 'cursor-wait');
            const textEl = document.getElementById('start-btn-text');
            if(textEl) {
                if (state.gameMode === 'strategy') textEl.innerText = getText('startGame');
                else if (state.gameMode === 'millionaire') textEl.innerText = getText('beginRes');
                else textEl.innerText = getText('startQuiz');
            }
        }
        return questions;
    }
}

// SHARED STATE
let state = {
    lang: 'en',
    category: 'all', // 'general' or 'educational' or 'all'
    gameMode: 'solo',
    activePlayersCount: 2,
    activeColCount: 10,
    selectedSpecialty: 'mixed',
    questionLimit: 10,
    currentPlayerIndex: 0,
    board: [],
    playerScores: {},
    soloScore: 0,
    soloTotal: 0,
    gameActive: false,
    questionQueue: [],
    pendingColumn: null,
    isSidebarOpen: true,
    history: [],
    currentQuestion: null,
    currentResult: null,
    currentSelection: null,
    ladderIndex: 0,
    lifelines: { '5050': true, 'poll': true, 'consult': true },
    safeAmount: 0,
    reviewTab: 'mistakes',
    reviewFilter: 'all'
};

const ROWS = 10;

function getText(key) {
    return TRANSLATIONS[state.lang][key] || TRANSLATIONS['en'][key] || key;
}
