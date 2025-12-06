
window.localizeUI = function() {
    // Localize elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = getText(key);
    });

    // Handle Input Placeholders
    const riddleInput = document.getElementById('riddle-input');
    if (riddleInput) riddleInput.placeholder = getText('typeAnswer');
};

// HELPER: Extract the "Group Key" from a topic string
// e.g., 'surgery1_extra' -> 'surgery1'
function getTopicGroup(topic) {
    if (!topic) return 'other';
    return topic.split('_')[0]; 
}

// HELPER: Generate a readable label from a group key
// e.g., 'surgery1' -> 'Surgery P1'
// e.g., 'anatomy'  -> 'Anatomy'
function getGroupLabel(groupKey) {
    if (groupKey.startsWith('surgery')) {
        // Extract the number: 'surgery1' -> '1'
        const num = groupKey.replace('surgery', '');
        return `Surgery P${num}`;
    }
    // Capitalize first letter for others
    return groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
}


window.toggleSidebar = function() {
    const sb = document.getElementById('sidebar');
    // We no longer need to manipulate main content margins
    
    if(!sb) return;

    // Check direction
    const isRTL = state.lang === 'ar';
    const activeClass = isRTL ? 'translate-x-full' : '-translate-x-full';
    
    // Simple Toggle Logic for Overlay Behavior on ALL screens
    if (sb.classList.contains(activeClass)) {
        // Open Sidebar
        sb.classList.remove(activeClass);
        state.isSidebarOpen = true;
    } else {
        // Close Sidebar
        sb.classList.add(activeClass);
        state.isSidebarOpen = false;
    }
};

window.toggleTheme = function() { 
    document.documentElement.classList.toggle('dark'); 
};

window.renderOptions = function(question) {
    const optsContainer = document.getElementById('options-container');
    if(!optsContainer) return;
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
};

window.renderQuestionModal = function(question) {
    const modal = document.getElementById('question-modal');
    if(!modal) return;
    
    // 1. Get the topic info
    let topicInfo = resolveTopic(question);
    
    // --- CRITICAL FIX: SAFETY CHECK ---
    // If the game thinks this is MCQ (default) but the question has NO options (like a Riddle),
    // we FORCE it to be 'input' mode so the text box appears.
    if (topicInfo.mode === 'mcq' && (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
        topicInfo.mode = 'input';
        
        // Optional: Force the "Riddle" styling/label if it fell back to General
        if(topicInfo.label === 'General' || topicInfo.label === 'عام') {
             topicInfo.label = state.lang === 'ar' ? 'لغز' : 'Riddle';
             topicInfo.color = 'bg-pink-500';
        }
    }
    // ----------------------------------

    let title = state.lang === 'ar' ? (topicInfo.labelAr || topicInfo.label) : topicInfo.label;
    let pillClass = topicInfo.color;

    if (state.gameMode === 'millionaire') {
        const val = LADDER[state.ladderIndex].val.toLocaleString();
        title = state.lang === 'ar' ? `سؤال بقيمة ${val}$` : `Question for $${val}`;
        pillClass = "bg-gold-500";
    } else if (state.gameMode === 'points') {
        title = `${getText('points')}: ${state.currentDifficultyValue}`;
        if (state.currentDifficultyValue === 100) pillClass = "bg-green-500";
        else if (state.currentDifficultyValue === 150) pillClass = "bg-yellow-500";
        else pillClass = "bg-red-500";
    }
    
    const titleElement = document.getElementById('modal-title');
    if(!titleElement) return;
    
    const toolsBar = titleElement.closest('.flex.justify-between'); 
    
    if(toolsBar) {
        toolsBar.classList.add('relative');
        const existingBadge = toolsBar.querySelector('.difficulty-badge');
        if (existingBadge) existingBadge.remove();

        const titleContainer = titleElement.parentNode;
        titleContainer.className = "flex items-center gap-2 title-container relative z-10";
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
                <div class="difficulty-badge absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <span class="px-3 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm ${diffClass}">
                        ${diffText}
                    </span>
                </div>
            `;
            toolsBar.insertAdjacentHTML('afterbegin', badgeHTML);
        }
    }

    // Report Button Logic
    const actionContainer = document.querySelector('.flex.items-center.gap-2:not(.title-container)');
    if(actionContainer) {
        const oldReportBtn = document.getElementById('report-btn');
        if(oldReportBtn) oldReportBtn.remove();

        const isReported = isQuestionReported(question.id);
        let reportBtnHTML;

        if (isReported) {
             reportBtnHTML = `<button id="report-btn" disabled class="p-1.5 rounded-full text-green-500 cursor-not-allowed" title="${getText('reported')}"><i data-lucide="check" class="w-3 h-3"></i></button>`;
        } else {
             reportBtnHTML = `<button id="report-btn" onclick="reportCurrentQuestion()" title="${getText('reportQ')}" class="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><i data-lucide="alert-triangle" class="w-3 h-3"></i></button>`;
        }

        const flagBtn = document.getElementById('flag-btn');
        if(flagBtn) flagBtn.insertAdjacentHTML('afterend', reportBtnHTML);
    }

    const optsContainer = document.getElementById('options-container');
    const pollChart = document.getElementById('poll-chart');
    if(pollChart) pollChart.classList.add('hidden');
    
    if(optsContainer) {
        optsContainer.innerHTML = '';
        const alreadyAnswered = state.currentResult !== null;
        
        // --- INPUT MODE RENDERING ---
        if (topicInfo.mode === 'input' && !alreadyAnswered) {
            const inputContainer = document.createElement('div');
            inputContainer.className = "flex flex-col gap-3 animate-fade-in";
            
            const input = document.createElement('input');
            input.type = "text";
            input.placeholder = getText('typeAnswer');
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
                // This will trigger the "Wrong Answer" state, which now has the "Mark Correct" button
                submitAnswer(null, question); 
            };

            inputContainer.appendChild(input);
            inputContainer.appendChild(submitBtn);
            inputContainer.appendChild(giveUpBtn);
            
            optsContainer.appendChild(inputContainer); 
            setTimeout(() => { if(document.getElementById('riddle-input')) document.getElementById('riddle-input').focus(); }, 100);
        } else {
            // MCQ or already answered
            if (topicInfo.mode === 'input' && alreadyAnswered) {
                 updateAnswerUI(state.currentSelection, question, state.currentResult === 'correct');
            } else {
                renderOptions(question);
            }
        }
    }

    // Stats and Badges Visibility Logic
    const liveStats = document.getElementById('solo-live-stats');
    const finishBtn = document.getElementById('finish-session-container');
    const qPlayerBadge = document.getElementById('q-player-badge');
    const lifelinesContainer = document.getElementById('lifelines-container');

    if (liveStats && finishBtn && qPlayerBadge && lifelinesContainer) {
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
            const playerIdx = (state.gameMode === 'points' && state.isStealMode) ? state.stealingPlayerIndex : state.currentPlayerIndex;
            const player = PLAYERS_CONFIG[playerIdx];
            qPlayerBadge.classList.remove('hidden');
            liveStats.classList.add('hidden');
            finishBtn.classList.add('hidden');
            lifelinesContainer.classList.add('hidden');
            document.getElementById('q-player-badge').innerText = `${player.name}`;
            document.getElementById('q-player-badge').className = `px-2 py-0.5 rounded-full text-[9px] font-bold ${player.bgLight} ${player.textClass}`;
            
            if (state.gameMode === 'points' && state.isStealMode) {
                 document.getElementById('q-player-badge').classList.add('ring-2', 'ring-red-500');
                 document.getElementById('q-player-badge').innerText += ` (${getText('stealChance')})`;
            }
        }
    }

    updateFlagButtonState(question.id);

    const closeRev = document.getElementById('close-review-btn');
    if(closeRev) closeRev.classList.add('hidden');
    
    const qText = document.getElementById('question-text');
    if(qText) {
        qText.innerText = question.q;
        if (state.lang === 'ar') qText.classList.add('text-right');
        else qText.classList.remove('text-right');
    }

    const nextAct = document.getElementById('next-action-container');
    if(nextAct) {
        nextAct.classList.add('hidden');
        nextAct.innerHTML = '';
    }

    modal.classList.remove('hidden');
    const qCard = document.getElementById('question-card');
    if(qCard) setTimeout(() => qCard.classList.remove('scale-95'), 10);
    lucide.createIcons();
};

window.reportCurrentQuestion = function() {
    if(!state.currentQuestion) return;
    
    const btn = document.getElementById('report-btn');
    if(btn.disabled) return;

    const qId = state.currentQuestion.id;
    
    // Set UI to loading state
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed', 'animate-pulse');
    btn.classList.remove('hover:text-red-500', 'hover:bg-red-50', 'dark:hover:bg-red-900/20');
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i>`;
    lucide.createIcons();

    // Prepare Data
    const date = new Date();
    // Format: 2025-12-4 (10:47)
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} (${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')})`;
    
    const payload = {
        "ID": qId,
        "Date": formattedDate,
        "Topic": state.selectedTopics.join(', ')
    };

    // Send to SheetBest API
    fetch('https://api.sheetbest.com/sheets/170cc9a8-108c-4a7b-8bd1-c2fca1f24004', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            // Mark locally as reported
            markQuestionReported(qId);
            
            // Success UI
            btn.classList.remove('animate-pulse');
            btn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-green-500"></i>`;
            btn.title = getText('reported');
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .catch(error => {
        console.error('Error reporting question:', error);
        // Reset button on failure so user can try again if it was a network glitch
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed', 'animate-pulse');
        btn.classList.add('hover:text-red-500', 'hover:bg-red-50', 'dark:hover:bg-red-900/20');
        btn.innerHTML = `<i data-lucide="alert-triangle" class="w-3 h-3"></i>`;
    })
    .finally(() => {
         lucide.createIcons();
    });
};

window.updateFlagButtonState = function(id) {
    const btn = document.getElementById('flag-btn');
    if(!btn) return;
    
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
};

window.toggleFlagCurrentQuestion = function() {
    if(!state.currentQuestion) return;
    // FIX: Use state.selectedTopics[0] instead of state.selectedSpecialty
    // This ensures the topic (e.g., 'surgery2') is saved with the flag
    const currentTopic = state.selectedTopics && state.selectedTopics.length > 0 ? state.selectedTopics[0] : 'general';
    
    toggleFlagQuestion(state.currentQuestion, currentTopic);
    updateFlagButtonState(state.currentQuestion.id);
};

window.updateAnswerUI = function(submission, question, isCorrect) {
    const optsContainer = document.getElementById('options-container');
    if(!optsContainer) return;
    const isInputMode = !question.options || !Array.isArray(question.options);

    // Hide correct answer only in Points Battle + Wrong Answer + No Steal yet
    const hideCorrectAnswer = (state.gameMode === 'points' && !isCorrect && !state.isStealMode);

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
            // --- NEW: Wrong Answer with "Mark Correct" Button ---
            resultDiv.innerHTML = `
                <div class="flex flex-col items-center gap-2">
                    <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-lg font-bold text-red-700 dark:text-red-400">${getText('answerRevealed')}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300">${getText('correctAnswer')}</p>
                    <p class="text-base font-black text-slate-800 dark:text-white mb-2">${question.correct}</p>
                    
                    <button onclick="claimManualCorrect()" class="mt-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                        <span>Mark as Correct</span>
                    </button>
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
                if (hideCorrectAnswer) {
                    btn.classList.add('opacity-50');
                } else {
                    btn.classList.remove('border-slate-100', 'dark:border-slate-800');
                    btn.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
                    const iconSpan = btn.querySelector('span:first-child');
                    iconSpan.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i>`;
                    iconSpan.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600');
                    iconSpan.classList.add('bg-green-500', 'text-white');
                }
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
    if(!nextContainer) return;

    nextContainer.innerHTML = '';
    const nextBtn = document.createElement('button');
    const arrowIcon = state.lang === 'ar' ? 'rtl:rotate-180' : '';
    
    // --- MODE SPECIFIC BUTTONS ---
    if (state.gameMode === 'solo') {
        nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-medical-600 hover:bg-medical-700";
        nextBtn.innerHTML = `<span>${getText('nextQuestion')}</span><i data-lucide="arrow-right" class="w-3 h-3 ${arrowIcon}"></i>`;
        nextBtn.onclick = () => { document.getElementById('question-card').classList.add('scale-95'); setTimeout(() => showQuestion(), 150); };
        nextContainer.prepend(nextBtn); 
    } else if (state.gameMode === 'millionaire') {
         if (isCorrect) {
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
                nextBtn.innerHTML = `<span>${getText('continueClimb')}</span><i data-lucide="chevrons-up" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => { document.getElementById('question-modal').classList.add('hidden'); handleMillionaireProgress(true); };
        } else {
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700";
                nextBtn.innerHTML = `<span>${getText('seeResults')}</span><i data-lucide="x-circle" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => { document.getElementById('question-modal').classList.add('hidden'); handleMillionaireProgress(false); };
        }
        nextContainer.prepend(nextBtn);
    } else if (state.gameMode === 'points') {
        // --- POINTS BATTLE LOGIC ---
        if (isCorrect) {
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
            nextBtn.innerHTML = `<span>${getText('endTurn')}</span><i data-lucide="arrow-right" class="w-3 h-3 ${arrowIcon}"></i>`;
            nextBtn.onclick = () => {
                document.getElementById('question-card').classList.add('scale-95');
                setTimeout(() => { document.getElementById('question-modal').classList.add('hidden'); finishPointsTurn(true); }, 150);
            };
            nextContainer.prepend(nextBtn);
        } else {
            // INCORRECT
            if (state.isStealMode) {
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-slate-600 hover:bg-slate-700";
                nextBtn.innerHTML = `<span>${getText('endTurn')}</span><i data-lucide="skip-forward" class="w-3 h-3 ${arrowIcon}"></i>`;
                nextBtn.onclick = () => {
                     document.getElementById('question-card').classList.add('scale-95');
                     setTimeout(() => { document.getElementById('question-modal').classList.add('hidden'); finishPointsTurn(false); }, 150);
                };
                nextContainer.prepend(nextBtn);
            } else {
                // FIRST FAIL -> Show Steal (With Name) or Pass
                const nextPlayerIdx = (state.currentPlayerIndex + 1) % state.activePlayersCount;
                const nextPlayerName = PLAYERS_CONFIG[nextPlayerIdx].name;
                
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600";
                nextBtn.innerHTML = `<span>${getText('attemptSteal')} <span class="opacity-90">(${nextPlayerName})</span></span><i data-lucide="zap" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => { initiateSteal(); };
                nextContainer.prepend(nextBtn);
                
                const passBtn = document.createElement('button');
                passBtn.className = "w-full py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 mt-2";
                passBtn.innerHTML = `<span>${getText('passTurn')}</span>`;
                passBtn.onclick = () => {
                    const allOpts = optsContainer.querySelectorAll('button');
                    allOpts.forEach((b, i) => {
                        if(i === question.correct) {
                            b.classList.remove('border-slate-100', 'dark:border-slate-800', 'opacity-50');
                            b.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
                            const iconSpan = b.querySelector('span:first-child');
                            iconSpan.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i>`;
                            iconSpan.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600');
                            iconSpan.classList.add('bg-green-500', 'text-white');
                        }
                    });
                    lucide.createIcons();

                    nextContainer.innerHTML = '';
                    const endBtn = document.createElement('button');
                    endBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg flex items-center justify-center gap-1.5 bg-slate-600 hover:bg-slate-700 animate-fade-in";
                    endBtn.innerHTML = `<span>${getText('endTurn')}</span><i data-lucide="arrow-right" class="w-3 h-3"></i>`;
                    endBtn.onclick = () => {
                        document.getElementById('question-card').classList.add('scale-95');
                        setTimeout(() => { document.getElementById('question-modal').classList.add('hidden'); finishPointsTurn(false); }, 150);
                    };
                    nextContainer.appendChild(endBtn);
                    if(window.lucide) lucide.createIcons();
                }
                nextContainer.appendChild(passBtn);
            }
        }
    } else {
        // Strategy Mode
        if (isCorrect) {
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
            nextBtn.innerHTML = `<span>${getText('dropPiece')}</span><i data-lucide="arrow-down-to-line" class="w-3 h-3"></i>`;
            nextBtn.onclick = () => { document.getElementById('question-card').classList.add('scale-95'); setTimeout(() => { document.getElementById('question-modal').classList.add('hidden'); dropPiece(state.pendingColumn); }, 150); };
        } else {
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-slate-600 hover:bg-slate-700";
            nextBtn.innerHTML = `<span>${getText('endTurn')}</span><i data-lucide="skip-forward" class="w-3 h-3 ${arrowIcon}"></i>`;
            nextBtn.onclick = () => { document.getElementById('question-card').classList.add('scale-95'); setTimeout(() => { document.getElementById('question-modal').classList.add('hidden'); switchTurn(); }, 150); };
        }
        nextContainer.prepend(nextBtn);
    }

    nextContainer.classList.remove('hidden');
    lucide.createIcons();
};

window.addToHistory = function(player, q, submission, correct) {
    state.history.push({ player, q, idx: submission, correct });
    const currentIndex = state.history.length - 1; 
    const list = document.getElementById('history-container');
    if(!list) return;
    
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
    } else if (state.gameMode === 'points') {
        if (state.isStealMode) {
            headerText += " (Steal)";
        }
    }

    item.innerHTML = `<div class="flex justify-between mb-0.5"><span class="font-bold text-[9px] ${headerColor}">${headerText}</span><span class="text-[8px] text-slate-400">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div><p class="text-[10px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 mb-0.5">${q.q}</p><div class="flex items-center gap-1"><span class="px-1 py-0 rounded text-[8px] font-bold ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${correct ? getText('goodJob') : getText('wrong')}</span></div><div class="absolute top-1 right-1 rtl:right-auto rtl:left-1 opacity-0 group-hover:opacity-100 transition-opacity text-medical-500"><i data-lucide="eye" class="w-3 h-3"></i></div>`;
    list.prepend(item);
    lucide.createIcons();
};

window.reviewMove = function(idx) {
    const data = state.history[idx];
    const modal = document.getElementById('question-modal');
    if(!modal) return;

    // --- MARKER: REMEMBER WE CAME FROM HISTORY ---
    window.isReviewingHistory = true;

    // --- FORCE CLOSE SIDEBAR (To view question) ---
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        const isRTL = state.lang === 'ar';
        const hiddenClass = isRTL ? 'translate-x-full' : '-translate-x-full';
        // If sidebar is open (doesn't have hidden class), close it
        if (!sidebar.classList.contains(hiddenClass)) {
            sidebar.classList.add(hiddenClass);
            state.isSidebarOpen = false;
        }
    }

    // 1. Prepare Modal
    const titleEl = document.getElementById('modal-title');
    if(titleEl) titleEl.innerText = "Review";
    
    // 2. Hide Gameplay Elements
    const elementsToHide = ['q-player-badge', 'solo-live-stats', 'finish-session-container', 'lifelines-container', 'poll-chart', 'next-action-container'];
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    // 3. Show Close Button
    const closeBtn = document.getElementById('close-review-btn');
    if(closeBtn) closeBtn.classList.remove('hidden');
    
    // 4. Set Question Text
    const qText = document.getElementById('question-text');
    if(qText) {
        qText.innerText = data.q.q;
        if(state.lang === 'ar') qText.classList.add('text-right');
        else qText.classList.remove('text-right');
    }

    // 5. Hide Interactive Buttons
    const flagBtn = document.getElementById('flag-btn');
    if(flagBtn) flagBtn.classList.add('hidden');
    const reportBtn = document.getElementById('report-btn');
    if(reportBtn) reportBtn.classList.add('hidden');

    // 6. Render Options with SOLID CIRCLES
    const cont = document.getElementById('options-container');
    if(cont) {
        cont.innerHTML = '';
        if (data.q.options) {
            data.q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                const alignClass = state.lang === 'ar' ? 'text-right' : 'text-left';
                let cls = `w-full ${alignClass} p-2 rounded-lg border-2 transition-colors flex items-center gap-2 cursor-default `;
                
                // DEFAULT ICON (Grey)
                let icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">${String.fromCharCode(65+i)}</span>`;
                
                if(i === data.q.correct) {
                    // CORRECT: Green Border + Solid Green Circle + White Check
                    cls += "border-green-500 bg-green-50 dark:bg-green-900/30";
                    icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white"><i data-lucide="check" class="w-3 h-3 text-white"></i></span>`;
                } else if(i === data.idx && !data.correct) {
                    // WRONG: Red Border + Solid Red Circle + White X
                    cls += "border-red-500 bg-red-50 dark:bg-red-900/30";
                    icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white"><i data-lucide="x" class="w-3 h-3 text-white"></i></span>`;
                } else {
                    // OTHER: Faded
                    cls += "border-slate-200 dark:border-slate-700 opacity-60"; 
                }
                
                btn.className = cls;
                btn.innerHTML = `${icon}<span class="text-xs font-medium text-slate-700 dark:text-slate-200">${opt}</span>`;
                cont.appendChild(btn);
            });
        } else {
            // Input Mode logic...
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
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
         const card = document.getElementById('question-card');
         if(card) card.classList.remove('scale-95');
    }, 10);
    
    if(window.lucide) lucide.createIcons();
};

window.closeReviewModal = function() {
    // 1. If we were reviewing history
    if (window.isReviewingHistory) {
        // A. Restore Sidebar state
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const isRTL = state.lang === 'ar';
            const hiddenClass = isRTL ? 'translate-x-full' : '-translate-x-full';
            sidebar.classList.remove(hiddenClass);
            state.isSidebarOpen = true;
        }
        window.isReviewingHistory = false; // Reset flag
        
        // B. CHECK: Is there an active game we should return to?
        if (state.gameActive && state.currentQuestion) {
            // Don't close the modal! Instead, switch the content back to the live question.
            renderQuestionModal(state.currentQuestion);
            
            // If the player had already answered the live question before clicking history, 
            // we need to restore the "Result View" (Green/Red buttons)
            if (state.currentResult) {
                const isCorrect = state.currentResult === 'correct';
                updateAnswerUI(state.currentSelection, state.currentQuestion, isCorrect);
            }
            
            // Ensure interactive buttons are visible again
            const flagBtn = document.getElementById('flag-btn');
            if(flagBtn) flagBtn.classList.remove('hidden');
            const reportBtn = document.getElementById('report-btn');
            if(reportBtn) reportBtn.classList.remove('hidden');
            
            return; // Exit here, keeping the modal OPEN with game content
        }

        // C. If no game is active (e.g. reviewing after game over), THEN hide the modal
        const modal = document.getElementById('question-modal');
        const card = document.getElementById('question-card');
        if(card) card.classList.add('scale-95');
        setTimeout(() => {
            if(modal) modal.classList.add('hidden');
            const flagBtn = document.getElementById('flag-btn');
            if(flagBtn) flagBtn.classList.remove('hidden');
            const reportBtn = document.getElementById('report-btn');
            if(reportBtn) reportBtn.classList.remove('hidden');
        }, 200);
        return;
    }

    // 2. Standard Behavior (Closing the modal normally, e.g. clicking X during a game)
    // Usually we don't allow closing the modal mid-game unless it's to go back to menu, 
    // but if you have logic for that, keep it standard:
    const card = document.getElementById('question-card');
    if(card) card.classList.add('scale-95');
    setTimeout(() => {
        const modal = document.getElementById('question-modal');
        if(modal) modal.classList.add('hidden');
        const flagBtn = document.getElementById('flag-btn');
        if(flagBtn) flagBtn.classList.remove('hidden');
        const reportBtn = document.getElementById('report-btn');
        if(reportBtn) reportBtn.classList.remove('hidden');
    }, 200);
};

// Review History Implementation

window.closeReviewHistory = function() {
    const modal = document.getElementById('review-modal');
    if(modal) modal.classList.add('hidden');
};

window.openReviewHistory = function() {
    const modal = document.getElementById('review-modal');
    if(modal) modal.classList.remove('hidden');
    
    // Default filter
    if(!state.reviewFilter) state.reviewFilter = 'all';
    
    // 1. Generate dynamic buttons based on actual history
    generateReviewFilters();
    
    // 2. Open correct tab
    switchReviewTab(state.reviewTab || 'mistakes');
};

window.generateReviewFilters = function() {
    const container = document.getElementById('review-filters-container');
    if(!container) return;
    
    container.innerHTML = '';
    
    // Get items (Mistakes or Flagged)
    const items = state.reviewTab === 'mistakes' ? getMistakes() : getFlagged();
    
    // Find all unique groups in history
    const groupsFound = new Set();
    items.forEach(item => {
        if(item.topic) {
            groupsFound.add(getTopicGroup(item.topic));
        }
    });
    
    // Always add "All" button
    container.appendChild(createFilterButton('all', 'All'));
    
    // Add buttons for each found group (sorted alphabetically)
    Array.from(groupsFound).sort().forEach(groupKey => {
        const label = getGroupLabel(groupKey);
        container.appendChild(createFilterButton(groupKey, label));
    });
};

function createFilterButton(key, label) {
    const btn = document.createElement('button');
    btn.onclick = () => filterReview(key);
    btn.dataset.filter = key;
    btn.className = "review-filter px-4 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap transition-all";
    
    if (state.reviewFilter === key) {
        btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
        btn.classList.remove('bg-slate-800', 'border-slate-700', 'text-slate-400');
    } else {
        btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
        btn.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-400', 'hover:border-slate-600');
    }
    
    btn.innerText = label;
    return btn;
}

window.switchReviewTab = function(tab) {
    state.reviewTab = tab;
    
    ['mistakes', 'flagged'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if(btn) {
            if(t === tab) {
                btn.classList.add('bg-medical-600', 'text-white', 'shadow-md');
                btn.classList.remove('text-slate-600', 'hover:bg-slate-200');
            } else {
                btn.classList.remove('bg-medical-600', 'text-white', 'shadow-md');
                btn.classList.add('text-slate-600', 'hover:bg-slate-200');
            }
        }
    });
    
    // Regenerate filters when switching tabs (Flagged items might differ from Mistakes)
    generateReviewFilters();
    renderReviewContent();
};

window.filterReview = function(filter) {
    state.reviewFilter = filter;
    generateReviewFilters(); // Re-render to update active button state
    renderReviewContent();
};

window.renderReviewContent = function() {
    const container = document.getElementById('review-content');
    if(!container) return;
    container.innerHTML = '';
    
    let items = state.reviewTab === 'mistakes' ? getMistakes() : getFlagged();
    
    // --- DYNAMIC FILTER LOGIC ---
    if(state.reviewFilter !== 'all') {
        items = items.filter(i => getTopicGroup(i.topic) === state.reviewFilter);
    }
    
    if(items.length === 0) {
        container.innerHTML = `<div class="text-center text-slate-400 py-8 text-xs italic">${getText('noItems')}</div>`;
        return;
    }
    
items.forEach((item, index) => {
        // ... (start of loop)
        
        const el = document.createElement('div');
        el.className = "bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-3 relative overflow-hidden";
        
        const date = item.date || 'Unknown Date';
        const qText = item.q.q;
        
        // FIX: Try to get info from the saved 'topic' first. 
        // Only use resolveTopic (the ID guesser) as a fallback.
        let topicInfo = null;
        if (item.topic && TOPIC_META[item.topic]) {
            topicInfo = TOPIC_META[item.topic];
        } else {
            topicInfo = resolveTopic(item.q);
        }
        
        const topicLabel = state.lang === 'ar' ? topicInfo.labelAr : topicInfo.label;
        const num = index + 1;
        const type = state.reviewTab;

        const header = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                    <span class="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-bold">${num}</span>
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold text-white ${topicInfo.color}">${topicLabel}</span>
                </div>
                <div class="flex items-center gap-2">
                     <span class="text-[9px] text-slate-400">${date}</span>
                     <button onclick="removeReviewItem('${item.id}', '${type}')" class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                     </button>
                </div>
            </div>
        `;

        const questionBody = `<p class="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3 leading-relaxed ${state.lang === 'ar' ? 'text-right' : 'text-left'}">${qText}</p>`;

        let optionsHTML = '<div class="flex flex-col gap-1.5">';
        
        if (item.q.options && Array.isArray(item.q.options)) {
            const containerId = `flag-opts-${item.id}`;
            
            if (type === 'mistakes') {
                item.q.options.forEach((opt, idx) => {
                    let borderClass = "border-slate-200 dark:border-slate-700";
                    let bgClass = "bg-transparent";
                    let textClass = "text-slate-600 dark:text-slate-300";
                    let icon = `<span class="w-4 h-4 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-[8px] font-bold">${String.fromCharCode(65+idx)}</span>`;

                    if (idx === item.q.correct) {
                        borderClass = "border-green-500";
                        bgClass = "bg-green-50 dark:bg-green-900/20";
                        textClass = "text-green-700 dark:text-green-400 font-bold";
                        icon = `<i data-lucide="check" class="w-4 h-4 text-green-500"></i>`;
                    } else if (idx === item.userIdx) {
                        borderClass = "border-red-500";
                        bgClass = "bg-red-50 dark:bg-red-900/20";
                        textClass = "text-red-700 dark:text-red-400 font-bold";
                        icon = `<i data-lucide="x" class="w-4 h-4 text-red-500"></i>`;
                    }

                    optionsHTML += `
                        <div class="flex items-center gap-2 p-2 rounded-lg border ${borderClass} ${bgClass} text-[10px]">
                            ${icon}
                            <span class="${textClass}">${opt}</span>
                        </div>
                    `;
                });
            } else {
                // Flagged View: Hidden Answer
                optionsHTML = `<div id="${containerId}" class="flex flex-col gap-1.5 cursor-pointer group" onclick="this.classList.add('revealed')">
                    <div class="text-center text-[9px] text-slate-400 italic mb-1 group-hover:text-medical-500 transition-colors">${getText('clickToReveal')}</div>
                `;
                
                item.q.options.forEach((opt, idx) => {
                     const isCorrect = idx === item.q.correct;
                     const correctClass = isCorrect ? 'correct-opt' : '';
                     
                     optionsHTML += `
                        <div class="option-item ${correctClass} flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 transition-all duration-300">
                            <span class="w-4 h-4 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-[8px] font-bold icon-box">${String.fromCharCode(65+idx)}</span>
                            <span>${opt}</span>
                            <span class="ml-auto opacity-0 check-icon"><i data-lucide="check" class="w-3 h-3 text-green-500"></i></span>
                        </div>
                    `;
                });
                
                 optionsHTML += `<style>
                    #${containerId}.revealed .correct-opt { 
                        border-color: #22c55e; 
                        background-color: rgba(34, 197, 94, 0.1); 
                    }
                    #${containerId}.revealed .correct-opt .check-icon { opacity: 1; }
                 </style></div>`;
            }
        }

        optionsHTML += '</div>';

        el.innerHTML = header + questionBody + optionsHTML;
        container.appendChild(el);
    });
    
    lucide.createIcons();
};

window.openPersistentQuestion = function(item) {
    const modal = document.getElementById('question-modal');
    if(!modal) return;
    
    renderQuestionModal(item.q);
    
    const title = document.getElementById('modal-title');
    if(title) title.innerText = state.reviewTab === 'mistakes' ? getText('mistakes') : getText('flagged');
    
    const ids = ['solo-live-stats', 'lifelines-container', 'next-action-container'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    const closeBtn = document.getElementById('close-review-btn');
    if(closeBtn) closeBtn.classList.remove('hidden');
    
    // Hide interactive buttons in review mode from history
    const flagBtn = document.getElementById('flag-btn');
    if(flagBtn) flagBtn.classList.add('hidden');
    const reportBtn = document.getElementById('report-btn');
    if(reportBtn) reportBtn.classList.add('hidden');
    
    updateAnswerUI(item.userIdx, item.q, false); 
    
    if(state.reviewTab === 'flagged') {
        const optsContainer = document.getElementById('options-container');
        if(optsContainer) {
            const opts = optsContainer.querySelectorAll('button');
            opts.forEach((btn, i) => {
                btn.disabled = true;
                if(i === item.q.correct) {
                     btn.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
                }
            });
        }
    }

    modal.classList.remove('hidden');
};

const clearBtn = document.getElementById('clear-history-btn');
if(clearBtn) {
    clearBtn.onclick = () => {
        if(state.reviewTab === 'mistakes') {
            if(clearMistakes(state.reviewFilter)) renderReviewContent();
        } else {
            if(clearFlagged(state.reviewFilter)) renderReviewContent();
        }
    };
}

// --- PERSISTENCE LOGIC FOR REPORTS ---
const STORAGE_KEY_REPORTED = 'medconnect_reported';

function getReportedIDs() {
    try {
        const stored = localStorage.getItem(getScopedKey(STORAGE_KEY_REPORTED));
        return stored ? JSON.parse(stored) : [];
    } catch(e) {
        console.warn("Error reading reported:", e);
        return [];
    }
}

function markQuestionReported(id) {
    try {
        const reported = getReportedIDs();
        if (!reported.includes(id)) {
            reported.push(id);
            localStorage.setItem(getScopedKey(STORAGE_KEY_REPORTED), JSON.stringify(reported));
        }
    } catch(e) { console.warn("Error saving report:", e); }
}

function isQuestionReported(id) {
    return getReportedIDs().includes(id);
}