lucide.createIcons();

function selectGameMode(mode) {
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
    
    if(mode === 'strategy') {
        strategyOpts.classList.remove('hidden');
        limitOpts.classList.add('hidden');
        startBtnText.innerText = "Start Game";
    } else if (mode === 'solo') {
        strategyOpts.classList.add('hidden');
        limitOpts.classList.remove('hidden');
        startBtnText.innerText = "Start Quiz";
    } else if (mode === 'millionaire') {
        strategyOpts.classList.add('hidden');
        limitOpts.classList.add('hidden');
        startBtnText.innerText = "Begin Residency";
    }
}

function selectSpecialty(type) {
    state.selectedSpecialty = type;
    document.querySelectorAll('.specialty-btn').forEach(btn => {
        const iconWrapper = btn.querySelector('.icon-wrapper');
        if(btn.dataset.type === type) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent', 'shadow-md');
            btn.classList.remove('border-slate-200', 'dark:border-slate-700');
            if(iconWrapper) { iconWrapper.classList.remove('text-slate-400'); iconWrapper.classList.add('text-white'); }
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent', 'shadow-md');
            btn.classList.add('border-slate-200', 'dark:border-slate-700');
            if(iconWrapper) { iconWrapper.classList.add('text-slate-400'); iconWrapper.classList.remove('text-white'); }
        }
    });
}

function selectQuestionLimit(limit) {
    state.questionLimit = parseInt(limit);
    document.querySelectorAll('.limit-btn').forEach(btn => {
        if(parseInt(btn.dataset.limit) === state.questionLimit) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.remove('border-slate-200', 'dark:border-slate-600');
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.add('border-slate-200', 'dark:border-slate-600');
        }
    });
}

function selectPlayerCount(count) {
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
}

function selectGridWidth(cols) {
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
}

async function startGame() {
    const db = await loadQuestionBank(state.selectedSpecialty);
    // db is guaranteed to be an array now (either file or sample)

    document.getElementById('setup-modal').classList.add('hidden');
    
    state.questionQueue = db.sort(() => Math.random() - 0.5);
    state.history = [];
    state.gameActive = true;
    document.getElementById('history-container').innerHTML = '';

    // Reset UIs
    document.getElementById('strategy-ui').classList.add('hidden');
    document.getElementById('solo-ui').classList.add('hidden');
    document.getElementById('millionaire-ui').classList.add('hidden');
    document.getElementById('solo-ui').classList.remove('flex');

    if(state.gameMode === 'solo') {
        state.soloScore = 0;
        state.soloTotal = 0;
        document.getElementById('solo-ui').classList.remove('hidden');
        document.getElementById('solo-ui').classList.add('flex');
        setTimeout(showQuestion, 300); 
    } 
    else if (state.gameMode === 'millionaire') {
        state.ladderIndex = 0;
        state.safeAmount = 0;
        state.lifelines = { '5050': true, 'poll': true, 'consult': true };
        document.getElementById('millionaire-ui').classList.remove('hidden');
        document.getElementById('millionaire-ui').classList.add('flex');
        renderLadder();
        updateMillionaireDisplay();
    }
    else {
        state.currentPlayerIndex = 0;
        state.board = Array(ROWS).fill().map(() => Array(state.activeColCount).fill(0));
        state.playerScores = {};
        for(let i=1; i<=state.activePlayersCount; i++) state.playerScores[i] = 0;
        document.getElementById('strategy-ui').classList.remove('hidden');
        renderGrid();
        renderSelectors();
        renderScoreboard();
        renderHeaders();
    }
}

function showQuestion() {
    if (state.gameMode === 'solo' && state.soloTotal >= state.questionLimit && state.questionLimit !== 999) {
        showSoloSummary();
        return;
    }
    
    // UPDATED: Simply check for empty queue and stop/alert. No fallback.
    if(state.questionQueue.length === 0) {
        alert("No more questions available in the deck!");
        return;
    }
    
    state.currentQuestion = state.questionQueue.shift();
    state.currentResult = null;
    state.currentSelection = null;
    renderQuestionModal(state.currentQuestion);
}

function renderQuestionModal(question) {
        const modal = document.getElementById('question-modal');
        let title = state.selectedSpecialty === 'mixed' ? 'Mixed' : 
                (state.selectedSpecialty === 'derma' ? 'Dermatology' : 'Pathology');
        if (state.gameMode === 'millionaire') title = `Question for $${LADDER[state.ladderIndex].val.toLocaleString()}`;
        
        document.getElementById('modal-title').innerText = title;
        const optsContainer = document.getElementById('options-container');
        document.getElementById('poll-chart').classList.add('hidden');
        optsContainer.innerHTML = '';
        
        question.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.id = `opt-btn-${idx}`;
        btn.className = "w-full text-left p-2 rounded-lg border-2 border-slate-100 dark:border-slate-800 hover:border-medical-500 hover:bg-medical-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group";
        btn.innerHTML = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold group-hover:bg-medical-500 group-hover:text-white transition-colors">${String.fromCharCode(65+idx)}</span><span class="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-medical-700 dark:group-hover:text-white">${opt}</span>`;
        btn.onclick = () => submitAnswer(idx, question);
        optsContainer.appendChild(btn);
    });

        const liveStats = document.getElementById('solo-live-stats');
        const finishBtn = document.getElementById('finish-session-container');
        const qPlayerBadge = document.getElementById('q-player-badge');
        const lifelinesContainer = document.getElementById('lifelines-container');

        if(state.gameMode === 'solo') {
        qPlayerBadge.classList.add('hidden');
        liveStats.classList.remove('hidden');
        liveStats.classList.add('flex');
        finishBtn.classList.remove('hidden');
        lifelinesContainer.classList.add('hidden');
        
        let limitText = state.questionLimit === 999 ? '∞' : state.questionLimit;
        let acc = state.soloTotal > 0 ? Math.round((state.soloScore / state.soloTotal) * 100) : 100;
        document.getElementById('live-progress-text').innerText = `${state.soloTotal + 1}/${limitText}`;
        document.getElementById('live-score-text').innerText = state.soloScore;
        document.getElementById('live-accuracy-text').innerText = `${acc}%`;
    } else if (state.gameMode === 'millionaire') {
        qPlayerBadge.classList.add('hidden');
        liveStats.classList.add('hidden');
        finishBtn.classList.add('hidden');
        lifelinesContainer.classList.remove('hidden');
        lifelinesContainer.classList.add('flex');
        
        document.getElementById('lifeline-5050').disabled = !state.lifelines['5050'];
        document.getElementById('lifeline-poll').disabled = !state.lifelines['poll'];
        document.getElementById('lifeline-consult').disabled = !state.lifelines['consult'];
    } else {
        const player = PLAYERS_CONFIG[state.currentPlayerIndex];
        qPlayerBadge.classList.remove('hidden');
        liveStats.classList.add('hidden');
        finishBtn.classList.add('hidden');
        lifelinesContainer.classList.add('hidden');
        document.getElementById('q-player-badge').innerText = `${player.name}`;
        document.getElementById('q-player-badge').className = `px-2 py-0.5 rounded-full text-[9px] font-bold ${player.bgLight} ${player.textClass}`;
    }

    document.getElementById('close-review-btn').classList.add('hidden');
    document.getElementById('question-text').innerText = question.q;
    document.getElementById('next-action-container').classList.add('hidden');
    document.getElementById('next-action-container').innerHTML = '';

    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('question-card').classList.remove('scale-95'), 10);
}

function updateAnswerUI(selectedIndex, question, isCorrect) {
    const optsContainer = document.getElementById('options-container');
    const buttons = optsContainer.querySelectorAll('button');
    
    buttons.forEach((btn, idx) => {
        if (btn.style.visibility === 'hidden') return;
        btn.disabled = true;
        btn.classList.remove('hover:border-medical-500', 'hover:bg-medical-50', 'dark:hover:bg-slate-800');
        
        if (idx === question.correct) {
            btn.classList.remove('border-slate-100', 'dark:border-slate-800');
            btn.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
                const iconSpan = btn.querySelector('span:first-child');
                iconSpan.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i>`;
                iconSpan.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600');
                iconSpan.classList.add('bg-green-500', 'text-white');
        } else if (idx === selectedIndex && !isCorrect) {
            btn.classList.remove('border-slate-100', 'dark:border-slate-800');
            btn.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/20');
            const iconSpan = btn.querySelector('span:first-child');
            iconSpan.innerHTML = `<i data-lucide="x" class="w-3 h-3"></i>`;
            iconSpan.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600');
            iconSpan.classList.add('bg-red-500', 'text-white');
        } else {
            btn.classList.add('opacity-50');
        }
    });

    const nextContainer = document.getElementById('next-action-container');
    nextContainer.innerHTML = '';
    const nextBtn = document.createElement('button');
    
    if (state.gameMode === 'solo') {
        nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-medical-600 hover:bg-medical-700";
        nextBtn.innerHTML = `<span>Next Question</span><i data-lucide="arrow-right" class="w-3 h-3"></i>`;
        nextBtn.onclick = () => {
            document.getElementById('question-card').classList.add('scale-95');
            setTimeout(() => showQuestion(), 150);
        };
    } else if (state.gameMode === 'millionaire') {
        if (isCorrect) {
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
                nextBtn.innerHTML = `<span>Continue Climbing</span><i data-lucide="chevrons-up" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => {
                    document.getElementById('question-modal').classList.add('hidden');
                    handleMillionaireProgress(true);
                };
        } else {
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700";
                nextBtn.innerHTML = `<span>See Results</span><i data-lucide="x-circle" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => {
                    document.getElementById('question-modal').classList.add('hidden');
                    handleMillionaireProgress(false);
                };
        }
    } else {
        if (isCorrect) {
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
            nextBtn.innerHTML = `<span>Drop Piece</span><i data-lucide="arrow-down-to-line" class="w-3 h-3"></i>`;
            nextBtn.onclick = () => {
                    document.getElementById('question-card').classList.add('scale-95');
                    setTimeout(() => {
                        document.getElementById('question-modal').classList.add('hidden');
                        dropPiece(state.pendingColumn);
                    }, 150);
            };
        } else {
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-slate-600 hover:bg-slate-700";
            nextBtn.innerHTML = `<span>End Turn</span><i data-lucide="skip-forward" class="w-3 h-3"></i>`;
            nextBtn.onclick = () => {
                    document.getElementById('question-card').classList.add('scale-95');
                    setTimeout(() => {
                        document.getElementById('question-modal').classList.add('hidden');
                        switchTurn();
                    }, 150);
            };
        }
    }
    nextContainer.appendChild(nextBtn);
    nextContainer.classList.remove('hidden');
    lucide.createIcons();
}

function submitAnswer(selectedIndex, questionObj) {
    const isCorrect = selectedIndex === questionObj.correct;
    const player = PLAYERS_CONFIG[state.currentPlayerIndex];
    state.currentResult = isCorrect ? 'correct' : 'incorrect';
    state.currentSelection = selectedIndex;
    addToHistory(player, questionObj, selectedIndex, isCorrect);
    if (state.gameMode === 'solo') {
        if(isCorrect) { state.soloScore++; }
        state.soloTotal++;
    } else if (state.gameMode === 'strategy' && isCorrect) {
            state.playerScores[player.id]++;
            renderScoreboard();
    }
    updateAnswerUI(selectedIndex, questionObj, isCorrect);
}

function addToHistory(player, q, idx, correct) {
    state.history.push({ player, q, idx, correct });
    const currentIndex = state.history.length - 1; 
    const list = document.getElementById('history-container');
    if(state.history.length === 1) list.innerHTML = ''; 
    const item = document.createElement('div');
    item.onclick = () => reviewMove(currentIndex); 
    item.className = `p-2 rounded border-l-2 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${correct ? 'border-green-500' : 'border-red-500'}`;
    
    let headerText = player.name;
    let headerColor = player.textClass;
    
    if (state.gameMode === 'solo') {
        headerText = `Q${state.soloTotal}`;
        headerColor = 'text-slate-500';
    } else if (state.gameMode === 'millionaire') {
        headerText = `$${LADDER[state.ladderIndex].val}`;
        headerColor = 'text-gold-500';
    }

    item.innerHTML = `<div class="flex justify-between mb-0.5"><span class="font-bold text-[9px] ${headerColor}">${headerText}</span><span class="text-[8px] text-slate-400">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div><p class="text-[10px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 mb-0.5">${q.q}</p><div class="flex items-center gap-1"><span class="px-1 py-0 rounded text-[8px] font-bold ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${correct ? 'Good Job!' : 'Wrong!'}</span></div><div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-medical-500"><i data-lucide="eye" class="w-3 h-3"></i></div>`;
    list.prepend(item);
    lucide.createIcons();
}

function reviewMove(idx) {
    const data = state.history[idx];
    const modal = document.getElementById('question-modal');
    document.getElementById('modal-title').innerText = "Review";
    document.getElementById('q-player-badge').classList.add('hidden');
    document.getElementById('solo-live-stats').classList.add('hidden');
    document.getElementById('finish-session-container').classList.add('hidden');
    document.getElementById('lifelines-container').classList.add('hidden');
    document.getElementById('poll-chart').classList.add('hidden');
    document.getElementById('close-review-btn').classList.remove('hidden');
    document.getElementById('question-text').innerText = data.q.q;
    const cont = document.getElementById('options-container');
    cont.innerHTML = '';
    document.getElementById('next-action-container').classList.add('hidden');

    data.q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        let cls = "w-full text-left p-2 rounded-lg border-2 transition-colors flex items-center gap-2 cursor-default ";
        let icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">${String.fromCharCode(65+i)}</span>`;
        
        if(i === data.q.correct) {
            cls += "border-green-500 bg-green-50 dark:bg-green-900/30";
            icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white"><i data-lucide="check" class="w-3 h-3"></i></span>`;
        } else if(i === data.idx && !data.correct) {
            cls += "border-red-500 bg-red-50 dark:bg-red-900/30";
            icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white"><i data-lucide="x" class="w-3 h-3"></i></span>`;
        } else {
            cls += "border-slate-200 dark:border-slate-700 opacity-60"; 
        }
        
        btn.className = cls;
        btn.innerHTML = `${icon}<span class="text-xs font-medium text-slate-700 dark:text-slate-200">${opt}</span>`;
        cont.appendChild(btn);
    });
    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('question-card').classList.remove('scale-95'), 10);
    lucide.createIcons();
}

function closeReviewModal() {
    if(state.gameActive && state.currentQuestion) {
            renderQuestionModal(state.currentQuestion);
            if(state.currentResult) {
                const isCorrect = state.currentResult === 'correct';
                updateAnswerUI(state.currentSelection, state.currentQuestion, isCorrect);
            }
    } else {
        document.getElementById('question-card').classList.add('scale-95');
        setTimeout(() => document.getElementById('question-modal').classList.add('hidden'), 200);
    }
}

function resumeGame() {
    if(state.currentQuestion) {
        renderQuestionModal(state.currentQuestion);
            if(state.currentResult) {
                const isCorrect = state.currentResult === 'correct';
                updateAnswerUI(state.currentSelection, state.currentQuestion, isCorrect);
            }
    } else {
        showQuestion();
    }
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    if(window.innerWidth >= 768) {
        if(state.isSidebarOpen) {
            sb.classList.add('-translate-x-full');
            main.classList.remove('ml-56'); main.classList.add('ml-0');
        } else {
            sb.classList.remove('-translate-x-full');
            main.classList.add('ml-56'); main.classList.remove('ml-0');
        }
    } else {
        sb.classList.toggle('-translate-x-full');
    }
    state.isSidebarOpen = !state.isSidebarOpen;
}

function toggleTheme() { document.documentElement.classList.toggle('dark'); }

function initGameSetup() {
    document.getElementById('winner-modal').classList.add('hidden');
    document.getElementById('setup-modal').classList.remove('hidden');
    selectGameMode('strategy');
    selectSpecialty('derma');
    selectPlayerCount(2);
    selectGridWidth(10);
    selectQuestionLimit(10);
    state.isSidebarOpen = window.innerWidth >= 768;
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    if(state.isSidebarOpen) {
        sb.classList.remove('-translate-x-full');
        main.classList.add('ml-56'); main.classList.remove('ml-0');
    }
}

initGameSetup();