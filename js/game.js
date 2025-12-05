

window.selectGameMode = function(mode) {
    state.gameMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        const isSelected = btn.dataset.mode === mode;
        if(isSelected) {
            btn.classList.add('bg-medical-50', 'dark:bg-medical-900/20', 'border-medical-500');
            btn.classList.remove('border-slate-200', 'dark:border-slate-700');
        } else {
            btn.classList.remove('bg-medical-50', 'dark:bg-medical-900/20', 'border-medical-500');
            btn.classList.add('border-slate-200', 'dark:border-slate-700');
        }
    });
    const strategyOpts = document.getElementById('strategy-options');
    const limitOpts = document.getElementById('question-limit-options');
    const startBtnText = document.getElementById('start-btn-text');
    const progressContainer = document.getElementById('bank-progress-container');
    const limitBtns = document.querySelectorAll('.limit-btn');
    
    const toggle = (el, show) => { if(el) show ? el.classList.remove('hidden') : el.classList.add('hidden'); };

    // Helper to manage children visibility safely
    const updateStrategyChildren = (showTeams, showGrid) => {
        if (strategyOpts && strategyOpts.children.length >= 2) {
            // Child 0 is Teams, Child 1 is Grid Width
            if(showTeams) strategyOpts.children[0].classList.remove('hidden');
            else strategyOpts.children[0].classList.add('hidden');

            if(showGrid) strategyOpts.children[1].classList.remove('hidden');
            else strategyOpts.children[1].classList.add('hidden');
        }
    };

    if(mode === 'strategy') {
        toggle(strategyOpts, true);
        updateStrategyChildren(true, true); // Show Teams and Grid
        toggle(limitOpts, false);
        toggle(progressContainer, false);
        if(startBtnText) startBtnText.innerText = getText('startGame');
    } else if (mode === 'solo') {
        toggle(strategyOpts, false);
        toggle(limitOpts, true);
        
        // Restore solo limits safely
        if(limitBtns.length >= 3) {
            limitBtns[0].innerText = "10"; limitBtns[0].onclick = () => selectQuestionLimit(10);
            limitBtns[1].innerText = "50"; limitBtns[1].onclick = () => selectQuestionLimit(50);
            limitBtns[2].innerText = "100"; limitBtns[2].onclick = () => selectQuestionLimit(100);
        }
        selectQuestionLimit(10);

        if (state.category !== 'general') {
            toggle(progressContainer, true);
        } else {
            toggle(progressContainer, false);
        }
        if(startBtnText) startBtnText.innerText = getText('startQuiz');
        if (state.category !== 'general') updateBankStats();
    } else if (mode === 'millionaire') {
        toggle(strategyOpts, false);
        toggle(limitOpts, false);
        toggle(progressContainer, false);
        if(startBtnText) startBtnText.innerText = getText('beginRes');
    } else if (mode === 'points') {
        // Re-order DOM: Ensure Teams (strategyOpts) is before Questions (limitOpts)
        if (strategyOpts && limitOpts && strategyOpts.parentNode) {
            strategyOpts.parentNode.insertBefore(strategyOpts, limitOpts);
        }

        toggle(strategyOpts, true);
        updateStrategyChildren(true, false); // Show Teams, Hide Grid
        toggle(limitOpts, true);
        toggle(progressContainer, false);
        
        // Set specific limits for points battle safely
        if(limitBtns.length >= 3) {
            limitBtns[0].innerText = "30"; limitBtns[0].onclick = () => selectQuestionLimit(30);
            limitBtns[1].innerText = "60"; limitBtns[1].onclick = () => selectQuestionLimit(60);
            limitBtns[2].innerText = "120"; limitBtns[2].onclick = () => selectQuestionLimit(120);
        }
        selectQuestionLimit(30); // Default to 30

        if(startBtnText) startBtnText.innerText = getText('beginBattle');
    }
};

window.selectSpecialty = function(type) {
    const index = state.selectedTopics.indexOf(type);
    if (index > -1) {
        state.selectedTopics.splice(index, 1);
    } else {
        state.selectedTopics.push(type);
    }
    
    updateTopicButtonsUI();
    
    if(state.gameMode === 'solo' && state.category !== 'general') updateBankStats();
};

window.updateBankStats = async function() {
    if (state.category === 'general') return;

    const textEl = document.getElementById('bank-stats-text');
    const barEl = document.getElementById('bank-progress-bar');
    
    if(!textEl || !barEl) return;

    if (state.selectedTopics.length === 0) {
        textEl.innerText = "0/0";
        barEl.style.width = "0%";
        return;
    }

    let totalQuestions = 0;
    let totalSolved = 0;
    const solvedIDs = getSolvedIDs();

    for (const topic of state.selectedTopics) {
        const bank = await loadQuestionBank(topic);
        if (bank && bank.length > 0) {
            totalQuestions += bank.length;
            totalSolved += bank.filter(q => solvedIDs.includes(q.id)).length;
        }
    }
    
    if(totalQuestions === 0) {
        textEl.innerText = "0/0";
        barEl.style.width = "0%";
        return;
    }

    const percent = Math.round((totalSolved / totalQuestions) * 100);
    textEl.innerText = `${totalSolved}/${totalQuestions} (${percent}%)`;
    barEl.style.width = `${percent}%`;
};

window.selectQuestionLimit = function(limit) {
    state.questionLimit = parseInt(limit);
    document.querySelectorAll('.limit-btn').forEach(btn => {
        // Loose equality to match innerText values if needed
        if(parseInt(btn.innerText) === state.questionLimit) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.remove('border-slate-200', 'dark:border-slate-600');
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.add('border-slate-200', 'dark:border-slate-600');
        }
    });
};

window.selectPlayerCount = function(count) {
    state.activePlayersCount = count;
    document.querySelectorAll('.player-btn').forEach(btn => {
        if(parseInt(btn.dataset.count) === count) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.remove('border-slate-200', 'dark:border-slate-600');
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.add('border-slate-200', 'dark:border-slate-600');
        }
    });
};

window.selectGridWidth = function(cols) {
    state.activeColCount = cols;
    document.querySelectorAll('.grid-btn').forEach(btn => {
        if(parseInt(btn.dataset.cols) === cols) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.remove('border-slate-200', 'dark:border-slate-600');
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.add('border-slate-200', 'dark:border-slate-600');
        }
    });
};

window.startGame = async function() {
    if (state.selectedTopics.length === 0) {
        alert(state.lang === 'ar' ? "يرجى اختيار موضوع واحد على الأقل" : "Please select at least one topic.");
        return;
    }

    let db = [];
    
    for (const topic of state.selectedTopics) {
        const questions = await loadQuestionBank(topic);
        db = db.concat(questions);
    }
    
    if (state.gameMode === 'solo') {
        const solvedIDs = getSolvedIDs();
        db = db.filter(q => !solvedIDs.includes(q.id));
        
        if (db.length === 0) {
            alert(state.lang === 'ar' ? "لقد أنهيت جميع الأسئلة في المواضيع المختارة!" : "Congratulations! You have completed all questions in the selected topics!");
            return;
        }
    }

    const setupModal = document.getElementById('setup-modal');
    if(setupModal) setupModal.classList.add('hidden');
    
    const reviewBtn = document.getElementById('sidebar-review-container');
    if(reviewBtn) {
        reviewBtn.classList.remove('max-h-12', 'opacity-100');
        reviewBtn.classList.add('max-h-0', 'opacity-0');
    }
    
    state.history = [];
    state.gameActive = true;
    const histCont = document.getElementById('history-container');
    if(histCont) histCont.innerHTML = '';

    // Reset UIs safely
    const els = ['strategy-ui', 'solo-ui', 'millionaire-ui', 'points-battle-ui'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    const soloUI = document.getElementById('solo-ui');
    if(soloUI) soloUI.classList.remove('flex');

    if(state.gameMode === 'solo') {
        state.questionQueue = db.sort(() => Math.random() - 0.5);
        state.soloScore = 0;
        state.soloTotal = 0;
        if(soloUI) {
            soloUI.classList.remove('hidden');
            soloUI.classList.add('flex');
        }
        setTimeout(showQuestion, 300); 
    } 
    else if (state.gameMode === 'millionaire') {
        // Tiered queue logic for millionaire
        const easy = db.filter(q => parseInt(q.difficulty || 1) === 1).sort(() => Math.random() - 0.5);
        const medium = db.filter(q => parseInt(q.difficulty || 2) === 2).sort(() => Math.random() - 0.5);
        const hard = db.filter(q => parseInt(q.difficulty || 3) === 3).sort(() => Math.random() - 0.5);
        
        let tieredQueue = [];
        tieredQueue.push(...easy.slice(0, 5));
        tieredQueue.push(...medium.slice(0, 5));
        tieredQueue.push(...hard.slice(0, 5));
        
        if (tieredQueue.length < 15) {
            const usedIds = new Set(tieredQueue.map(q => q.id || q.q));
            const remaining = db.filter(q => !usedIds.has(q.id || q.q)).sort(() => Math.random() - 0.5);
            const needed = 15 - tieredQueue.length;
            tieredQueue.push(...remaining.slice(0, needed));
        }
        state.questionQueue = tieredQueue;

        state.ladderIndex = 0;
        state.safeAmount = 0;
        state.lifelines = { '5050': true, 'poll': true, 'consult': true };
        const milUI = document.getElementById('millionaire-ui');
        if(milUI) {
            milUI.classList.remove('hidden');
            milUI.classList.add('flex');
        }
        renderLadder();
        updateMillionaireDisplay();
    }
    else if (state.gameMode === 'points') {
        // Points Battle Setup
        state.currentPlayerIndex = 0;
        state.playerScores = {};
        for(let i=1; i<=state.activePlayersCount; i++) {
            state.playerScores[i] = 0;
        }
        
        state.pointsBattleRemaining = state.questionLimit;
        state.pointsBattleTotalQ = state.questionLimit;
        state.isStealMode = false;
        state.stealingPlayerIndex = -1;
        
        // We store the full DB in queue to sample from later
        state.questionQueue = db; 
        
        initPointsBattle();
    }
    else {
        // Strategy
        state.questionQueue = db.sort(() => Math.random() - 0.5);
        state.currentPlayerIndex = 0;
        state.board = Array(ROWS).fill().map(() => Array(state.activeColCount).fill(0));
        state.playerScores = {};
        for(let i=1; i<=state.activePlayersCount; i++) {
            state.playerScores[i] = 0;
        }
        const stratUI = document.getElementById('strategy-ui');
        if(stratUI) stratUI.classList.remove('hidden');
        renderGrid();
        renderSelectors();
        renderScoreboard();
        renderHeaders();
    }
};

window.showQuestion = function() {
    if(state.questionQueue.length === 0 && state.gameMode !== 'points') {
        if (state.gameMode === 'solo') showSoloSummary();
        return;
    }
    
    if (state.gameMode === 'strategy' && state.targetDifficulty) {
        // Find first available question of target difficulty
        const idx = state.questionQueue.findIndex(q => parseInt(q.difficulty || 1) === state.targetDifficulty);
        if (idx !== -1) {
            const q = state.questionQueue.splice(idx, 1)[0];
            state.currentQuestion = q;
            state.currentResult = null;
            renderQuestionModal(q);
            return;
        }
        // Fallback: if no questions of that difficulty, pick next available
    }

    // Points battle handles getting questions differently (by difficulty) in selectDifficulty
    if (state.gameMode !== 'points') {
        const q = state.questionQueue.shift();
        state.currentQuestion = q;
        state.currentResult = null;
        renderQuestionModal(q);
    }
};

window.submitAnswer = function(idx, question) {
    if (state.currentResult !== null) return;

    const isCorrect = (idx === question.correct);
    state.currentResult = isCorrect ? 'correct' : 'wrong';
    state.currentSelection = idx;
    
    if (state.gameMode === 'solo') {
        state.soloTotal++;
        if(isCorrect) {
            state.soloScore++;
            markQuestionSolved(question.id);
        } else {
            saveMistake(question, idx, state.selectedTopics[0] || 'mixed');
        }
    } else if (state.gameMode === 'strategy') {
        state.playerScores[PLAYERS_CONFIG[state.currentPlayerIndex].id] += isCorrect ? 10 : 0;
        renderScoreboard();
    } else if (state.gameMode === 'points') {
        handlePointsBattleAnswer(isCorrect);
    }
    
    // Determine player for history
    let playerForHistory = {name: 'Solo', textClass: 'text-slate-500'};
    if (state.gameMode === 'strategy') playerForHistory = PLAYERS_CONFIG[state.currentPlayerIndex];
    else if (state.gameMode === 'points') {
        const pIdx = state.isStealMode ? state.stealingPlayerIndex : state.currentPlayerIndex;
        playerForHistory = PLAYERS_CONFIG[pIdx];
    }
    
    addToHistory(playerForHistory, question, idx, isCorrect);

    updateAnswerUI(idx, question, isCorrect);
};

window.submitTypedAnswer = function(question) {
    const input = document.getElementById('riddle-input');
    const val = input ? input.value.trim() : "";
    if(!val) return;

    const normUser = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normCorrect = question.correct.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const isCorrect = normUser === normCorrect || normUser.includes(normCorrect) || normCorrect.includes(normUser);
    
    state.currentResult = isCorrect ? 'correct' : 'wrong';
    state.currentSelection = val;

    if (state.gameMode === 'solo') {
        state.soloTotal++;
        if(isCorrect) {
             state.soloScore++;
             markQuestionSolved(question.id);
        } else {
             saveMistake(question, val, 'riddles');
        }
    } else if (state.gameMode === 'points') {
        handlePointsBattleAnswer(isCorrect);
    }

    let playerForHistory = {name: 'Solo', textClass: 'text-slate-500'};
    if (state.gameMode === 'points') {
        const pIdx = state.isStealMode ? state.stealingPlayerIndex : state.currentPlayerIndex;
        playerForHistory = PLAYERS_CONFIG[pIdx];
    }

    addToHistory(
        playerForHistory,
        question,
        val,
        isCorrect
    );

    updateAnswerUI(val, question, isCorrect);
};
