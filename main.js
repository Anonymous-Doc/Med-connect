
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
    const progressContainer = document.getElementById('bank-progress-container');
    
    if(mode === 'strategy') {
        strategyOpts.classList.remove('hidden');
        limitOpts.classList.add('hidden');
        progressContainer.classList.add('hidden');
        if(startBtnText) startBtnText.innerText = "Start Game";
    } else if (mode === 'solo') {
        strategyOpts.classList.add('hidden');
        limitOpts.classList.remove('hidden');
        progressContainer.classList.remove('hidden');
        if(startBtnText) startBtnText.innerText = "Start Quiz";
        updateBankStats(); // Update stats when switching to solo
    } else if (mode === 'millionaire') {
        strategyOpts.classList.add('hidden');
        limitOpts.classList.add('hidden');
        progressContainer.classList.add('hidden');
        if(startBtnText) startBtnText.innerText = "Begin Residency";
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
    // Update stats immediately when topic changes
    if(state.gameMode === 'solo') updateBankStats();
}

// New function to calculate and display progress
async function updateBankStats() {
    const textEl = document.getElementById('bank-stats-text');
    const barEl = document.getElementById('bank-progress-bar');
    
    // We need to load the bank to know the total count. 
    // This is fast since it's local, but we use the shared loader.
    const fullBank = await loadQuestionBank(state.selectedSpecialty);
    
    if(!fullBank || fullBank.length === 0) {
        textEl.innerText = "0/0";
        barEl.style.width = "0%";
        return;
    }

    const total = fullBank.length;
    const solvedIDs = getSolvedIDs();
    
    // Count how many questions in the CURRENT bank are in the solved list
    const solvedCount = fullBank.filter(q => solvedIDs.includes(q.id)).length;
    const percent = Math.round((solvedCount / total) * 100);

    textEl.innerText = `${solvedCount}/${total} (${percent}%)`;
    barEl.style.width = `${percent}%`;
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
    let db = await loadQuestionBank(state.selectedSpecialty);
    
    // --- SOLO MODE SPECIFIC FILTERING ---
    if (state.gameMode === 'solo') {
        const solvedIDs = getSolvedIDs();
        // Filter out solved questions
        db = db.filter(q => !solvedIDs.includes(q.id));
        
        if (db.length === 0) {
            alert("Congratulations! You have completed all questions in this bank! Please use the 'Reset History' button in the setup to start over.");
            return; // Do not close modal
        }
    }
    // ------------------------------------

    document.getElementById('setup-modal').classList.add('hidden');
    
    // Hide Sidebar Review Button
    const reviewBtn = document.getElementById('sidebar-review-container');
    if(reviewBtn) {
        reviewBtn.classList.remove('max-h-12', 'opacity-100');
        reviewBtn.classList.add('max-h-0', 'opacity-0');
    }
    
    // --- QUEUE GENERATION ---
    if (state.gameMode === 'millionaire') {
        // Filter by difficulty levels
        const easy = db.filter(q => parseInt(q.difficulty || 1) === 1).sort(() => Math.random() - 0.5);
        const medium = db.filter(q => parseInt(q.difficulty || 2) === 2).sort(() => Math.random() - 0.5);
        const hard = db.filter(q => parseInt(q.difficulty || 3) === 3).sort(() => Math.random() - 0.5);
        
        let tieredQueue = [];
        
        // Push 5 Easy, 5 Medium, 5 Hard
        tieredQueue.push(...easy.slice(0, 5));
        tieredQueue.push(...medium.slice(0, 5));
        tieredQueue.push(...hard.slice(0, 5));
        
        // Fallback: If total < 15, fill with remaining random questions to avoid game crash
        if (tieredQueue.length < 15) {
            const usedIds = new Set(tieredQueue.map(q => q.id || q.q));
            const remaining = db.filter(q => !usedIds.has(q.id || q.q)).sort(() => Math.random() - 0.5);
            const needed = 15 - tieredQueue.length;
            tieredQueue.push(...remaining.slice(0, needed));
        }
        
        state.questionQueue = tieredQueue;
    } else {
        // Standard Random Shuffle for Solo and Strategy
        state.questionQueue = db.sort(() => Math.random() - 0.5);
    }

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
    if(state.questionQueue.length === 0) {
        // Handle running out of questions mid-game
        if (state.gameMode === 'solo') {
             showSoloSummary(); // Just finish gracefully
        } else {
             alert("No more questions available in the deck!");
        }
        return;
    }
    state.currentQuestion = state.questionQueue.shift();
    state.currentResult = null;
    state.currentSelection = null;
    renderQuestionModal(state.currentQuestion);
}

function renderQuestionModal(question) {
        const modal = document.getElementById('question-modal');
        
        let title = "Mixed";
        let pillClass = "bg-medical-500"; // Default Blue

        // Determine specific topic even in Mixed mode based on ID
        const isDerma = question.id && question.id.startsWith('dermatology');
        const isPatho = question.id && question.id.startsWith('clinical');

        if (state.gameMode === 'millionaire') {
            title = `Question for $${LADDER[state.ladderIndex].val.toLocaleString()}`;
            pillClass = "bg-gold-500";
        } else {
            if (state.selectedSpecialty === 'derma' || (state.selectedSpecialty === 'mixed' && isDerma)) {
                title = 'Dermatology';
                pillClass = "bg-blue-500";
            } else if (state.selectedSpecialty === 'patho' || (state.selectedSpecialty === 'mixed' && isPatho)) {
                title = 'Pathology';
                pillClass = "bg-purple-500";
            }
        }
        
        // Update Title (Resetting it first to avoid duplicating badges in the text)
        const titleElement = document.getElementById('modal-title');
        const titleContainer = titleElement.parentNode;
        const headerContainer = titleContainer.parentNode;
        
        // 1. Set Header to relative for absolute positioning of center badge
        headerContainer.classList.add('relative');
        
        // 2. Remove any existing badge from previous renders
        const existingBadge = headerContainer.querySelector('.difficulty-badge');
        if (existingBadge) existingBadge.remove();

        // 3. Reset the title text container with specific color pill
        titleContainer.innerHTML = `
            <span class="w-1 h-3 ${pillClass} rounded-full"></span>
            <span id="modal-title" class="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">${title}</span>
        `;

        // 4. Generate and Inject new badge if difficulty exists
        if (question.difficulty) {
            let diffText = "MEDIUM";
            // Default yellow for Medium
            let diffClass = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
            
            const diff = parseInt(question.difficulty);
            if (diff === 1) {
                diffText = "EASY";
                diffClass = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
            } else if (diff === 3) {
                diffText = "HARD";
                diffClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
            }
            
            // Create Badge HTML - Absolutely centered in the header
            const badgeHTML = `
                <div class="difficulty-badge absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span class="px-3 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm ${diffClass}">
                        ${diffText}
                    </span>
                </div>
            `;
            headerContainer.insertAdjacentHTML('afterbegin', badgeHTML);
        }

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

    // Flag Logic
    updateFlagButtonState(question.id);

    document.getElementById('close-review-btn').classList.add('hidden');
    document.getElementById('question-text').innerText = question.q;
    document.getElementById('next-action-container').classList.add('hidden');
    document.getElementById('next-action-container').innerHTML = '';

    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('question-card').classList.remove('scale-95'), 10);
}

function updateFlagButtonState(id) {
    const btn = document.getElementById('flag-btn');
    const isFlagged = isQuestionFlagged(id);
    if(isFlagged) {
        btn.classList.add('text-medical-500', 'bg-medical-50', 'dark:bg-medical-900/20');
        btn.classList.remove('text-slate-400');
        btn.innerHTML = `<i data-lucide="bookmark" class="w-3 h-3 fill-current"></i>`;
    } else {
        btn.classList.remove('text-medical-500', 'bg-medical-50', 'dark:bg-medical-900/20');
        btn.classList.add('text-slate-400');
        btn.innerHTML = `<i data-lucide="bookmark" class="w-3 h-3"></i>`;
    }
    lucide.createIcons();
}

function toggleFlagCurrentQuestion() {
    if(!state.currentQuestion) return;
    toggleFlagQuestion(state.currentQuestion, state.selectedSpecialty);
    updateFlagButtonState(state.currentQuestion.id);
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
    try {
        const isCorrect = selectedIndex === questionObj.correct;
        const player = PLAYERS_CONFIG[state.currentPlayerIndex];
        state.currentResult = isCorrect ? 'correct' : 'incorrect';
        state.currentSelection = selectedIndex;
        addToHistory(player, questionObj, selectedIndex, isCorrect);
        
        if (state.gameMode === 'solo') {
            if(isCorrect) { 
                state.soloScore++; 
                if(questionObj.id) markQuestionSolved(questionObj.id);
            } else {
                // SOLO & WRONG -> SAVE MISTAKE
                // Determine actual topic for accurate recording in Mixed mode
                let topic = state.selectedSpecialty;
                // Safety check for ID
                if (topic === 'mixed' && questionObj.id) {
                    const qId = String(questionObj.id).toLowerCase();
                    if (qId.startsWith('dermatology')) topic = 'derma';
                    else if (qId.startsWith('clinical')) topic = 'patho';
                }
                saveMistake(questionObj, selectedIndex, topic);
            }
            state.soloTotal++;
        } else if (state.gameMode === 'strategy' && isCorrect) {
                state.playerScores[player.id]++;
                renderScoreboard();
        }
        updateAnswerUI(selectedIndex, questionObj, isCorrect);
    } catch (e) {
        console.error("Error submitting answer:", e);
        // Fallback: Ensure UI updates so user isn't stuck
        updateAnswerUI(selectedIndex, questionObj, selectedIndex === questionObj.correct);
    }
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
    document.getElementById('flag-btn').classList.add('hidden'); // Hide flag in history review to avoid confusion
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
            // Restore flag button visibility
            document.getElementById('flag-btn').classList.remove('hidden');
            if(state.currentResult) {
                const isCorrect = state.currentResult === 'correct';
                updateAnswerUI(state.currentSelection, state.currentQuestion, isCorrect);
            }
    } else {
        document.getElementById('question-card').classList.add('scale-95');
        setTimeout(() => {
            document.getElementById('question-modal').classList.add('hidden');
            document.getElementById('flag-btn').classList.remove('hidden');
        }, 200);
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

async function initGameSetup() {
    document.getElementById('winner-modal').classList.add('hidden');
    document.getElementById('setup-modal').classList.remove('hidden');
    
    // Show Sidebar Review Button
    const reviewBtn = document.getElementById('sidebar-review-container');
    if(reviewBtn) {
        reviewBtn.classList.remove('max-h-0', 'opacity-0');
        reviewBtn.classList.add('max-h-12', 'opacity-100');
    }
    
    // Set defaults: Solo Mode, Mixed Topic
    selectGameMode('solo');
    selectSpecialty('mixed');
    
    // These calls are fine, but ensure selectSpecialty updates stats
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
    
    // Ensure stats are up to date when the modal opens (if already in solo mode)
    if(state.gameMode === 'solo') {
        await updateBankStats();
    }
}

// --- REVIEW PAGE LOGIC ---

function openReviewHistory() {
    document.getElementById('setup-modal').classList.add('hidden');
    document.getElementById('review-modal').classList.remove('hidden');
    // Default to mistakes view
    switchReviewTab('mistakes');
}

function closeReviewHistory() {
    document.getElementById('review-modal').classList.add('hidden');
    document.getElementById('setup-modal').classList.remove('hidden');
}

function switchReviewTab(tab) {
    state.reviewTab = tab;
    // Update tab styles
    document.querySelectorAll('.review-tab').forEach(btn => {
        if(btn.id === `tab-${tab}`) {
            btn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow', 'text-medical-600', 'dark:text-medical-400');
            btn.classList.remove('text-slate-500');
        } else {
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow', 'text-medical-600', 'dark:text-medical-400');
            btn.classList.add('text-slate-500');
        }
    });
    // Set default filter to all when switching tabs
    filterReview('all');
}

function filterReview(filter) {
    state.reviewFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.review-filter').forEach(btn => {
        if(btn.dataset.filter === filter) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.remove('border-slate-300', 'text-slate-500', 'dark:border-slate-700');
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.add('border-slate-300', 'text-slate-500', 'dark:border-slate-700');
        }
    });

    renderReviewContent();
}

function renderReviewContent() {
    const container = document.getElementById('review-content');
    const clearBtn = document.getElementById('clear-history-btn');
    container.innerHTML = '';

    // Update Clear Button Text & Logic
    let clearText = "Clear List";
    if (state.reviewFilter === 'all') clearText = "Clear All";
    else if (state.reviewFilter === 'derma') clearText = "Clear Derma";
    else if (state.reviewFilter === 'patho') clearText = "Clear Patho";
    
    clearBtn.innerText = clearText + (state.reviewTab === 'mistakes' ? " Mistakes" : " Flagged");

    let items = [];
    if(state.reviewTab === 'mistakes') {
        items = getMistakes();
        clearBtn.onclick = () => { if(clearMistakes(state.reviewFilter)) renderReviewContent(); };
    } else {
        items = getFlagged();
        clearBtn.onclick = () => { if(clearFlagged(state.reviewFilter)) renderReviewContent(); };
    }

    // Filter by Topic
    if(state.reviewFilter !== 'all') {
        items = items.filter(item => {
            // Topic string usually matches 'derma' or 'patho'
            let itemTopic = item.topic || '';
            if(!itemTopic && item.q && item.q.id) {
                if(item.q.id.startsWith('dermatology')) itemTopic = 'derma';
                else if (item.q.id.startsWith('clinical')) itemTopic = 'patho';
            }
            return itemTopic === state.reviewFilter; 
        });
    }

    if(items.length === 0) {
        container.innerHTML = `<div class="text-center text-slate-400 py-10 italic text-xs">No items found.</div>`;
        return;
    }

    items.forEach((item, idx) => {
        const el = document.createElement('div');
        el.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm";
        
        let topicBadge = '';
        if(item.q.id.startsWith('dermatology')) topicBadge = `<span class="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Derma</span>`;
        else topicBadge = `<span class="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Patho</span>`;

        let header = `
            <div class="flex justify-between items-center mb-2">
                <div class="flex gap-2 items-center">
                    ${topicBadge}
                    <span class="text-[9px] text-slate-400">${item.date || 'Unknown Date'}</span>
                </div>
                ${state.reviewTab === 'flagged' ? 
                    `<button onclick="unflagFromReview('${item.id}')" class="text-red-400 hover:text-red-500"><i data-lucide="trash-2" class="w-3 h-3"></i></button>` 
                    : ''}
            </div>
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">${item.q.q}</p>
        `;

        let optionsHtml = '<div class="space-y-1">';
        item.q.options.forEach((opt, optIdx) => {
            let style = "border-slate-200 dark:border-slate-700 opacity-70";
            let icon = `<span class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-[8px] flex items-center justify-center font-bold">${String.fromCharCode(65+optIdx)}</span>`;
            
            if (state.reviewTab === 'mistakes') {
                // Mistake Logic: Show Red/Green immediately
                if(optIdx === item.q.correct) {
                    style = "border-green-500 bg-green-50 dark:bg-green-900/20 opacity-100";
                    icon = `<span class="w-4 h-4 rounded-full bg-green-500 text-white text-[8px] flex items-center justify-center"><i data-lucide="check" class="w-2.5 h-2.5"></i></span>`;
                } else if (optIdx === item.userIdx) {
                    style = "border-red-500 bg-red-50 dark:bg-red-900/20 opacity-100";
                    icon = `<span class="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center"><i data-lucide="x" class="w-2.5 h-2.5"></i></span>`;
                }
            } else {
                // Flagged Logic: Neutral initially, green class added dynamically
                // We add a data attribute to find the correct one later
                if(optIdx === item.q.correct) {
                    style += ` correct-option-${idx}`; // Unique class for this card
                }
            }

            optionsHtml += `
                <div class="flex items-center gap-2 p-1.5 rounded border ${style} text-[10px] font-medium transition-all duration-300">
                    ${icon}
                    <span>${opt}</span>
                </div>
            `;
        });
        optionsHtml += '</div>';

        // Flagged: Add Show Answer Button
        let footer = '';
        if (state.reviewTab === 'flagged') {
            footer = `
                <div class="mt-3 text-center">
                    <button onclick="revealFlaggedAnswer(${idx})" class="text-[10px] font-bold text-medical-600 hover:bg-medical-50 dark:hover:bg-slate-800 px-3 py-1 rounded transition-colors">
                        Show Answer
                    </button>
                </div>
            `;
        }

        el.innerHTML = header + optionsHtml + footer;
        container.appendChild(el);
    });
    lucide.createIcons();
}

function unflagFromReview(id) {
    // We need to construct a dummy object with just the ID to toggle it off
    // Or simpler: manually remove from LS
    let flagged = getFlagged();
    const newFlagged = flagged.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY_FLAGGED, JSON.stringify(newFlagged));
    renderReviewContent();
}

function revealFlaggedAnswer(idx) {
    // Find elements with class `correct-option-${idx}`
    const els = document.getElementsByClassName(`correct-option-${idx}`);
    for(let el of els) {
        el.classList.remove('border-slate-200', 'dark:border-slate-700', 'opacity-70');
        el.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20', 'opacity-100');
        // Update icon
        const iconSpan = el.querySelector('span:first-child');
        if(iconSpan) {
            iconSpan.className = "w-4 h-4 rounded-full bg-green-500 text-white text-[8px] flex items-center justify-center";
            iconSpan.innerHTML = `<i data-lucide="check" class="w-2.5 h-2.5"></i>`;
        }
    }
    lucide.createIcons();
}

initGameSetup();
