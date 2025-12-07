function initPointsBattle() {
    const mainContent = document.getElementById('main-content');
    
    // Explicitly clear any lingering question state so the app knows we are on the Grid
    state.currentQuestion = null;
    state.currentResult = null;

    let battleUI = document.getElementById('points-battle-ui');
    if (!battleUI) {
        battleUI = document.createElement('div');
        battleUI.id = 'points-battle-ui';
        battleUI.className = 'w-full flex flex-col items-center gap-4 h-full justify-start animate-fade-in hidden p-4 overflow-hidden';
        
        // 1. Scoreboard (Top)
        const scoreboard = document.createElement('div');
        scoreboard.id = 'battle-scoreboard';
        scoreboard.className = 'w-full max-w-5xl flex justify-center gap-2 px-1 py-2 min-h-[80px] shrink-0';
        
        // 2. The Grid Container (Scrollable if needed)
        const gridContainer = document.createElement('div');
        gridContainer.id = 'battle-grid-container';
        gridContainer.className = 'w-full max-w-6xl flex-1 overflow-auto custom-scrollbar bg-slate-800/50 rounded-2xl p-4 border border-slate-700 shadow-inner relative';
        
        battleUI.appendChild(scoreboard);
        battleUI.appendChild(gridContainer);
        
        mainContent.querySelector('div.flex-1').appendChild(battleUI);
    }

    const ui = document.getElementById('points-battle-ui');
    ui.classList.remove('hidden');
    
    renderBattleScoreboard();
    renderBattleGrid();
}

function renderBattleGrid() {
    const container = document.getElementById('battle-grid-container');
    container.innerHTML = '';
    
    const topics = state.selectedTopics;
    const colCount = topics.length;
    
    // Main Grid Layout
    const grid = document.createElement('div');
    grid.className = `grid gap-3 w-full h-full`;
    // Responsive columns: min 140px per column
    grid.style.gridTemplateColumns = `repeat(${colCount}, minmax(140px, 1fr))`;
    grid.style.gridTemplateRows = `auto repeat(${state.battleRows}, 1fr)`; // Header + Rows

    // 1. Render Headers
    topics.forEach(topic => {
        const meta = TOPIC_META[topic];
        const label = state.lang === 'ar' ? meta.labelAr : meta.label;
        
        const header = document.createElement('div');
        header.className = "bg-yellow-400 text-yellow-900 font-black text-center py-3 px-2 rounded-xl shadow-md border-b-4 border-yellow-600 flex items-center justify-center text-xs md:text-sm uppercase tracking-wider h-14";
        header.innerText = label;
        grid.appendChild(header);
    });

    // 2. Render Question Cells based on Rows (3, 6, 9)
    const rows = state.battleRows; 
    let pattern = []; 
    
    if (rows === 3) pattern = ['easy', 'med', 'hard'];
    if (rows === 6) pattern = ['easy', 'easy', 'med', 'med', 'hard', 'hard'];
    if (rows === 9) pattern = ['easy', 'easy', 'easy', 'med', 'med', 'med', 'hard', 'hard', 'hard'];

    // Iterate row by row
    for (let r = 0; r < rows; r++) {
        const diffKey = pattern[r];
        let points = 100;
        let colorClass = "text-green-600 border-green-200 hover:bg-green-50"; // Easy
        
        if (diffKey === 'med') {
            points = 150;
            colorClass = "text-blue-600 border-blue-200 hover:bg-blue-50"; // Medium
        } 
        if (diffKey === 'hard') {
            points = 200;
            colorClass = "text-red-600 border-red-200 hover:bg-red-50"; // Hard
        }

        topics.forEach(topic => {
            const bank = state.battleGrid[topic][diffKey];
            
            // Calculate index to cycle through questions if multiple rows have same difficulty
            const typeIndex = pattern.slice(0, r).filter(p => p === diffKey).length;
            
            const question = bank[typeIndex % bank.length]; 
            const uniqueId = `btn-${topic}-${diffKey}-${typeIndex}`;
            
            // Determine state (Solved or Active)
            const isSolved = state.solvedBattleIds.includes(uniqueId);

            const btn = document.createElement('button');
            
            if (isSolved) {
                btn.className = "w-full h-full min-h-[60px] rounded-xl border-2 border-slate-700 bg-slate-800 text-slate-600 font-black text-xl flex items-center justify-center cursor-not-allowed opacity-50";
                btn.innerText = ""; 
                btn.disabled = true;
            } else {
                btn.className = `w-full h-full min-h-[60px] rounded-xl border-2 font-black text-xl md:text-2xl shadow-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center bg-white ${colorClass}`;
                btn.innerText = points;
                btn.onclick = () => selectGridQuestion(question, points, uniqueId);
            }
            
            grid.appendChild(btn);
        });
    }

    container.appendChild(grid);
}

function selectGridQuestion(question, points, uniqueId) {
    if (state.isStealMode) return; 

    state.currentQuestion = question;
    state.currentResult = null;
    state.currentDifficultyValue = points;
    state.currentBattleId = uniqueId; 
    state.currentSelection = null;
    
    renderQuestionModal(question);
}

function handlePointsBattleAnswer(isCorrect) {
    const pIdx = state.isStealMode ? state.stealingPlayerIndex : state.currentPlayerIndex;
    const pId = PLAYERS_CONFIG[pIdx].id;

    if (isCorrect) {
        // Award points
        state.playerScores[pId] = (state.playerScores[pId] || 0) + state.currentDifficultyValue;
    } else {
        // Lose points if stealing and wrong
        if (state.isStealMode) {
            state.playerScores[pId] = (state.playerScores[pId] || 0) - state.currentDifficultyValue;
        }
    }
}

function initiateSteal() {
    state.isStealMode = true;
    state.stealingPlayerIndex = (state.currentPlayerIndex + 1) % state.activePlayersCount;
    
    document.getElementById('next-action-container').classList.add('hidden'); 
    
    const player = PLAYERS_CONFIG[state.stealingPlayerIndex];
    const badge = document.getElementById('q-player-badge');
    badge.innerText = `${player.name} (${getText('stealChance')})`;
    badge.className = `px-2 py-0.5 rounded-full text-[9px] font-bold ${player.bgLight} ${player.textClass} ring-2 ring-orange-400 animate-pulse`;

    // Re-enable options
    const opts = document.querySelectorAll('#options-container button');
    opts.forEach(btn => {
        if(!btn.classList.contains('border-red-500')) {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
            btn.classList.add('hover:border-medical-500', 'hover:bg-medical-50', 'dark:hover:bg-slate-800');
        }
    });
    
    state.currentResult = null;
    renderBattleScoreboard();
}

function finishPointsTurn(pointsAwarded) {
    // 1. Mark cell as solved
    if (state.currentBattleId) {
        state.solvedBattleIds.push(state.currentBattleId);
    }

    // 2. CRITICAL FIX: Clear currentQuestion so History knows we are back on the Grid
    state.currentQuestion = null;
    state.currentResult = null;

    // 3. Update Turn Logic
    state.isStealMode = false;
    state.stealingPlayerIndex = -1;
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.activePlayersCount;

    // 4. Refresh UI
    renderBattleScoreboard();
    renderBattleGrid();
    
    // 5. Check Game Over
    const totalCells = state.selectedTopics.length * state.battleRows;
    if (state.solvedBattleIds.length >= totalCells) {
        endPointsBattle();
    }
}

function renderBattleScoreboard() {
    const sb = document.getElementById('battle-scoreboard');
    if(!sb) return;
    sb.innerHTML = '';
    
    for(let i=1; i<=state.activePlayersCount; i++) {
        const p = PLAYERS_CONFIG[i-1];
        const isCurrent = (i-1) === state.currentPlayerIndex;
        const isStealer = (i-1) === state.stealingPlayerIndex;
        
        const score = state.playerScores[i] || 0;
        
        let activeClass = 'bg-slate-800 border-slate-700 opacity-60 scale-95 border';
        if (isCurrent && !state.isStealMode) {
            activeClass = `bg-slate-700 scale-105 shadow-xl z-10 ${p.ringClass.replace('ring-', 'border-')} border-2`;
        } else if (isStealer && state.isStealMode) {
            activeClass = `bg-slate-700 scale-105 shadow-xl z-10 border-orange-500 border-2 animate-pulse`;
        }

        const card = document.createElement('div');
        card.className = `flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[80px] ${activeClass}`;
        
        // Icon logic
        let statusIcon = '';
        if(isStealer && state.isStealMode) {
             statusIcon = `<div class="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 shadow-sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>`;
        }

        card.innerHTML = `
            <div class="relative">
                <div class="w-4 h-4 rounded-full mb-1 ${p.colorClass} shadow-lg shadow-${p.colorClass}/50"></div>
                ${statusIcon}
            </div>
            <span class="text-[10px] font-bold ${p.textClass} uppercase tracking-wider">${p.name}</span>
            <span class="text-xl font-black text-white mt-1">${score}</span>
        `;
        sb.appendChild(card);
    }
}

function endPointsBattle() {
    let winnerId = 1;
    let maxScore = -99999;
    
    for(let i=1; i<=state.activePlayersCount; i++) {
        if(state.playerScores[i] > maxScore) {
            maxScore = state.playerScores[i];
            winnerId = i;
        }
    }
    
    const winner = PLAYERS_CONFIG[winnerId-1];
    
    document.getElementById('winner-title').innerText = getText('victory');
    document.getElementById('winner-text').innerText = `${winner.name} ${getText('youWin')}`;
    
    const stats = document.getElementById('winner-stats');
    stats.innerText = `${getText('score')}: ${maxScore}`;
    stats.classList.remove('hidden');
    stats.classList.add('text-3xl', 'text-gold-500');
    
    document.getElementById('winner-modal').classList.remove('hidden');
}