





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
                    btn = document.createElement('button');
                    btn.className = "specialty-btn py-1.5 px-1 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5";
                    btn.onclick = () => selectSpecialty(t);
                    btn.dataset.type = t;
                    btn.id = `btn-topic-${t}`;
                    
                    let iconName = 'book';
                    if(t === 'geography') iconName = 'globe';
                    if(t === 'seerah') iconName = 'moon';
                    if(t === 'aqidah') iconName = 'book-open';
                    if(t === 'arabic') iconName = 'languages';
                    if(t.startsWith('surgery')) iconName = 'scissors';
                    
                    btn.innerHTML = `<i data-lucide="${iconName}" class="w-3 h-3 text-slate-400 icon-wrapper"></i><span class="text-[9px] font-bold">${label}</span>`;
                    topicContainer.appendChild(btn);
                } else if (btn) {
                    btn.classList.remove('hidden');
                }
            });
        }
    }

    // Refresh UI based on selection
    updateTopicButtonsUI();
    lucide.createIcons();

    const soloBtn = document.querySelector('button[data-mode="solo"]');
    
    // Adjust grid layout for mode buttons
    const modeGrid = document.querySelector('#setup-modal .grid:not(#topic-grid)'); 
    if(modeGrid) {
        if (document.querySelector('button[data-mode="points"]')) {
             modeGrid.classList.remove('grid-cols-3');
             modeGrid.classList.add('grid-cols-2');
        } else {
             modeGrid.classList.add('grid-cols-3');
             modeGrid.classList.remove('grid-cols-2');
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
    if (!state.questionLimit) state.questionLimit = 10;

    // Apply visual selections based on state
    selectGameMode(state.gameMode);
    selectPlayerCount(state.activePlayersCount);
    selectGridWidth(state.activeColCount);
    selectQuestionLimit(state.questionLimit);
    
    state.isSidebarOpen = window.innerWidth >= 768;
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isRTL = state.lang === 'ar';
    const activeClass = isRTL ? 'translate-x-full' : '-translate-x-full';

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

lucide.createIcons();
// Only init if not already initted to prevent double execution
if(!window.gameInitialized) {
    window.gameInitialized = true;
    initGameSetup();
}
