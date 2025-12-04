

function renderLadder() {
    const ladderEl = document.getElementById('money-ladder');
    ladderEl.innerHTML = '';
    LADDER.forEach((step, idx) => {
        const isActive = idx === state.ladderIndex;
        const isPassed = idx < state.ladderIndex;
        const isSafe = step.safe;
        const stepEl = document.createElement('div');
        let classes = "ladder-step flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ";
        
        if (isActive) classes += "active ring-2 ring-medical-500 bg-white dark:bg-slate-800 text-medical-600 z-10 ";
        else if (isPassed) classes += "completed text-green-500 bg-green-50 dark:bg-green-900/10 ";
        else classes += "text-slate-400 dark:text-slate-500 ";

        if (isSafe) classes += " safe-haven border-l-4 border-gold-400";

        stepEl.className = classes;
        stepEl.innerHTML = `
            <span class="text-[9px] opacity-70 w-6">${idx + 1}</span>
            <span class="${isSafe ? 'text-gold-500 dark:text-gold-400' : ''}">$${step.val.toLocaleString()}</span>
        `;
        ladderEl.appendChild(stepEl);
    });
    setTimeout(() => {
        const active = ladderEl.querySelector('.active');
        if(active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function updateMillionaireDisplay() {
    const currentVal = LADDER[state.ladderIndex].val;
    document.getElementById('mil-current-prize').innerText = `$${currentVal.toLocaleString()}`;
    document.getElementById('mil-next-btn').style.display = 'flex';
}

function handleMillionaireProgress(won) {
    // Reset question state to prevent re-opening via review
    state.currentQuestion = null;
    state.currentResult = null;
    state.currentSelection = null;

    if (won) {
        if (LADDER[state.ladderIndex].safe) {
            state.safeAmount = LADDER[state.ladderIndex].val;
        }
        state.ladderIndex++;
        if (state.ladderIndex >= LADDER.length) {
            showMillionaireEnd(true, LADDER[LADDER.length - 1].val);
        } else {
            renderLadder();
            updateMillionaireDisplay();
        }
    } else {
        showMillionaireEnd(false, state.safeAmount);
    }
}

function showMillionaireEnd(victory, amount) {
    document.getElementById('winner-title').innerText = victory ? getText('completed') : getText('eliminated');
    document.getElementById('winner-text').innerText = victory 
        ? getText('topRank') 
        : getText('walkAway');
    const stats = document.getElementById('winner-stats');
    stats.innerText = `$${amount.toLocaleString()}`;
    stats.classList.remove('hidden');
    stats.classList.add('text-3xl', 'text-gold-500');
    document.getElementById('winner-modal').classList.remove('hidden');
}

function useLifeline(type) {
    if (!state.lifelines[type] || !state.currentQuestion) return;
    state.lifelines[type] = false;
    document.getElementById(`lifeline-${type}`).disabled = true;

    const correctIdx = state.currentQuestion.correct;
    const opts = document.querySelectorAll('#options-container button');

    if (type === '5050') {
        let indices = [0, 1, 2, 3].filter(i => i !== correctIdx).sort(() => Math.random() - 0.5);
        indices.slice(0, 2).forEach(idx => {
            opts[idx].style.visibility = 'hidden';
            opts[idx].disabled = true;
        });
    } else if (type === 'consult') {
        const isSmart = Math.random() > 0.1;
        const suggestIdx = isSmart ? correctIdx : Math.floor(Math.random() * 4);
        opts[suggestIdx].classList.add('ring-2', 'ring-gold-500', 'bg-gold-50', 'dark:bg-gold-900/20');
        const badge = opts[suggestIdx].querySelector('span:nth-child(2)');
        badge.innerText += " (Suggested)";
    } else if (type === 'poll') {
        document.getElementById('poll-chart').classList.remove('hidden');
        const barsContainer = document.getElementById('poll-bars');
        barsContainer.innerHTML = '';
        let percentages = [0,0,0,0];
        percentages[correctIdx] = 40 + Math.floor(Math.random() * 30);
        let remaining = 100 - percentages[correctIdx];
        for(let i=0; i<4; i++) {
            if(i === correctIdx) continue;
            let p = Math.floor(Math.random() * (remaining / 2));
            percentages[i] = p;
            remaining -= p;
        }
        const leftoverIdx = [0,1,2,3].filter(i => i !== correctIdx)[0];
        percentages[leftoverIdx] += remaining;

        percentages.forEach((p, i) => {
            const h = Math.max(10, p);
            const bar = document.createElement('div');
            bar.className = "flex flex-col items-center justify-end h-full w-full gap-1";
            bar.innerHTML = `<span class="text-[8px] font-bold text-slate-500">${p}%</span><div class="w-full bg-blue-500 dark:bg-blue-600 rounded-t-sm transition-all duration-1000" style="height: 0%"></div><span class="text-[9px] font-bold">${String.fromCharCode(65+i)}</span>`;
            barsContainer.appendChild(bar);
            setTimeout(() => { bar.querySelector('div').style.height = `${h}%`; }, 50);
        });
    }
}
