
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
    const setupModal = document.getElementById('setup-modal');
    if (!setupModal) {
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
    
    // Topic Container Selection
    let topicContainer = document.getElementById('topic-grid');

    // Initialize Selected Topics
    if (!state.selectedTopics) {
        state.selectedTopics = [];
    }

    if (window.gameConfig && window.gameConfig.availableTopics) {
        const available = window.gameConfig.availableTopics;
        
        // Dynamically add or show buttons
        if (topicContainer) {
            available.forEach(t => {
                let btn = document.getElementById(`btn-topic-${t}`);
                
                if (!btn && TOPIC_META[t]) {
                    const meta = TOPIC_META[t];
                    const label = state.lang === 'ar' ? meta.labelAr : meta.label;
                    const descKey = `desc_${t}`;
                    const posClass = state.lang === 'ar' ? 'left-1' : 'right-1';

                    btn = document.createElement('button');
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
    
    // Set default mode
    if (!state.gameMode) {
        if (state.category === 'general') {
            state.gameMode = 'millionaire';
            if(soloBtn) soloBtn.classList.add('hidden');
        } else {
            state.gameMode = 'solo';
            if(soloBtn) soloBtn.classList.remove('hidden');
        }
    } else {
        if (state.category === 'general') {
             if(soloBtn) soloBtn.classList.add('hidden');
        } else {
             if(soloBtn) soloBtn.classList.remove('hidden');
        }
    }

    if (!state.activePlayersCount) state.activePlayersCount = 2;
    if (!state.activeColCount) state.activeColCount = 10;
    if (!state.battleRows) state.battleRows = 3; // Default rows for Battle
    if (!state.questionLimit) state.questionLimit = 999;

    // Apply visual selections based on state
    selectGameMode(state.gameMode);
    selectPlayerCount(state.activePlayersCount);
    selectGridWidth(state.activeColCount);
    // Note: selectQuestionLimit/selectBattleRows is handled inside selectGameMode now
    
    // SIDEBAR INITIALIZATION
    state.isSidebarOpen = false;
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isRTL = state.lang === 'ar';
    const activeClass = isRTL ? 'translate-x-full' : '-translate-x-full';

    if (sb) {
        if (isRTL) {
            sb.classList.remove('left-0');
            sb.classList.add('right-0');
        } else {
            sb.classList.remove('right-0');
            sb.classList.add('left-0');
        }
        sb.classList.add(activeClass);
        if(main) {
            main.classList.remove('mr-64', 'ml-64', 'md:mr-64', 'md:ml-64', 'mr-56', 'ml-56'); 
            main.classList.add('mr-0', 'ml-0');
        }
    }
    
    if(state.gameMode === 'solo' && state.category !== 'general') {
        await updateBankStats();
    }
};

// Update UI classes for topic buttons
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
            errorMsg.innerText = state.lang === 'ar' ? "يرجى اختيار موضوع واحد على الأقل" : "Please select at least one topic.";
            errorMsg.classList.remove('hidden', 'text-orange-500');
            errorMsg.classList.add('text-red-500');
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
    const limitLabel = limitOpts ? limitOpts.querySelector('label') : null;
    const startBtnText = document.getElementById('start-btn-text');
    const progressContainer = document.getElementById('bank-progress-container');
    const limitBtns = document.querySelectorAll('.limit-btn');
    
    const toggle = (el, show) => { if(el) show ? el.classList.remove('hidden') : el.classList.add('hidden'); };

    // Update strategy options visibility
    const updateStrategyChildren = (showTeams, showGrid) => {
        if (strategyOpts && strategyOpts.children.length >= 2) {
            strategyOpts.children[0].classList.toggle('hidden', !showTeams);
            strategyOpts.children[1].classList.toggle('hidden', !showGrid);
        }
    };

    // If switching TO Points mode, enforce limit of 6 topics
    if (mode === 'points' && state.selectedTopics.length > 6) {
        state.selectedTopics = state.selectedTopics.slice(0, 6);
        updateTopicButtonsUI();
    }

    if(mode === 'strategy') {
        toggle(strategyOpts, true);
        updateStrategyChildren(true, true);
        toggle(limitOpts, false);
        toggle(progressContainer, false);
        if(startBtnText) startBtnText.innerText = getText('startGame');

    } else if (mode === 'solo') {
        toggle(strategyOpts, false);
        toggle(limitOpts, true);
        if(limitLabel) limitLabel.innerText = state.lang === 'ar' ? 'الأسئلة' : 'QUESTIONS';
        
        if(limitBtns.length >= 4) {
            // Button 1: Infinity
            limitBtns[0].innerText = "∞"; 
            limitBtns[0].dataset.limit = "999"; 
            limitBtns[0].classList.add('text-2xl');
            limitBtns[0].classList.remove('text-sm', 'md:text-base');
            limitBtns[0].onclick = () => selectQuestionLimit(999);

            // Button 2: 10
            limitBtns[1].innerText = "10"; 
            limitBtns[1].dataset.limit = "10"; 
            limitBtns[1].classList.remove('text-2xl');
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
            limitBtns[3].classList.remove('hidden');
        }
        
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
        updateStrategyChildren(true, false); // Show Teams, Hide Connect4 Grid
        toggle(limitOpts, true);
        toggle(progressContainer, false);
        
        // --- NEW ROWS LOGIC ---
        if(limitLabel) limitLabel.innerText = state.lang === 'ar' ? 'عدد الصفوف' : 'ROWS';
        
        if(limitBtns.length >= 3) {
            // Rows Options: 3, 6, 9
            limitBtns[0].innerText = "3"; 
            limitBtns[0].classList.remove('text-2xl');
            limitBtns[0].classList.add('text-sm', 'md:text-base');
            limitBtns[0].onclick = () => selectBattleRows(3);
            
            limitBtns[1].innerText = "6"; 
            limitBtns[1].classList.remove('text-2xl');
            limitBtns[1].classList.add('text-sm', 'md:text-base');
            limitBtns[1].onclick = () => selectBattleRows(6);
            
            limitBtns[2].innerText = "9"; 
            limitBtns[2].classList.remove('text-2xl');
            limitBtns[2].classList.add('text-sm', 'md:text-base');
            limitBtns[2].onclick = () => selectBattleRows(9);
            
            // Hide 4th button
            if(limitBtns[3]) limitBtns[3].classList.add('hidden');
        }
        selectBattleRows(state.battleRows || 3);

        if(startBtnText) startBtnText.innerText = getText('beginBattle');
    }
};

window.selectSpecialty = function(type) {
    const index = state.selectedTopics.indexOf(type);
    
    // Points Battle Logic: Max 6 Topics
    if (state.gameMode === 'points' && index === -1 && state.selectedTopics.length >= 6) {
        const errorMsg = document.getElementById('topic-error');
        if(errorMsg) {
            errorMsg.innerText = state.lang === 'ar' ? "الحد الأقصى ٦ مواضيع في وضع المعركة" : "Max 6 topics in Points Battle";
            errorMsg.classList.remove('hidden', 'text-red-500');
            errorMsg.classList.add('text-orange-500');
            setTimeout(() => errorMsg.classList.add('hidden'), 3000);
        }
        return;
    }

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
        // Only run this check if we are in Solo mode (Points mode uses Rows)
        if (state.gameMode === 'solo') {
            const btnLimit = parseInt(btn.dataset.limit);
            if(btnLimit === state.questionLimit) {
                btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
                btn.classList.remove('border-slate-200', 'dark:border-slate-600');
            } else {
                btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
                btn.classList.add('border-slate-200', 'dark:border-slate-600');
            }
        }
    });
};

window.selectBattleRows = function(rows) {
    state.battleRows = rows;
    document.querySelectorAll('.limit-btn').forEach(btn => {
        // Only run if we are in Points mode
        if (state.gameMode === 'points') {
            if(btn.innerText === rows.toString()) {
                btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
                btn.classList.remove('border-slate-200', 'dark:border-slate-600');
            } else {
                btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
                btn.classList.add('border-slate-200', 'dark:border-slate-600');
            }
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

    // --- POINTS BATTLE LOGIC ---
    if (state.gameMode === 'points') {
        const setupModal = document.getElementById('setup-modal');
        if(setupModal) setupModal.classList.add('hidden');
        
        // Reset Battle State
        state.battleGrid = {}; 
        state.activeBattleQuestions = {}; 
        state.solvedBattleIds = [];
        
        // Prepare grid questions per topic
        for (const topic of state.selectedTopics) {
            const questions = await loadQuestionBank(topic);
            
            // Filter by difficulty and shuffle
            const easy = questions.filter(q => parseInt(q.difficulty) === 1).sort(() => Math.random() - 0.5);
            const med = questions.filter(q => parseInt(q.difficulty) === 2).sort(() => Math.random() - 0.5);
            const hard = questions.filter(q => parseInt(q.difficulty) === 3).sort(() => Math.random() - 0.5);
            
            state.battleGrid[topic] = { easy, med, hard };
        }
        
        // Initialize Player Scores
        state.currentPlayerIndex = 0;
        state.playerScores = {};
        for(let i=1; i<=state.activePlayersCount; i++) {
            state.playerScores[i] = 0;
        }
        
        state.isStealMode = false;
        state.stealingPlayerIndex = -1;
        state.gameActive = true;
        
        // Clean up other UIs
        ['strategy-ui', 'solo-ui', 'millionaire-ui'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('hidden');
        });

        initPointsBattle();
        return;
    }

    // --- OTHER MODES LOGIC (Solo, Strategy, Millionaire) ---
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

    // Reset UIs
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
    if (state.gameMode === 'solo' && state.questionLimit !== 999 && state.soloTotal >= state.questionLimit) {
        showSoloSummary();
        return;
    }

    if(state.questionQueue.length === 0 && state.gameMode !== 'points') {
        if (state.gameMode === 'solo') showSoloSummary();
        return;
    }
    
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
    
    if (isCorrect) {
        state.currentResult = 'correct';
        state.currentSelection = val;

        if (state.gameMode === 'solo') {
            state.soloTotal++;
            state.soloScore++;
            markQuestionSolved(question.id);
        } else if (state.gameMode === 'points') {
            handlePointsBattleAnswer(true);
        }

        let playerForHistory = {name: 'Solo', textClass: 'text-slate-500'};
        if (state.gameMode === 'points') {
            const pIdx = state.isStealMode ? state.stealingPlayerIndex : state.currentPlayerIndex;
            playerForHistory = PLAYERS_CONFIG[pIdx];
        }

        addToHistory(playerForHistory, question, val, true);
        updateAnswerUI(val, question, true);
        
    } else {
        // Just shake input
        if(input) {
            input.classList.add('ring-4', 'ring-red-500/50', 'animate-pulse', 'border-red-500');
            setTimeout(() => {
                input.classList.remove('ring-4', 'ring-red-500/50', 'animate-pulse', 'border-red-500');
                input.focus();
            }, 500);
        }
    }
};

window.claimManualCorrect = function() {
    if (state.gameMode === 'solo') {
        state.soloScore++;
        if(state.currentQuestion) markQuestionSolved(state.currentQuestion.id);
        document.getElementById('live-score-text').innerText = state.soloScore;
        const acc = state.soloTotal > 0 ? Math.round((state.soloScore / state.soloTotal) * 100) : 100;
        document.getElementById('live-accuracy-text').innerText = `${acc}%`;
    } else if (state.gameMode === 'points') {
        // If it was a steal attempt, we need to revert the penalty AND award points
        // OR simply add the points + the penalty back? 
        // Simplest: Just add the points (as if they got it right).
        // BUT wait, we deducted points in handlePointsBattleAnswer(false).
        // So we need to add: (Points Value) + (Points Value if StealMode)
        
        const pIdx = state.isStealMode ? state.stealingPlayerIndex : state.currentPlayerIndex;
        const pId = PLAYERS_CONFIG[pIdx].id;
        
        let adjustment = state.currentDifficultyValue;
        if (state.isStealMode) {
            // We subtracted it before, so add it back (to reach 0 change) + add it again (for correct answer)
            adjustment = state.currentDifficultyValue * 2;
        }
        
        state.playerScores[pId] = (state.playerScores[pId] || 0) + adjustment;
        if(window.renderBattleScoreboard) window.renderBattleScoreboard();
    }

    if (state.history.length > 0) {
        const lastEntry = state.history[state.history.length - 1];
        lastEntry.correct = true;
        const historyList = document.getElementById('history-container');
        if(historyList && historyList.firstChild) {
            historyList.firstChild.classList.remove('border-red-500');
            historyList.firstChild.classList.add('border-green-500');
            const badge = historyList.firstChild.querySelector('.bg-red-100');
            if(badge) {
                badge.className = "px-1 py-0 rounded text-[8px] font-bold bg-green-100 text-green-700";
                badge.innerText = getText('goodJob');
            }
        }
    }
    
    state.currentResult = 'correct';
    updateAnswerUI("(Overridden)", state.currentQuestion, true);
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.initGameSetup) window.initGameSetup();
});