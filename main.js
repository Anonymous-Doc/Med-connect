

lucide.createIcons();

const TOPIC_META = {
    'derma': { label: 'Dermatology', labelAr: 'الأمراض الجلدية', color: 'bg-blue-500', mode: 'mcq', prefix: 'dermatology' },
    'patho': { label: 'Pathology', labelAr: 'علم الأمراض', color: 'bg-purple-500', mode: 'mcq', prefix: 'clinical' },
    'riddles': { label: 'Brain Teasers', labelAr: 'ألغاز', color: 'bg-pink-500', mode: 'input', prefix: 'riddles' },
    'geography': { label: 'Geography', labelAr: 'جغرافيا', color: 'bg-green-600', mode: 'mcq', prefix: 'geo' },
    'seerah': { label: 'Seerah', labelAr: 'السيرة النبوية', color: 'bg-emerald-600', mode: 'mcq', prefix: 'seerah' }
};

function resolveTopic(question) {
    if (!question || !question.id) return { label: 'General', labelAr: 'عام', color: 'bg-medical-500', mode: 'mcq' };
    const id = question.id.toLowerCase();
    for (const key in TOPIC_META) {
        if (id.startsWith(TOPIC_META[key].prefix)) {
            return TOPIC_META[key];
        }
    }
    return { label: 'General', labelAr: 'عام', color: 'bg-medical-500', mode: 'mcq' };
}

function localizeUI() {
    // Localize elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = getText(key);
    });

    // Handle Input Placeholders
    const riddleInput = document.getElementById('riddle-input');
    if (riddleInput) riddleInput.placeholder = getText('typeAnswer');
}

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
        if(startBtnText) startBtnText.innerText = getText('startGame');
    } else if (mode === 'solo') {
        strategyOpts.classList.add('hidden');
        limitOpts.classList.remove('hidden');
        // Only show progress if category is educational (redundant check if button hidden, but safe)
        if (state.category !== 'general') {
            progressContainer.classList.remove('hidden');
        } else {
            progressContainer.classList.add('hidden');
        }
        if(startBtnText) startBtnText.innerText = getText('startQuiz');
        if (state.category !== 'general') updateBankStats();
    } else if (mode === 'millionaire') {
        strategyOpts.classList.add('hidden');
        limitOpts.classList.add('hidden');
        progressContainer.classList.add('hidden');
        if(startBtnText) startBtnText.innerText = getText('beginRes');
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
    if(state.gameMode === 'solo' && state.category !== 'general') updateBankStats();
}

async function updateBankStats() {
    if (state.category === 'general') return; // No stats for general decks

    const textEl = document.getElementById('bank-stats-text');
    const barEl = document.getElementById('bank-progress-bar');
    
    const fullBank = await loadQuestionBank(state.selectedSpecialty);
    
    if(!fullBank || fullBank.length === 0) {
        textEl.innerText = "0/0";
        barEl.style.width = "0%";
        return;
    }

    const total = fullBank.length;
    const solvedIDs = getSolvedIDs();
    
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
    
    if (state.gameMode === 'solo') {
        const solvedIDs = getSolvedIDs();
        db = db.filter(q => !solvedIDs.includes(q.id));
        
        if (db.length === 0) {
            alert(state.lang === 'ar' ? "لقد أنهيت جميع الأسئلة!" : "Congratulations! You have completed all questions in this bank!");
            return;
        }
    }

    document.getElementById('setup-modal').classList.add('hidden');
    
    const reviewBtn = document.getElementById('sidebar-review-container');
    if(reviewBtn) {
        reviewBtn.classList.remove('max-h-12', 'opacity-100');
        reviewBtn.classList.add('max-h-0', 'opacity-0');
    }
    
    if (state.gameMode === 'millionaire') {
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
    } else {
        state.questionQueue = db.sort(() => Math.random() - 0.5);
    }

    state.history = [];
    state.gameActive = true;
    document.getElementById('history-container').innerHTML = '';

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
        if (state.gameMode === 'solo') {
             showSoloSummary(); 
        } else {
             alert(state.lang === 'ar' ? "نفذت الأسئلة" : "No more questions available!");
        }
        return;
    }
    state.currentQuestion = state.questionQueue.shift();
    state.currentResult = null;
    state.currentSelection = null;
    renderQuestionModal(state.currentQuestion);
}

function renderOptions(question) {
    const optsContainer = document.getElementById('options-container');
    optsContainer.innerHTML = '';
    
    if (!question.options || !Array.isArray(question.options)) return;

    question.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.id = `opt-btn-${idx}`;
        // RTL adjustment for text alignment
        const alignClass = state.lang === 'ar' ? 'text-right' : 'text-left';
        btn.className = `w-full ${alignClass} p-2 rounded-lg border-2 border-slate-100 dark:border-slate-800 hover:border-medical-500 hover:bg-medical-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group animate-fade-in`;
        btn.innerHTML = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold group-hover:bg-medical-500 group-hover:text-white transition-colors">${String.fromCharCode(65+idx)}</span><span class="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-medical-700 dark:group-hover:text-white">${opt}</span>`;
        btn.onclick = () => submitAnswer(idx, question);
        optsContainer.appendChild(btn);
    });
    lucide.createIcons();
}

function renderQuestionModal(question) {
        const modal = document.getElementById('question-modal');
        const topicInfo = resolveTopic(question);
        
        let title = state.lang === 'ar' ? (topicInfo.labelAr || topicInfo.label) : topicInfo.label;
        let pillClass = topicInfo.color;

        if (state.gameMode === 'millionaire') {
            const val = LADDER[state.ladderIndex].val.toLocaleString();
            title = state.lang === 'ar' ? `سؤال بقيمة ${val}$` : `Question for $${val}`;
            pillClass = "bg-gold-500";
        }
        
        const titleElement = document.getElementById('modal-title');
        const titleContainer = titleElement.parentNode;
        const headerContainer = titleContainer.parentNode;
        headerContainer.classList.add('relative');
        
        const existingBadge = headerContainer.querySelector('.difficulty-badge');
        if (existingBadge) existingBadge.remove();

        titleContainer.innerHTML = `
            <span class="w-1 h-3 ${pillClass} rounded-full"></span>
            <span id="modal-title" class="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">${title}</span>
        `;

        if (question.difficulty) {
            let diffText = state.lang === 'ar' ? "متوسط" : "MEDIUM";
            let diffClass = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
            
            const diff = parseInt(question.difficulty);
            if (diff === 1) {
                diffText = state.lang === 'ar' ? "سهل" : "EASY";
                diffClass = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
            } else if (diff === 3) {
                diffText = state.lang === 'ar' ? "صعب" : "HARD";
                diffClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
            }
            
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
        
        const alreadyAnswered = state.currentResult !== null;
        
        if (topicInfo.mode === 'input' && !alreadyAnswered) {
            const inputContainer = document.createElement('div');
            inputContainer.className = "flex flex-col gap-3 animate-fade-in";
            
            const input = document.createElement('input');
            input.type = "text";
            input.placeholder = getText('typeAnswer');
            // Right align input for Arabic
            input.className = `w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200 dark:focus:ring-medical-900/30 outline-none transition-all ${state.lang === 'ar' ? 'text-right' : 'text-left'}`;
            input.id = "riddle-input";
            input.autocomplete = "off";
            input.onkeypress = (e) => { if(e.key === 'Enter') submitTypedAnswer(question); };
            
            const submitBtn = document.createElement('button');
            submitBtn.className = "w-full py-3 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-sm shadow-lg shadow-medical-500/30 transition-all flex items-center justify-center gap-2";
            submitBtn.innerHTML = `<span>${getText('submit')}</span><i data-lucide="send" class="w-4 h-4 ${state.lang==='ar'?'rotate-180':''}"></i>`;
            submitBtn.onclick = () => submitTypedAnswer(question);

            const giveUpBtn = document.createElement('button');
            giveUpBtn.className = "text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold underline decoration-dotted transition-colors mt-1";
            giveUpBtn.innerText = getText('giveUp');
            giveUpBtn.onclick = () => { 
                submitAnswer(null, question); 
            };

            inputContainer.appendChild(input);
            inputContainer.appendChild(submitBtn);
            inputContainer.appendChild(giveUpBtn);
            
            optsContainer.appendChild(inputContainer);
            
            setTimeout(() => { if(document.getElementById('riddle-input')) document.getElementById('riddle-input').focus(); }, 100);
        } else {
            if (topicInfo.mode === 'input' && alreadyAnswered) {
                 updateAnswerUI(state.currentSelection, question, state.currentResult === 'correct');
            } else {
                renderOptions(question);
            }
        }

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
        
        if (topicInfo.mode === 'input') {
             lifelinesContainer.classList.add('hidden'); 
        } else {
             document.getElementById('lifeline-5050').disabled = !state.lifelines['5050'];
             document.getElementById('lifeline-poll').disabled = !state.lifelines['poll'];
             document.getElementById('lifeline-consult').disabled = !state.lifelines['consult'];
        }
    } else {
        const player = PLAYERS_CONFIG[state.currentPlayerIndex];
        qPlayerBadge.classList.remove('hidden');
        liveStats.classList.add('hidden');
        finishBtn.classList.add('hidden');
        lifelinesContainer.classList.add('hidden');
        document.getElementById('q-player-badge').innerText = `${player.name}`;
        document.getElementById('q-player-badge').className = `px-2 py-0.5 rounded-full text-[9px] font-bold ${player.bgLight} ${player.textClass}`;
    }

    updateFlagButtonState(question.id);

    document.getElementById('close-review-btn').classList.add('hidden');
    document.getElementById('question-text').innerText = question.q;
    
    // Arabic text alignment for question
    if (state.lang === 'ar') document.getElementById('question-text').classList.add('text-right');
    else document.getElementById('question-text').classList.remove('text-right');

    document.getElementById('next-action-container').classList.add('hidden');
    document.getElementById('next-action-container').innerHTML = '';

    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('question-card').classList.remove('scale-95'), 10);
    lucide.createIcons();
}

function checkStringAnswer(user, correct) {
    if (!user || !correct) return false;
    // Enhanced normalization for Arabic
    const normalize = s => {
        let str = s.toLowerCase().trim();
        // Remove English articles
        str = str.replace(/^(a|an|the)\s+/i, '');
        // Remove Arabic definite article "al" (ال) if present at start
        if (state.lang === 'ar') {
            // Remove 'ال' from start
            if (str.startsWith("ال")) str = str.substring(2);
            // Normalize Aleph
            str = str.replace(/[أإآ]/g, 'ا');
            // Normalize Taa Marbuta
            str = str.replace(/ة/g, 'ه');
            // Normalize Yaa
            str = str.replace(/ى/g, 'ي');
        }
        return str.replace(/[^a-z0-9\u0600-\u06FF]/g, ''); // Keep numbers and Arabic/English chars
    };
    
    const u = normalize(user);
    const c = normalize(correct);
    
    return u === c || (c.length > 3 && u.includes(c)) || (c.length > 3 && c.includes(u));
}

function submitTypedAnswer(question) {
    const input = document.getElementById('riddle-input');
    if(!input || !input.value.trim()) return;
    
    const userVal = input.value.trim();
    const isCorrect = checkStringAnswer(userVal, question.correct);
    
    if (isCorrect) {
        submitAnswer(userVal, question);
    } else {
        input.classList.add('animate-shake', 'border-red-500', 'text-red-500');
        setTimeout(() => input.classList.remove('animate-shake', 'border-red-500', 'text-red-500'), 500);
    }
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

function updateAnswerUI(submission, question, isCorrect) {
    const optsContainer = document.getElementById('options-container');
    const isInputMode = !question.options || !Array.isArray(question.options);

    if (isInputMode) {
        optsContainer.innerHTML = '';
        const resultDiv = document.createElement('div');
        resultDiv.className = `p-4 rounded-xl border-2 text-center animate-fade-in ${isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900'}`;
        
        if (isCorrect) {
            resultDiv.innerHTML = `
                <div class="flex flex-col items-center gap-2">
                    <div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-1">
                        <i data-lucide="check" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-lg font-bold text-green-700 dark:text-green-400">${getText('correct')}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300">${getText('yourAnswer')} <span class="font-bold">${submission}</span></p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="flex flex-col items-center gap-2">
                    <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-lg font-bold text-red-700 dark:text-red-400">${getText('answerRevealed')}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300">${getText('correctAnswer')}</p>
                    <p class="text-base font-black text-slate-800 dark:text-white">${question.correct}</p>
                </div>
            `;
        }
        optsContainer.appendChild(resultDiv);
    } else {
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
            } else if (idx === submission && !isCorrect) {
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
    }

    const nextContainer = document.getElementById('next-action-container');
    nextContainer.innerHTML = '';
    const nextBtn = document.createElement('button');
    const arrowIcon = state.lang === 'ar' ? 'rtl:rotate-180' : '';
    
    if (state.gameMode === 'solo') {
        nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-medical-600 hover:bg-medical-700";
        nextBtn.innerHTML = `<span>${getText('nextQuestion')}</span><i data-lucide="arrow-right" class="w-3 h-3 ${arrowIcon}"></i>`;
        nextBtn.onclick = () => {
            document.getElementById('question-card').classList.add('scale-95');
            setTimeout(() => showQuestion(), 150);
        };
    } else if (state.gameMode === 'millionaire') {
        if (isCorrect) {
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
                nextBtn.innerHTML = `<span>${getText('continueClimb')}</span><i data-lucide="chevrons-up" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => {
                    document.getElementById('question-modal').classList.add('hidden');
                    handleMillionaireProgress(true);
                };
        } else {
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700";
                nextBtn.innerHTML = `<span>${getText('seeResults')}</span><i data-lucide="x-circle" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => {
                    document.getElementById('question-modal').classList.add('hidden');
                    handleMillionaireProgress(false);
                };
        }
    } else {
        if (isCorrect) {
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
            nextBtn.innerHTML = `<span>${getText('dropPiece')}</span><i data-lucide="arrow-down-to-line" class="w-3 h-3"></i>`;
            nextBtn.onclick = () => {
                    document.getElementById('question-card').classList.add('scale-95');
                    setTimeout(() => {
                        document.getElementById('question-modal').classList.add('hidden');
                        dropPiece(state.pendingColumn);
                    }, 150);
            };
        } else {
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-slate-600 hover:bg-slate-700";
            nextBtn.innerHTML = `<span>${getText('endTurn')}</span><i data-lucide="skip-forward" class="w-3 h-3 ${arrowIcon}"></i>`;
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

function submitAnswer(submission, questionObj) {
    try {
        let isCorrect = false;
        
        if (typeof submission === 'number') {
            isCorrect = submission === questionObj.correct;
        } else if (typeof submission === 'string' || submission === null) {
            if (submission) {
                isCorrect = checkStringAnswer(submission, questionObj.correct);
            } else {
                isCorrect = false;
            }
        }

        const player = PLAYERS_CONFIG[state.currentPlayerIndex];
        state.currentResult = isCorrect ? 'correct' : 'incorrect';
        state.currentSelection = submission;
        addToHistory(player, questionObj, submission, isCorrect);
        
        if (state.gameMode === 'solo') {
            if(isCorrect) { 
                state.soloScore++; 
                if(questionObj.id) markQuestionSolved(questionObj.id);
            } else {
                let topic = state.selectedSpecialty;
                if (topic === 'mixed' && questionObj.id) {
                    const qId = String(questionObj.id).toLowerCase();
                    if (qId.startsWith('dermatology')) topic = 'derma';
                    else if (qId.startsWith('clinical')) topic = 'patho';
                    else if (qId.startsWith('riddles')) topic = 'riddles';
                    else if (qId.startsWith('geo')) topic = 'geography';
                    else if (qId.startsWith('seerah')) topic = 'seerah';
                }
                saveMistake(questionObj, submission, topic);
            }
            state.soloTotal++;
        } else if (state.gameMode === 'strategy' && isCorrect) {
                state.playerScores[player.id]++;
                renderScoreboard();
        }
        updateAnswerUI(submission, questionObj, isCorrect);
    } catch (e) {
        console.error("Error submitting answer:", e);
        updateAnswerUI(submission, questionObj, false);
    }
}

function addToHistory(player, q, submission, correct) {
    state.history.push({ player, q, idx: submission, correct });
    const currentIndex = state.history.length - 1; 
    const list = document.getElementById('history-container');
    if(state.history.length === 1) list.innerHTML = ''; 
    const item = document.createElement('div');
    item.onclick = () => reviewMove(currentIndex); 
    item.className = `p-2 rounded border-l-2 rtl:border-l-0 rtl:border-r-2 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${correct ? 'border-green-500' : 'border-red-500'}`;
    
    let headerText = player.name;
    let headerColor = player.textClass;
    
    if (state.gameMode === 'solo') {
        headerText = `Q${state.soloTotal}`;
        headerColor = 'text-slate-500';
    } else if (state.gameMode === 'millionaire') {
        headerText = `$${LADDER[state.ladderIndex].val}`;
        headerColor = 'text-gold-500';
    }

    item.innerHTML = `<div class="flex justify-between mb-0.5"><span class="font-bold text-[9px] ${headerColor}">${headerText}</span><span class="text-[8px] text-slate-400">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div><p class="text-[10px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 mb-0.5">${q.q}</p><div class="flex items-center gap-1"><span class="px-1 py-0 rounded text-[8px] font-bold ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${correct ? getText('goodJob') : getText('wrong')}</span></div><div class="absolute top-1 right-1 rtl:right-auto rtl:left-1 opacity-0 group-hover:opacity-100 transition-opacity text-medical-500"><i data-lucide="eye" class="w-3 h-3"></i></div>`;
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
    // Align review text
    if(state.lang === 'ar') document.getElementById('question-text').classList.add('text-right');
    else document.getElementById('question-text').classList.remove('text-right');

    document.getElementById('flag-btn').classList.add('hidden'); 
    const cont = document.getElementById('options-container');
    cont.innerHTML = '';
    document.getElementById('next-action-container').classList.add('hidden');

    if (data.q.options) {
        data.q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            const alignClass = state.lang === 'ar' ? 'text-right' : 'text-left';
            let cls = `w-full ${alignClass} p-2 rounded-lg border-2 transition-colors flex items-center gap-2 cursor-default `;
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
    } else {
        const result = document.createElement('div');
        result.className = "flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700";
        const userAns = data.idx ? data.idx : "(Gave up)";
        result.innerHTML = `
            <div class="text-xs">
                <p class="font-bold text-slate-500 uppercase tracking-wider mb-1">${getText('yourAnswer')}</p>
                <p class="text-base font-medium ${data.correct ? 'text-green-600' : 'text-red-600'}">${userAns}</p>
            </div>
            <div class="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
            <div class="text-xs">
                <p class="font-bold text-slate-500 uppercase tracking-wider mb-1">${getText('correctAnswer')}</p>
                <p class="text-base font-medium text-green-600">${data.q.correct}</p>
            </div>
        `;
        cont.appendChild(result);
    }

    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('question-card').classList.remove('scale-95'), 10);
    lucide.createIcons();
}

function closeReviewModal() {
    if(state.gameActive && state.currentQuestion) {
            renderQuestionModal(state.currentQuestion);
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
    
    // Check direction
    const isRTL = state.lang === 'ar';
    const activeClass = isRTL ? 'translate-x-full' : '-translate-x-full';
    
    // Apply logic
    if(window.innerWidth >= 768) {
        // Desktop: Push content
        if(state.isSidebarOpen) {
            sb.classList.add(activeClass);
            if(isRTL) {
                main.classList.remove('mr-56'); main.classList.add('mr-0');
            } else {
                main.classList.remove('ml-56'); main.classList.add('ml-0');
            }
        } else {
            sb.classList.remove(activeClass);
            if(isRTL) {
                main.classList.add('mr-56'); main.classList.remove('mr-0');
            } else {
                main.classList.add('ml-56'); main.classList.remove('ml-0');
            }
        }
    } else {
        // Mobile: Overlay
        sb.classList.toggle(activeClass);
    }
    state.isSidebarOpen = !state.isSidebarOpen;
}

function toggleTheme() { document.documentElement.classList.toggle('dark'); }

async function initGameSetup() {
    // 1. Check for configuration object from HTML or fall back to URL params
    if (window.gameConfig) {
        state.lang = window.gameConfig.lang;
        state.category = window.gameConfig.category;
    } else {
        const params = new URLSearchParams(window.location.search);
        state.lang = params.get('lang') || 'en';
        state.category = params.get('cat') || 'all';
    }

    localizeUI();

    document.getElementById('winner-modal').classList.add('hidden');
    document.getElementById('setup-modal').classList.remove('hidden');
    
    // Update Review History button text based on lang
    const reviewBtnText = state.lang === 'ar' ? 'سجل المراجعة' : 'Review History';
    const reviewBtnEl = document.querySelector('#sidebar-review-container button span');
    if(reviewBtnEl) reviewBtnEl.innerText = reviewBtnText;

    const reviewBtn = document.getElementById('sidebar-review-container');
    if(reviewBtn) {
        reviewBtn.classList.remove('max-h-0', 'opacity-0');
        reviewBtn.classList.add('max-h-12', 'opacity-100');
    }
    
    // Reset buttons visibility
    const buttons = {
        'mixed': document.getElementById('btn-topic-mixed'),
        'derma': document.getElementById('btn-topic-derma'),
        'patho': document.getElementById('btn-topic-patho'),
        'riddles': document.getElementById('btn-topic-riddles'),
        'geography': document.getElementById('btn-topic-geography'), // Placeholder if we add dynamic generation
        'seerah': document.getElementById('btn-topic-seerah')      // Placeholder if we add dynamic generation
    };

    // Need to dynamically create buttons for new topics if they don't exist in HTML but are in config
    const topicContainer = document.querySelector('#setup-modal .grid-cols-2'); // The grid container for topics
    
    if (window.gameConfig && window.gameConfig.availableTopics) {
        const available = window.gameConfig.availableTopics;
        
        // Hide existing specific ones first
        Object.values(buttons).forEach(b => b && b.classList.add('hidden'));
        
        // Dynamically add or show buttons
        available.forEach(t => {
            if (buttons[t]) {
                buttons[t].classList.remove('hidden');
            } else if (TOPIC_META[t]) {
                // Create button if it doesn't exist in the HTML structure
                const meta = TOPIC_META[t];
                const label = state.lang === 'ar' ? meta.labelAr : meta.label;
                const btn = document.createElement('button');
                btn.className = "specialty-btn py-1.5 px-1 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5";
                btn.onclick = () => selectSpecialty(t);
                btn.dataset.type = t;
                btn.id = `btn-topic-${t}`;
                
                let iconName = 'book';
                if(t === 'geography') iconName = 'globe';
                if(t === 'seerah') iconName = 'moon';
                
                btn.innerHTML = `<i data-lucide="${iconName}" class="w-3 h-3 text-slate-400 icon-wrapper"></i><span class="text-[9px] font-bold">${label}</span>`;
                topicContainer.appendChild(btn);
                buttons[t] = btn; // Cache it
                lucide.createIcons();
            }
        });

        if (available.length > 0) {
            selectSpecialty(available[0]);
        }
    } else {
        // Fallback legacy logic
        if (state.category === 'general') {
             // General usually shows riddles, geography
             // Hide others
             if(buttons['mixed']) buttons['mixed'].classList.add('hidden');
             if(buttons['derma']) buttons['derma'].classList.add('hidden');
             if(buttons['patho']) buttons['patho'].classList.add('hidden');
             if(buttons['riddles']) buttons['riddles'].classList.remove('hidden');
             selectSpecialty('riddles');
        }
        else if (state.category === 'educational') {
             if(buttons['mixed']) buttons['mixed'].classList.remove('hidden');
             if(buttons['derma']) buttons['derma'].classList.remove('hidden');
             if(buttons['patho']) buttons['patho'].classList.remove('hidden');
             if(buttons['riddles']) buttons['riddles'].classList.add('hidden');
             selectSpecialty('mixed');
        }
    }

    // Handle "General" category specific UI changes (Hide Solo, Hide Bank Progress)
    const soloBtn = document.querySelector('button[data-mode="solo"]');
    const modeGrid = document.querySelector('#setup-modal .grid-cols-3');
    
    if (state.category === 'general') {
        if(soloBtn) {
            soloBtn.classList.add('hidden');
        }
        if(modeGrid) {
            modeGrid.classList.remove('grid-cols-3');
            modeGrid.classList.add('grid-cols-2');
        }
        // Force default to millionaire
        selectGameMode('millionaire');
    } else {
        if(soloBtn) {
            soloBtn.classList.remove('hidden');
        }
        if(modeGrid) {
            modeGrid.classList.remove('grid-cols-2');
            modeGrid.classList.add('grid-cols-3');
        }
        selectGameMode('solo');
    }
    
    selectPlayerCount(2);
    selectGridWidth(10);
    selectQuestionLimit(10);
    
    state.isSidebarOpen = window.innerWidth >= 768;
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isRTL = state.lang === 'ar';
    const activeClass = isRTL ? 'translate-x-full' : '-translate-x-full';

    // Set Sidebar Position
    if (isRTL) {
        sb.classList.remove('left-0');
        sb.classList.add('right-0');
    } else {
        sb.classList.remove('right-0');
        sb.classList.add('left-0');
    }

    if(state.isSidebarOpen) {
        sb.classList.remove(activeClass);
        if(isRTL) {
            main.classList.add('mr-56'); main.classList.remove('mr-0');
        } else {
            main.classList.add('ml-56'); main.classList.remove('ml-0');
        }
    } else {
        sb.classList.add(activeClass);
    }
    
    if(state.gameMode === 'solo' && state.category !== 'general') {
        await updateBankStats();
    }
}

// --- REVIEW PAGE LOGIC ---

function openReviewHistory() {
    document.getElementById('setup-modal').classList.add('hidden');
    document.getElementById('review-modal').classList.remove('hidden');
    switchReviewTab('mistakes');
}

function closeReviewHistory() {
    document.getElementById('review-modal').classList.add('hidden');
    document.getElementById('setup-modal').classList.remove('hidden');
}

function switchReviewTab(tab) {
    state.reviewTab = tab;
    document.querySelectorAll('.review-tab').forEach(btn => {
        if(btn.id === `tab-${tab}`) {
            btn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow', 'text-medical-600', 'dark:text-medical-400');
            btn.classList.remove('text-slate-500');
        } else {
            btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow', 'text-medical-600', 'dark:text-medical-400');
            btn.classList.add('text-slate-500');
        }
    });
    filterReview('all');
}

function filterReview(filter) {
    state.reviewFilter = filter;
    
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

    let clearText = getText('clearList');
    clearBtn.innerText = clearText;

    let items = [];
    if(state.reviewTab === 'mistakes') {
        items = getMistakes();
        clearBtn.onclick = () => { if(clearMistakes(state.reviewFilter)) renderReviewContent(); };
    } else {
        items = getFlagged();
        clearBtn.onclick = () => { if(clearFlagged(state.reviewFilter)) renderReviewContent(); };
    }

    if(state.reviewFilter !== 'all') {
        items = items.filter(item => {
            let itemTopic = item.topic || '';
            if(!itemTopic && item.q && item.q.id) {
                if(item.q.id.startsWith('dermatology')) itemTopic = 'derma';
                else if (item.q.id.startsWith('clinical')) itemTopic = 'patho';
                else if (item.q.id.startsWith('riddles')) itemTopic = 'riddles';
                else if (item.q.id.startsWith('geo')) itemTopic = 'geography';
                else if (item.q.id.startsWith('seerah')) itemTopic = 'seerah';
            }
            return itemTopic === state.reviewFilter; 
        });
    }

    if(items.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
            <i data-lucide="inbox" class="w-10 h-10 opacity-20"></i>
            <p class="text-xs italic opacity-60">${getText('noItems')}</p>
        </div>`;
        lucide.createIcons();
        return;
    }

    items.forEach((item, idx) => {
        const el = document.createElement('div');
        el.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group";
        
        const topicInfo = resolveTopic(item.q);
        const topicLabel = state.lang === 'ar' ? topicInfo.labelAr : topicInfo.label;
        const topicColor = topicInfo.color || 'bg-slate-500';
        
        let header = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex gap-2 items-center">
                    <span class="${topicColor} text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">${topicLabel}</span>
                    <span class="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">${state.lang.toUpperCase()}</span>
                </div>
                <div class="flex gap-2 items-center">
                    <span class="text-[9px] text-slate-400">${item.date || 'Unknown Date'}</span>
                    ${state.reviewTab === 'flagged' ? 
                        `<button onclick="unflagFromReview('${item.id}')" class="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-3 h-3"></i></button>` 
                        : ''}
                </div>
            </div>
            <p class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 leading-relaxed ${state.lang === 'ar' ? 'text-right' : ''}">${item.q.q}</p>
        `;

        let optionsHtml = '';
        
        if (item.q.options) {
            // MCQ Display
            optionsHtml = '<div class="space-y-1.5">';
            item.q.options.forEach((opt, optIdx) => {
                let style = "border-slate-100 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-800/50";
                let icon = `<span class="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700 text-[9px] flex items-center justify-center font-bold text-slate-500">${String.fromCharCode(65+optIdx)}</span>`;
                
                if (state.reviewTab === 'mistakes') {
                    if(optIdx === item.q.correct) {
                        style = "border-green-500 bg-green-50 dark:bg-green-900/10 opacity-100 ring-1 ring-green-500";
                        icon = `<span class="w-5 h-5 rounded-lg bg-green-500 text-white text-[9px] flex items-center justify-center shadow-sm"><i data-lucide="check" class="w-3 h-3"></i></span>`;
                    } else if (optIdx === item.userIdx) {
                        style = "border-red-500 bg-red-50 dark:bg-red-900/10 opacity-100 ring-1 ring-red-500";
                        icon = `<span class="w-5 h-5 rounded-lg bg-red-500 text-white text-[9px] flex items-center justify-center shadow-sm"><i data-lucide="x" class="w-3 h-3"></i></span>`;
                    }
                } else {
                    if(optIdx === item.q.correct) {
                        style += ` correct-option-${idx}`; 
                    }
                }

                // RTL Alignment for options
                const alignClass = state.lang === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left';

                optionsHtml += `
                    <div class="flex items-center gap-3 p-2 rounded-lg border ${style} text-[11px] font-medium transition-all duration-300 ${alignClass}">
                        ${icon}
                        <span class="flex-1">${opt}</span>
                    </div>
                `;
            });
            optionsHtml += '</div>';
        } else {
            const userAns = item.userIdx ? item.userIdx : "(Gave up)";
            if (state.reviewTab === 'mistakes') {
                optionsHtml = `
                    <div class="grid grid-cols-2 gap-2 text-[11px]">
                        <div class="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                            <span class="block text-red-400 text-[9px] font-bold uppercase tracking-wider mb-1">${getText('yourAnswer')}</span>
                            <span class="font-bold text-red-600 dark:text-red-400 break-words">${userAns}</span>
                        </div>
                        <div class="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                            <span class="block text-green-400 text-[9px] font-bold uppercase tracking-wider mb-1">${getText('correctAnswer')}</span>
                            <span class="font-bold text-green-600 dark:text-green-400 break-words">${item.q.correct}</span>
                        </div>
                    </div>
                `;
            } else {
                optionsHtml = `
                    <div class="text-[11px] p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                        <span class="hidden correct-answer-${idx} font-bold text-green-600 dark:text-green-400 text-sm">${item.q.correct}</span>
                        <span class="placeholder-${idx} text-slate-400 italic flex items-center justify-center gap-1"><i data-lucide="eye-off" class="w-3 h-3"></i> Answer hidden</span>
                    </div>
                `;
            }
        }

        let footer = '';
        if (state.reviewTab === 'flagged') {
            footer = `
                <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button onclick="revealFlaggedAnswer(${idx}, ${!item.q.options})" class="text-[10px] font-bold text-medical-600 hover:text-white hover:bg-medical-600 border border-medical-200 dark:border-medical-800 dark:text-medical-400 px-4 py-1.5 rounded-lg transition-all shadow-sm">
                        Reveal Answer
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
    let flagged = getFlagged();
    const newFlagged = flagged.filter(f => f.id !== id);
    localStorage.setItem(getScopedKey(STORAGE_KEY_FLAGGED), JSON.stringify(newFlagged));
    renderReviewContent();
}

function revealFlaggedAnswer(idx, isInputMode) {
    if (isInputMode) {
        const ans = document.querySelector(`.correct-answer-${idx}`);
        const place = document.querySelector(`.placeholder-${idx}`);
        if(ans) ans.classList.remove('hidden');
        if(place) place.classList.add('hidden');
    } else {
        const els = document.getElementsByClassName(`correct-option-${idx}`);
        for(let el of els) {
            el.classList.remove('border-slate-100', 'dark:border-slate-800', 'opacity-60', 'bg-slate-50', 'dark:bg-slate-800/50');
            el.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/10', 'opacity-100', 'ring-1', 'ring-green-500');
            const iconSpan = el.querySelector('span:first-child');
            if(iconSpan) {
                iconSpan.className = "w-5 h-5 rounded-lg bg-green-500 text-white text-[9px] flex items-center justify-center shadow-sm";
                iconSpan.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i>`;
            }
        }
    }
    lucide.createIcons();
}

initGameSetup();
