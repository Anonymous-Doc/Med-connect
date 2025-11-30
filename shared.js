
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

// --- PERSISTENCE LOGIC ---
const STORAGE_KEY_SOLVED = 'medconnect_solved_ids';
const STORAGE_KEY_MISTAKES = 'medconnect_mistakes';
const STORAGE_KEY_FLAGGED = 'medconnect_flagged';

function getSolvedIDs() {
    const stored = localStorage.getItem(STORAGE_KEY_SOLVED);
    return stored ? JSON.parse(stored) : [];
}

function markQuestionSolved(id) {
    const solved = getSolvedIDs();
    if (!solved.includes(id)) {
        solved.push(id);
        localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(solved));
    }
}

function resetProgress() {
    if(confirm("Are you sure you want to reset your learning progress? Previously answered questions will reappear.")) {
        localStorage.removeItem(STORAGE_KEY_SOLVED);
        // Force refresh of stats
        if (typeof updateBankStats === 'function') {
            updateBankStats();
        }
    }
}

// --- MISTAKES HISTORY ---
function saveMistake(question, userAnswerIdx, topic) {
    const mistakes = getMistakes();
    // Avoid exact duplicates for the same day
    const today = new Date().toISOString().split('T')[0];
    const entry = {
        id: question.id,
        q: question,
        userIdx: userAnswerIdx,
        date: today,
        timestamp: Date.now(),
        topic: topic
    };
    mistakes.unshift(entry); // Add to top
    // Limit to last 200 mistakes to prevent localStorage bloat
    if (mistakes.length > 200) mistakes.pop();
    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));
}

function getMistakes() {
    const stored = localStorage.getItem(STORAGE_KEY_MISTAKES);
    return stored ? JSON.parse(stored) : [];
}

function clearMistakes(filter = 'all') {
    let msg = "Clear all mistake history?";
    if(filter !== 'all') msg = `Clear ${filter.toUpperCase()} mistake history?`;
    
    if(confirm(msg)) {
        if(filter === 'all') {
            localStorage.removeItem(STORAGE_KEY_MISTAKES);
        } else {
            let mistakes = getMistakes();
            // Keep items that DO NOT match the filter
            mistakes = mistakes.filter(m => {
                let t = m.topic || '';
                if(!t && m.q && m.q.id) {
                    if(m.q.id.startsWith('dermatology')) t = 'derma';
                    else if (m.q.id.startsWith('clinical')) t = 'patho';
                }
                return t !== filter;
            });
            localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));
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
    localStorage.setItem(STORAGE_KEY_FLAGGED, JSON.stringify(flagged));
    return existingIndex === -1; // Returns true if added, false if removed
}

function isQuestionFlagged(id) {
    const flagged = getFlagged();
    return flagged.some(f => f.id === id);
}

function getFlagged() {
    const stored = localStorage.getItem(STORAGE_KEY_FLAGGED);
    return stored ? JSON.parse(stored) : [];
}

function clearFlagged(filter = 'all') {
    let msg = "Clear all flagged questions?";
    if(filter !== 'all') msg = `Clear ${filter.toUpperCase()} flagged questions?`;

    if(confirm(msg)) {
        if(filter === 'all') {
            localStorage.removeItem(STORAGE_KEY_FLAGGED);
        } else {
            let flagged = getFlagged();
            // Keep items that DO NOT match the filter
            flagged = flagged.filter(f => {
                let t = f.topic || '';
                if(!t && f.q && f.q.id) {
                    if(f.q.id.startsWith('dermatology')) t = 'derma';
                    else if (f.q.id.startsWith('clinical')) t = 'patho';
                }
                return t !== filter;
            });
            localStorage.setItem(STORAGE_KEY_FLAGGED, JSON.stringify(flagged));
        }
        return true;
    }
    return false;
}
// -------------------------

async function loadQuestionBank(type) {
    const startBtn = document.querySelector('#setup-modal button[onclick="startGame()"]');
    
    // Only block UI if we are actually fetching for the first time
    const needsFetch = (type === 'derma' && !loadedDerma) || (type === 'patho' && !loadedPatho) || (type === 'mixed' && (!loadedDerma || !loadedPatho));
    
    if (needsFetch && startBtn) {
        startBtn.disabled = true;
        startBtn.classList.add('opacity-75', 'cursor-wait');
        const textEl = document.getElementById('start-btn-text');
        if(textEl) textEl.innerText = "Loading...";
    }

    let questions = [];

    try {
        // Parallel fetch if mixed
        const promises = [];
        if (!loadedDerma) promises.push(fetch('qbank/dermatology.json').then(r => r.json()).then(d => loadedDerma = d));
        if (!loadedPatho) promises.push(fetch('qbank/clinical_pathology.json').then(r => r.json()).then(d => loadedPatho = d));
        
        await Promise.all(promises);

        if (type === 'derma') questions = [...(loadedDerma || [])];
        else if (type === 'patho') questions = [...(loadedPatho || [])];
        else if (type === 'mixed') {
            if(loadedDerma) questions.push(...loadedDerma);
            if(loadedPatho) questions.push(...loadedPatho);
        }
        
    } catch (error) {
        console.error("Could not load local JSON files.", error);
        alert("Failed to load question data. Please ensure the JSON files are in the 'qbank' folder.");
    } finally {
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-75', 'cursor-wait');
            const textEl = document.getElementById('start-btn-text');
            if(textEl) {
                // Explicitly set correct text based on current mode
                if (state.gameMode === 'strategy') textEl.innerText = "Start Game";
                else if (state.gameMode === 'millionaire') textEl.innerText = "Begin Residency";
                else textEl.innerText = "Start Quiz";
            }
        }
        return questions;
    }
}

// SHARED STATE
let state = {
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
    // Review Page State
    reviewTab: 'mistakes', // 'mistakes' or 'flagged'
    reviewFilter: 'all' // 'all', 'derma', 'patho'
};

const ROWS = 10;
