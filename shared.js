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

async function loadQuestionBank(type) {
    const startBtn = document.querySelector('#setup-modal button');
    const originalText = document.getElementById('start-btn-text').innerText;
    
    startBtn.disabled = true;
    startBtn.classList.add('opacity-75', 'cursor-wait');
    document.getElementById('start-btn-text').innerText = "Loading...";

    let questions = [];

    try {
        if (type === 'derma') {
            if (!loadedDerma) {
                // UPDATE: Lowercase filename
                const res = await fetch('qbank/dermatology.json');
                if (!res.ok) throw new Error("File not found");
                loadedDerma = await res.json();
            }
            questions = [...loadedDerma];
        } 
        else if (type === 'patho') {
            if (!loadedPatho) {
                // UPDATE: Lowercase filename
                const res = await fetch('qbank/clinical_pathology.json');
                if (!res.ok) throw new Error("File not found");
                loadedPatho = await res.json();
            }
            questions = [...loadedPatho];
        } 
        else if (type === 'mixed') {
            // UPDATE: Lowercase filenames
            try { if (!loadedDerma) { const r = await fetch('qbank/dermatology.json'); if(r.ok) loadedDerma = await r.json(); } } catch(e){}
            try { if (!loadedPatho) { const r = await fetch('qbank/clinical_pathology.json'); if(r.ok) loadedPatho = await r.json(); } } catch(e){}
            
            if(loadedDerma) questions.push(...loadedDerma);
            if(loadedPatho) questions.push(...loadedPatho);
            
            if(questions.length === 0) throw new Error("No mixed data found");
        }
    } catch (error) {
        console.error("Could not load local JSON files.", error);
        alert("Failed to load question data. Please ensure 'qbank/dermatology.json' and 'qbank/clinical_pathology.json' exist.");
    } finally {
        startBtn.disabled = false;
        startBtn.classList.remove('opacity-75', 'cursor-wait');
        document.getElementById('start-btn-text').innerText = originalText;
        return questions;
    }
}

// SHARED STATE
let state = {
    gameMode: 'strategy',
    activePlayersCount: 2,
    activeColCount: 10,
    selectedSpecialty: 'derma',
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
    safeAmount: 0
};

const ROWS = 10;