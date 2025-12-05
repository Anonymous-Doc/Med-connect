
window.initGameSetup = async function() {
    // 1. Check for configuration object from HTML or fall back to URL params
    if (window.gameConfig) {
        state.lang = window.gameConfig.lang;
        state.category = window.gameConfig.category;
    } else {
        const params = new URLSearchParams(window.location.search);
        state.lang = params.get('lang') || 'en';
        state.category = params.get('cat') || 'all';
    }

    // CRITICAL: Guard clause. If this page doesn't have the setup modal, it's likely a menu page.
    // Stop initialization to prevent errors/freezing.
    const setupModal = document.getElementById('setup-modal');
    if (!setupModal) {
        // Just initialize icons if needed and exit
        if((window).lucide) lucide.createIcons();
        return;
    }

    localizeUI();

    const winnerModal = document.getElementById('winner-modal');
    if(winnerModal) winnerModal.classList.add('hidden');
    setupModal.classList.remove('hidden');
    
    // Update Review History button text based on lang
    const reviewBtnText = state.lang === 'ar' ? 'سجل المراجعة' : 'Review History';
    const reviewBtnEl = document.querySelector('#sidebar-review-container button span');
    if(reviewBtnEl) reviewBtnEl.innerText = reviewBtnText;

    const reviewBtn = document.getElementById('sidebar-review-container');
    if(reviewBtn) {
        reviewBtn.classList.remove('max-h-0', 'opacity-0');
        reviewBtn.classList.add('max-h-12', 'opacity-100');
    }
    
    // Topic Container Selection - Robust Method
    let topicContainer = document.getElementById('topic-grid');
    if (!topicContainer) {
        // Fallback: find label with data-i18n="topic" and get the next div
        const labels = Array.from(document.querySelectorAll('#setup-modal label'));
        const topicLabel = labels.find(l => l.getAttribute('data-i18n') === 'topic');
        if (topicLabel) {
            topicContainer = topicLabel.nextElementSibling;
            // Ensure it's a grid container before using
            if (!topicContainer.classList.contains('grid')) topicContainer = null;
        }
    }

    // Initialize Selected Topics - Logic Changed: Do NOT auto-select all topics
    if (!state.selectedTopics) {
        state.selectedTopics = [];
    }

    if (window.gameConfig && window.gameConfig.availableTopics) {
        const available = window.gameConfig.availableTopics;
        
        // Dynamically add or show buttons
        if (topicContainer) {
            available.forEach(t => {
                // Check if button exists in HTML
                let btn = document.getElementById(`btn-topic-${t}`);
                
                if (!btn && TOPIC_META[t]) {
                    // Create button if it doesn't exist
                    const meta = TOPIC_META[t];
                    const label = state.lang === 'ar' ? meta.labelAr : meta.label;
                    const descKey = `desc_${t}`;
                    // Positioning class based on language
                    const posClass = state.lang === 'ar' ? 'left-1' : 'right-1';

                    btn = document.createElement('button');
                    // UPDATED CLASS: Larger padding, rounded corners, gap, group, relative
                    btn.className = "specialty-btn group relative py-4 px-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 shadow-sm hover:shadow-md";
                    btn.onclick = () => selectSpecialty(t);
                    btn.dataset.type = t;
                    btn.id = `btn-topic-${t}`;
                    
                    let iconName = 'book';
                    if(t === 'geography') iconName = 'globe';
                    if(t === 'seerah') iconName = 'moon';
                    if(t === 'aqidah') iconName = 'book-open';
                    if(t === 'arabic') iconName = 'languages';
                    if(t.startsWith('surgery')) iconName = 'scissors';
                    
                    // UPDATED INNER HTML: Includes Info Icon
                    btn.innerHTML = `
                        <div onclick="showInfo(event, '${descKey}')" class="absolute top-1 ${posClass} p-1 rounded-full hover:bg-white/20 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-help">
                            <i data-lucide="info" class="w-3 h-3"></i>
                        </div>
                        <i data-lucide="${iconName}" class="w-6 h-6 text-slate-400 icon-wrapper"></i>
                        <span class="text-xs md:text-sm font-bold">${label}</span>
                    `;
                    topicContainer.appendChild(btn);
                } else if (btn) {
                    btn.classList.remove('hidden');
                }
            });
        }
    }

    // Refresh UI based on selection
    updateTopicButtonsUI();
    if((window).lucide) lucide.createIcons();

    const soloBtn = document.querySelector('button[data-mode="solo"]');
    
    // Adjust grid layout for mode buttons
    const modeGrid = document.querySelector('#setup-modal .grid:not(#topic-grid)'); 
    if(modeGrid) {
        if (document.querySelector('button[data-mode="points"]')) {
             // If points mode exists, we have 4 buttons. 
             // Ensure grid can handle them. On mobile 2 cols, PC 4 cols handled by HTML classes.
        } else {
             // If fewer buttons, layout handles itself
        }
    }
    
    // Persist Game Settings or Set Defaults if first time
    if (!state.gameMode) {
        if (state.category === 'general') {
            state.gameMode = 'millionaire';
            if(soloBtn) soloBtn.classList.add('hidden');
        } else {
            state.gameMode = 'solo';
            if(soloBtn) soloBtn.classList.remove('hidden');
        }
    } else {
        // Ensure buttons are visible correctly for re-play
        if (state.category === 'general') {
             if(soloBtn) soloBtn.classList.add('hidden');
        } else {
             if(soloBtn) soloBtn.classList.remove('hidden');
        }
    }

    if (!state.activePlayersCount) state.activePlayersCount = 2;
    if (!state.activeColCount) state.activeColCount = 10;
    if (!state.questionLimit) state.questionLimit = 9999;

    // Apply visual selections based on state
    selectGameMode(state.gameMode);
    selectPlayerCount(state.activePlayersCount);
    selectGridWidth(state.activeColCount);
    selectQuestionLimit(state.questionLimit);
    
    // SIDEBAR INITIALIZATION - OVERLAY MODE
    state.isSidebarOpen = false; // Always closed by default for cleaner UI
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isRTL = state.lang === 'ar';
    const activeClass = isRTL ? 'translate-x-full' : '-translate-x-full';

    if (sb) {
        // Set correct side based on direction
        if (isRTL) {
            sb.classList.remove('left-0');
            sb.classList.add('right-0');
        } else {
            sb.classList.remove('right-0');
            sb.classList.add('left-0');
        }

        // Force closed state initially
        sb.classList.add(activeClass);
        
        // Ensure full width by removing any margin classes that might cause shifting
        if(main) {
            main.classList.remove('mr-64', 'ml-64', 'md:mr-64', 'md:ml-64', 'mr-56', 'ml-56'); 
            main.classList.add('mr-0', 'ml-0');
        }
    }
    
    if(state.gameMode === 'solo' && state.category !== 'general') {
        await updateBankStats();
    }
};

// New function to update UI classes for buttons
window.updateTopicButtonsUI = function() {
    document.querySelectorAll('.specialty-btn').forEach(btn => {
        const type = btn.dataset.type;
        const iconWrapper = btn.querySelector('.icon-wrapper');
        
        if(state.selectedTopics.includes(type)) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent', 'shadow-md');
            btn.classList.remove('border-slate-200', 'dark:border-slate-700');
            if(iconWrapper) { iconWrapper.classList.remove('text-slate-400'); iconWrapper.classList.add('text-white'); }
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent', 'shadow-md');
            btn.classList.add('border-slate-200', 'dark:border-slate-700');
            if(iconWrapper) { iconWrapper.classList.add('text-slate-400'); iconWrapper.classList.remove('text-white'); }
        }
    });

    // Handle topic validation error visibility
    const errorMsg = document.getElementById('topic-error');
    if(errorMsg) {
        if(state.selectedTopics.length === 0) {
            errorMsg.classList.remove('hidden');
        } else {
            errorMsg.classList.add('hidden');
        }
    }
};

window.showInfo = function(event, key) {
    event.stopPropagation();
    alert(getText(key));
};

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
            strategyOpts.children[0].classList.toggle('hidden', !showTeams);
            strategyOpts.children[1].classList.toggle('hidden', !showGrid);
        }
    };

    if(mode === 'strategy') {
        toggle(strategyOpts, true);
        updateStrategyChildren(true, true);
        toggle(limitOpts, false);
        toggle(progressContainer, false);
        if(startBtnText) startBtnText.innerText = getText('startGame');
} else if (mode === 'solo') {
        toggle(strategyOpts, false);
        toggle(limitOpts, true);
        
        if(limitBtns.length >= 4) {
            // Button 1: Infinity - Add 'text-2xl', remove 'text-sm'
            limitBtns[0].innerText = "∞"; 
            limitBtns[0].dataset.limit = "999"; 
            limitBtns[0].classList.add('text-2xl');       // Make it big
            limitBtns[0].classList.remove('text-sm', 'md:text-base'); // Remove small font classes
            limitBtns[0].onclick = () => selectQuestionLimit(999);

            // Button 2: 10 - Standard size
            limitBtns[1].innerText = "10"; 
            limitBtns[1].dataset.limit = "10"; 
            limitBtns[1].classList.remove('text-2xl');    // Ensure it's not big
            limitBtns[1].classList.add('text-sm', 'md:text-base');
            limitBtns[1].onclick = () => selectQuestionLimit(10);

            // Button 3: 50
            limitBtns[2].innerText = "50"; 
            limitBtns[2].dataset.limit = "50"; 
            limitBtns[2].classList.remove('text-2xl');
            limitBtns[2].classList.add('text-sm', 'md:text-base');
            limitBtns[2].onclick = () => selectQuestionLimit(50);
            
            // Button 4: 100
            limitBtns[3].innerText = "100"; 
            limitBtns[3].dataset.limit = "100"; 
            limitBtns[3].classList.remove('text-2xl');
            limitBtns[3].classList.add('text-sm', 'md:text-base');
            limitBtns[3].onclick = () => selectQuestionLimit(100);
        }
        
        // Select default (Infinity) if not set
        if (!state.questionLimit) selectQuestionLimit(999);
        else selectQuestionLimit(state.questionLimit);

        toggle(progressContainer, state.category !== 'general');
        if(startBtnText) startBtnText.innerText = getText('startQuiz');
        if (state.category !== 'general') updateBankStats();

    } else if (mode === 'millionaire') {
        toggle(strategyOpts, false);
        toggle(limitOpts, false);
        toggle(progressContainer, false);
        if(startBtnText) startBtnText.innerText = getText('beginRes');
    } else if (mode === 'points') {
        if (strategyOpts && limitOpts && strategyOpts.parentNode) {
            strategyOpts.parentNode.insertBefore(strategyOpts, limitOpts);
        }

        toggle(strategyOpts, true);
        updateStrategyChildren(true, false);
        toggle(limitOpts, true);
        toggle(progressContainer, false);
        
        // FIX: Explicitly update dataset.limit for Points mode too
        if(limitBtns.length >= 3) {
            limitBtns[0].innerText = "30"; 
            limitBtns[0].dataset.limit = "30";
            limitBtns[0].onclick = () => selectQuestionLimit(30);
            
            limitBtns[1].innerText = "60"; 
            limitBtns[1].dataset.limit = "60";
            limitBtns[1].onclick = () => selectQuestionLimit(60);
            
            limitBtns[2].innerText = "120"; 
            limitBtns[2].dataset.limit = "120";
            limitBtns[2].onclick = () => selectQuestionLimit(120);
        }
        selectQuestionLimit(30);

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
        // Safe check using dataset
        const btnLimit = parseInt(btn.dataset.limit);
        
        if(btnLimit === state.questionLimit) {
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
    // 1. CRITICAL FIX: Stop if limit reached (999 is Infinity)
    if (state.gameMode === 'solo' && state.questionLimit !== 9999 && state.soloTotal >= state.questionLimit) {
        showSoloSummary();
        return;
    }

    // 2. Stop if queue is empty
    if(state.questionQueue.length === 0 && state.gameMode !== 'points') {
        if (state.gameMode === 'solo') showSoloSummary();
        return;
    }
    
    // Strategy difficulty logic
    if (state.gameMode === 'strategy' && state.targetDifficulty) {
        const idx = state.questionQueue.findIndex(q => parseInt(q.difficulty || 1) === state.targetDifficulty);
        if (idx !== -1) {
            const q = state.questionQueue.splice(idx, 1)[0];
            state.currentQuestion = q;
            state.currentResult = null;
            renderQuestionModal(q);
            return;
        }
    }

    // Standard show logic
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

// Auto-initialize on load to ensure dynamic content is generated
document.addEventListener('DOMContentLoaded', () => {
    if (window.initGameSetup) window.initGameSetup();
});