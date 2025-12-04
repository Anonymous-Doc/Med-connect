
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

window.toggleSidebar = function() {
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
};

window.toggleTheme = function() { 
    document.documentElement.classList.toggle('dark'); 
};

window.renderOptions = function(question) {
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
};

window.renderQuestionModal = function(question) {
    const modal = document.getElementById('question-modal');
    const topicInfo = resolveTopic(question);
    
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
    const titleContainer = titleElement.parentNode;
    const headerContainer = titleContainer.parentNode;
    headerContainer.classList.add('relative');
    titleContainer.className = "flex items-center gap-2 title-container relative z-10";
    
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
            <div class="difficulty-badge absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <span class="px-3 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm ${diffClass}">
                    ${diffText}
                </span>
            </div>
        `;
        headerContainer.insertAdjacentHTML('afterbegin', badgeHTML);
    }

    // Add Report Button next to flag button if not exists
    const actionContainer = document.querySelector('.flex.items-center.gap-2:not(.title-container)');
    if(actionContainer) {
        // Remove existing report button if re-rendering to reset state
        const oldReportBtn = document.getElementById('report-btn');
        if(oldReportBtn) oldReportBtn.remove();

        // Check if already reported
        const isReported = isQuestionReported(question.id);
        let reportBtnHTML;

        if (isReported) {
             reportBtnHTML = `
                <button id="report-btn" disabled class="p-1.5 rounded-full text-green-500 cursor-not-allowed" title="${getText('reported')}">
                    <i data-lucide="check" class="w-3 h-3"></i>
                </button>
            `;
        } else {
             reportBtnHTML = `
                <button id="report-btn" onclick="reportCurrentQuestion()" title="${getText('reportQ')}" class="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <i data-lucide="alert-triangle" class="w-3 h-3"></i>
                </button>
            `;
        }

        // Insert before the last element (close button) or append
        const flagBtn = document.getElementById('flag-btn');
        if(flagBtn) {
            flagBtn.insertAdjacentHTML('afterend', reportBtnHTML);
        }
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
             document.getElementById('q-player-badge').innerText += " (Steal!)";
        }
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
};

window.reportCurrentQuestion = function() {
    if(!state.currentQuestion) return;
    
    const btn = document.getElementById('report-btn');
    if(btn.disabled) return;

    const qId = state.currentQuestion.id;
    
    // Mark locally to prevent spam immediately
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    btn.classList.remove('hover:text-red-500', 'hover:bg-red-50', 'dark:hover:bg-red-900/20');
    
    // Email logic
    const email = "prodatoo2003@gmail.com";
    const subject = "Report Question " + qId;
    const body = qId;
    
    // Open mail client
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Mark as reported in storage
    markQuestionReported(qId);

    // Update UI to success state
    btn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-green-500"></i>`;
    btn.title = getText('reported');
    lucide.createIcons();
};

window.updateFlagButtonState = function(id) {
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
};

window.toggleFlagCurrentQuestion = function() {
    if(!state.currentQuestion) return;
    toggleFlagQuestion(state.currentQuestion, state.selectedSpecialty);
    updateFlagButtonState(state.currentQuestion.id);
};

window.updateAnswerUI = function(submission, question, isCorrect) {
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
    } else if (state.gameMode === 'points') {
        // Points Battle Next Action
        if (isCorrect) {
            // Standard correct answer
            nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700";
            nextBtn.innerHTML = `<span>${getText('endTurn')}</span><i data-lucide="arrow-right" class="w-3 h-3 ${arrowIcon}"></i>`;
            nextBtn.onclick = () => {
                document.getElementById('question-card').classList.add('scale-95');
                setTimeout(() => {
                    document.getElementById('question-modal').classList.add('hidden');
                    finishPointsTurn(true);
                }, 150);
            };
        } else {
            // Incorrect Answer
            if (state.isStealMode) {
                // Steal Failed
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-slate-600 hover:bg-slate-700";
                nextBtn.innerHTML = `<span>${getText('endTurn')}</span><i data-lucide="skip-forward" class="w-3 h-3 ${arrowIcon}"></i>`;
                nextBtn.onclick = () => {
                     document.getElementById('question-card').classList.add('scale-95');
                     setTimeout(() => {
                        document.getElementById('question-modal').classList.add('hidden');
                        finishPointsTurn(false);
                     }, 150);
                };
            } else {
                // Original Failed -> Steal Chance
                nextBtn.className = "w-full py-2 rounded-lg font-bold text-white text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600";
                nextBtn.innerHTML = `<span>${getText('attemptSteal')}</span><i data-lucide="zap" class="w-3 h-3"></i>`;
                nextBtn.onclick = () => {
                     // Trigger steal mode in Points Battle
                     initiateSteal();
                };
                
                const passBtn = document.createElement('button');
                passBtn.className = "w-full py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 mt-2";
                passBtn.innerHTML = `<span>${getText('passTurn')}</span>`;
                passBtn.onclick = () => {
                    document.getElementById('question-card').classList.add('scale-95');
                    setTimeout(() => {
                        document.getElementById('question-modal').classList.add('hidden');
                        finishPointsTurn(false); // Treat as missed
                    }, 150);
                }
                nextContainer.appendChild(passBtn);
            }
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
    nextContainer.prepend(nextBtn); // Prepend if passBtn was added
    nextContainer.classList.remove('hidden');
    lucide.createIcons();
};

window.addToHistory = function(player, q, submission, correct) {
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
    document.getElementById('modal-title').innerText = "Review";
    document.getElementById('q-player-badge').classList.add('hidden');
    document.getElementById('solo-live-stats').classList.add('hidden');
    document.getElementById('finish-session-container').classList.add('hidden');
    document.getElementById('lifelines-container').classList.add('hidden');
    document.getElementById('poll-chart').classList.add('hidden');
    document.getElementById('close-review-btn').classList.remove('hidden');
    document.getElementById('question-text').innerText = data.q.q;
    
    if(state.lang === 'ar') document.getElementById('question-text').classList.add('text-right');
    else document.getElementById('question-text').classList.remove('text-right');

    document.getElementById('flag-btn').classList.add('hidden');
    const reportBtn = document.getElementById('report-btn');
    if(reportBtn) reportBtn.classList.add('hidden');

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
                icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-green-50 text-white"><i data-lucide="check" class="w-3 h-3"></i></span>`;
            } else if(i === data.idx && !data.correct) {
                cls += "border-red-500 bg-red-50 dark:bg-red-900/30";
                icon = `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-white"><i data-lucide="x" class="w-3 h-3"></i></span>`;
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
};

window.closeReviewModal = function() {
    if(state.gameActive && state.currentQuestion) {
            renderQuestionModal(state.currentQuestion);
            document.getElementById('flag-btn').classList.remove('hidden');
            const reportBtn = document.getElementById('report-btn');
            if(reportBtn) reportBtn.classList.remove('hidden');
            if(state.currentResult) {
                const isCorrect = state.currentResult === 'correct';
                updateAnswerUI(state.currentSelection, state.currentQuestion, isCorrect);
            }
    } else {
        document.getElementById('question-card').classList.add('scale-95');
        setTimeout(() => {
            document.getElementById('question-modal').classList.add('hidden');
            document.getElementById('flag-btn').classList.remove('hidden');
            const reportBtn = document.getElementById('report-btn');
            if(reportBtn) reportBtn.classList.remove('hidden');
        }, 200);
    }
};

// Review History Implementation
window.openReviewHistory = function() {
    document.getElementById('review-modal').classList.remove('hidden');
    switchReviewTab(state.reviewTab || 'mistakes');
};

window.closeReviewHistory = function() {
    document.getElementById('review-modal').classList.add('hidden');
};

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
    
    renderReviewContent();
};

window.filterReview = function(filter) {
    state.reviewFilter = filter;
    
    document.querySelectorAll('.review-filter').forEach(btn => {
        if(btn.dataset.filter === filter) {
            btn.classList.add('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.remove('border-slate-300', 'text-slate-500');
        } else {
            btn.classList.remove('bg-medical-600', 'text-white', 'border-transparent');
            btn.classList.add('border-slate-300', 'text-slate-500');
        }
    });
    
    renderReviewContent();
};

window.renderReviewContent = function() {
    const container = document.getElementById('review-content');
    container.innerHTML = '';
    
    let items = state.reviewTab === 'mistakes' ? getMistakes() : getFlagged();
    
    if(state.reviewFilter !== 'all') {
        items = items.filter(i => i.topic === state.reviewFilter || (i.q && i.q.id && i.q.id.includes(state.reviewFilter)));
    }
    
    if(items.length === 0) {
        container.innerHTML = `<div class="text-center text-slate-400 py-8 text-xs italic">${getText('noItems')}</div>`;
        return;
    }
    
    items.forEach(item => {
        const el = document.createElement('div');
        el.className = "bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-medical-500 transition-colors group mb-2";
        el.onclick = () => openPersistentQuestion(item);
        
        const date = item.date || 'Unknown Date';
        const qText = item.q.q;
        const topicInfo = resolveTopic(item.q);
        
        el.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold text-white ${topicInfo.color}">${state.lang === 'ar' ? topicInfo.labelAr : topicInfo.label}</span>
                <span class="text-[9px] text-slate-400">${date}</span>
            </div>
            <p class="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 ${state.lang === 'ar' ? 'text-right' : 'text-left'}">${qText}</p>
            ${state.reviewTab === 'mistakes' ? 
                `<div class="flex justify-between text-[9px]">
                    <span class="text-red-500 font-bold truncate max-w-[45%]">${getText('yourAnswer')} ${item.q.options ? item.q.options[item.userIdx] : item.userIdx}</span>
                    <span class="text-green-500 font-bold truncate max-w-[45%]">${getText('correctAnswer')} ${item.q.options ? item.q.options[item.q.correct] : item.q.correct}</span>
                 </div>` 
                : ''}
        `;
        container.appendChild(el);
    });
};

window.openPersistentQuestion = function(item) {
    const modal = document.getElementById('question-modal');
    
    renderQuestionModal(item.q);
    
    document.getElementById('modal-title').innerText = state.reviewTab === 'mistakes' ? getText('mistakes') : getText('flagged');
    document.getElementById('solo-live-stats').classList.add('hidden');
    document.getElementById('lifelines-container').classList.add('hidden');
    document.getElementById('next-action-container').classList.add('hidden');
    document.getElementById('close-review-btn').classList.remove('hidden');
    
    // Hide interactive buttons in review mode from history
    document.getElementById('flag-btn').classList.add('hidden');
    const reportBtn = document.getElementById('report-btn');
    if(reportBtn) reportBtn.classList.add('hidden');
    
    updateAnswerUI(item.userIdx, item.q, false); 
    
    if(state.reviewTab === 'flagged') {
        const opts = document.getElementById('options-container').querySelectorAll('button');
        opts.forEach((btn, i) => {
            btn.disabled = true;
            if(i === item.q.correct) {
                 btn.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
            }
        });
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
    const stored = localStorage.getItem(getScopedKey(STORAGE_KEY_REPORTED));
    return stored ? JSON.parse(stored) : [];
}

function markQuestionReported(id) {
    const reported = getReportedIDs();
    if (!reported.includes(id)) {
        reported.push(id);
        localStorage.setItem(getScopedKey(STORAGE_KEY_REPORTED), JSON.stringify(reported));
    }
}

function isQuestionReported(id) {
    return getReportedIDs().includes(id);
}
