
function initPointsBattle() {
    const mainContent = document.getElementById('main-content');
    
    // Check if Points Battle UI already exists, if not create it
    let battleUI = document.getElementById('points-battle-ui');
    if (!battleUI) {
        battleUI = document.createElement('div');
        battleUI.id = 'points-battle-ui';
        battleUI.className = 'w-full flex flex-col items-center gap-3 h-full justify-center animate-fade-in hidden p-2';
        
        // Scoreboard container reuse logic
        const scoreboard = document.createElement('div');
        scoreboard.id = 'battle-scoreboard';
        scoreboard.className = 'w-full max-w-4xl flex justify-center gap-1.5 px-1 overflow-x-auto no-scrollbar py-0.5 min-h-[50px] shrink-0';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex flex-col gap-4 w-full max-w-sm';
        
        // Difficulty Buttons
        const easyBtn = createDiffBtn('easy', 'green', 100);
        const medBtn = createDiffBtn('med', 'yellow', 150);
        const hardBtn = createDiffBtn('hard', 'red', 200);
        
        buttonsContainer.appendChild(easyBtn);
        buttonsContainer.appendChild(medBtn);
        buttonsContainer.appendChild(hardBtn);

        const infoText = document.createElement('p');
        infoText.id = 'battle-info';
        infoText.className = "text-[10px] font-bold text-slate-400 mt-4 text-center";
        
        battleUI.appendChild(scoreboard);
        battleUI.appendChild(buttonsContainer);
        battleUI.appendChild(infoText);
        
        mainContent.querySelector('div.flex-1').appendChild(battleUI);
    }

    document.getElementById('points-battle-ui').classList.remove('hidden');
    renderBattleScoreboard();
    updateBattleInfo();
}

function createDiffBtn(level, color, points) {
    const btn = document.createElement('button');
    btn.className = `w-full py-4 rounded-2xl font-black text-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 border-b-4 relative overflow-hidden group bg-${color}-500 border-${color}-700 text-white`;
    
    btn.onclick = () => selectDifficulty(level, points);
    
    const content = `
        <div class="relative z-10 flex justify-between items-center px-6">
            <span>${getText('diff' + (level.charAt(0).toUpperCase() + level.slice(1)))}</span>
            <span class="bg-white/20 px-2 py-1 rounded text-sm backdrop-blur-sm">+${points}</span>
        </div>
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    `;
    btn.innerHTML = content;
    return btn;
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
        
        let activeClass = 'bg-slate-100 dark:bg-slate-800/50 border-transparent opacity-60 scale-95';
        if (isCurrent && !state.isStealMode) {
            activeClass = `bg-white dark:bg-slate-800 scale-110 shadow-xl z-10 ${p.ringClass.replace('ring-', 'border-')} border-2`;
        } else if (isStealer && state.isStealMode) {
            activeClass = `bg-white dark:bg-slate-800 scale-110 shadow-xl z-10 border-orange-500 border-2 animate-pulse`;
        }

        const card = document.createElement('div');
        card.className = `flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[70px] ${activeClass}`;
        
        // Badge for stealer
        let statusIcon = '';
        if(isStealer && state.isStealMode) {
             statusIcon = `<div class="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-0.5 shadow-sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>`;
        }

        card.innerHTML = `
            <div class="relative">
                <div class="w-3 h-3 rounded-full mb-1 ${p.colorClass}"></div>
                ${statusIcon}
            </div>
            <span class="text-[10px] font-bold ${p.textClass}">${p.name}</span>
            <span class="text-xs font-black bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded mt-1 text-slate-700 dark:text-slate-200">${score}</span>
        `;
        sb.appendChild(card);
    }
}

function updateBattleInfo() {
    const info = document.getElementById('battle-info');
    if(info) {
        info.innerText = `${getText('remainingQ')} ${state.pointsBattleRemaining} / ${state.pointsBattleTotalQ}`;
    }
}

function selectDifficulty(level, points) {
    if (state.isStealMode) return; // Should not happen if UI is blocked correctly
    
    // Filter questions
    let diffLevel = 2; // Medium default
    if (level === 'easy') diffLevel = 1;
    if (level === 'hard') diffLevel = 3;
    
    // Find available question of this difficulty not yet solved
    // We check the whole queue. In points mode, questionQueue holds ALL DB questions initially.
    // Optimization: We should shuffle and find.
    
    const availableQs = state.questionQueue.filter(q => parseInt(q.difficulty) === diffLevel);
    
    if (availableQs.length === 0) {
        // Fallback if run out of specific difficulty? Or just pick any.
        alert("No more questions of this difficulty!");
        return;
    }
    
    // Pick random
    const qIndex = Math.floor(Math.random() * availableQs.length);
    const q = availableQs[qIndex];
    
    // Remove from queue (conceptually used)
    state.questionQueue = state.questionQueue.filter(item => item !== q);
    
    state.currentQuestion = q;
    state.currentResult = null;
    state.currentDifficultyValue = points;
    state.currentSelection = null;
    
    renderQuestionModal(q);
}

function handlePointsBattleAnswer(isCorrect) {
    const pIdx = state.isStealMode ? state.stealingPlayerIndex : state.currentPlayerIndex;
    const pId = PLAYERS_CONFIG[pIdx].id;

    if (isCorrect) {
        // Award points
        state.playerScores[pId] = (state.playerScores[pId] || 0) + state.currentDifficultyValue;
    }
    // Logic for next steps (Steal or End Turn) is handled in UI (Next Button actions)
    // This function just updates data model
}

function initiateSteal() {
    state.isStealMode = true;
    // Determine stealer: simply the next player in rotation
    state.stealingPlayerIndex = (state.currentPlayerIndex + 1) % state.activePlayersCount;
    
    // Re-render modal to show steal status
    // We need to "reset" the view but keep the question revealed
    // Actually, we just update the badges and buttons
    
    document.getElementById('next-action-container').classList.add('hidden'); // Hide old buttons
    
    const player = PLAYERS_CONFIG[state.stealingPlayerIndex];
    const badge = document.getElementById('q-player-badge');
    badge.innerText = `${player.name} (${getText('stealChance')})`;
    badge.className = `px-2 py-0.5 rounded-full text-[9px] font-bold ${player.bgLight} ${player.textClass} ring-2 ring-orange-400 animate-pulse`;

    // Re-enable options for the stealer
    const opts = document.querySelectorAll('#options-container button');
    opts.forEach(btn => {
        if(!btn.classList.contains('border-red-500')) { // Keep the wrong one marked
            btn.disabled = false;
            btn.classList.remove('opacity-50');
            btn.classList.add('hover:border-medical-500', 'hover:bg-medical-50', 'dark:hover:bg-slate-800');
        }
    });
    
    // Reset result state so new answer can be submitted
    state.currentResult = null;
    
    // Update background score to show who is active
    renderBattleScoreboard();
}

function finishPointsTurn(pointsAwarded) {
    // Decrement question count
    state.pointsBattleRemaining--;
    updateBattleInfo();

    // Reset Steal Mode
    state.isStealMode = false;
    state.stealingPlayerIndex = -1;

    // Move to next player
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.activePlayersCount;

    renderBattleScoreboard();
    
    // Check Game Over
    if (state.pointsBattleRemaining <= 0) {
        endPointsBattle();
    }
}

function endPointsBattle() {
    // Find winner
    let winnerId = 1;
    let maxScore = -1;
    
    for(let i=1; i<=state.activePlayersCount; i++) {
        if(state.playerScores[i] > maxScore) {
            maxScore = state.playerScores[i];
            winnerId = i;
        }
    }
    
    const winner = PLAYERS_CONFIG[winnerId-1]; // 0-indexed config
    
    document.getElementById('winner-title').innerText = getText('victory');
    document.getElementById('winner-text').innerText = `${winner.name} ${getText('youWin')}`;
    
    const stats = document.getElementById('winner-stats');
    stats.innerText = `${getText('score')}: ${maxScore}`;
    stats.classList.remove('hidden');
    stats.classList.add('text-3xl', 'text-gold-500');
    
    document.getElementById('winner-modal').classList.remove('hidden');
}
