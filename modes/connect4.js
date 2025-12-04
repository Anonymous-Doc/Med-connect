

function handleColumnClick(c) {
    // 1. Check if game is active and in correct mode
    if(!state.gameActive || (state.gameMode !== 'strategy')) return;
    
    // 2. Check if column is full (Row 0 is the top)
    if(state.board[0][c] !== 0) {
        console.log("Column is full");
        return;
    }

    // 3. Calculate target row and difficulty
    let r = ROWS - 1;
    let targetRow = -1;
    while(r >= 0) {
        if(state.board[r][c] === 0) {
            targetRow = r;
            break;
        }
        r--;
    }

    // Difficulty Logic:
    // Bottom 3 rows (Indices 7, 8, 9) -> Easy (1)
    // Middle 3 rows (Indices 4, 5, 6) -> Medium (2)
    // Top 4 rows (Indices 0, 1, 2, 3) -> Hard (3)
    let diff = 1;
    if (targetRow <= 3) diff = 3;
    else if (targetRow <= 6) diff = 2;
    else diff = 1;

    state.targetDifficulty = diff;
    state.pendingColumn = c;
    console.log(`Column ${c} selected. Target Row ${targetRow}. Difficulty ${diff}`);
    showQuestion();
}

function dropPiece(col) {
    let r = ROWS - 1;
    let placedRow = -1;

    // Find the lowest empty spot
    while(r >= 0) {
        if(state.board[r][col] === 0) {
            state.board[r][col] = PLAYERS_CONFIG[state.currentPlayerIndex].id;
            placedRow = r;
            break;
        }
        r--;
    }

    // Only proceed if we actually placed a piece
    if (placedRow !== -1) {
        console.log(`Piece placed at Row ${placedRow}, Col ${col}`);
        renderGrid({r: placedRow, c: col});
        
        // Check for win
        if(checkWin(placedRow, col)) {
            handleWin();
        } else {
            switchTurn();
        }
    } else {
        console.error("Error: Attempted to drop piece in full column despite checks.");
    }
}

function switchTurn() {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.activePlayersCount;
    
    // Reset turn state to prevent review modal from re-opening old questions
    state.currentQuestion = null;
    state.currentResult = null;
    state.currentSelection = null;
    state.pendingColumn = null;
    state.targetDifficulty = null;

    renderScoreboard();
}

function checkWin(r, c) {
    const p = state.board[r][c];
    // Directions: Horizontal, Vertical, Diagonal /, Diagonal \
    const dirs = [[0,1], [1,0], [1,1], [1,-1]];
    
    for(let [dr, dc] of dirs) {
        let count = 1;
        // Check positive direction
        for(let i=1; i<4; i++) {
            const nr = r + dr*i, nc = c + dc*i;
            if(nr<0 || nr>=ROWS || nc<0 || nc>=state.activeColCount || state.board[nr][nc]!==p) break;
            count++;
        }
        // Check negative direction
        for(let i=1; i<4; i++) {
            const nr = r - dr*i, nc = c - dc*i;
            if(nr<0 || nr>=ROWS || nc<0 || nc>=state.activeColCount || state.board[nr][nc]!==p) break;
            count++;
        }
        if(count >= 4) return true;
    }
    return false;
}

function handleWin() {
    state.gameActive = false;
    const player = PLAYERS_CONFIG[state.currentPlayerIndex];
    
    // Update Winner Modal Text
    document.getElementById('winner-title').innerText = getText('victory');
    document.getElementById('winner-text').innerText = `${player.name} ${getText('wins')}`;
    
    // Hide stats used in solo mode
    document.getElementById('winner-stats').classList.add('hidden');
    
    // Show Modal
    document.getElementById('winner-modal').classList.remove('hidden');
}

function renderGrid(animPos = null) {
    const grid = document.getElementById('game-grid');
    if(!grid) return;

    grid.style.gridTemplateColumns = `repeat(${state.activeColCount}, minmax(0, 1fr))`;
    grid.innerHTML = '';
    
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<state.activeColCount; c++) {
            const cell = document.createElement('div');
            
            // Base styling
            let classes = "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 aspect-square rounded-full flex items-center justify-center shadow-inner transition-all duration-300 ";
            
            const val = state.board[r][c];
            if(val === 0) {
                // Empty cell
                classes += "bg-blue-800/50 dark:bg-blue-950/50";
            } else {
                // Filled cell
                const p = PLAYERS_CONFIG.find(x => x.id === val);
                if(p) {
                    classes += `${p.colorClass} shadow-lg `;
                    // Add animation if this is the newly placed piece
                    if(animPos && animPos.r === r && animPos.c === c) {
                        classes += "animate-bounce-drop ";
                    }
                }
            }
            
            cell.className = classes;
            grid.appendChild(cell);
        }
    }
}

function renderHeaders() {
    const h = document.getElementById('column-headers');
    if(!h) return;
    
    h.style.gridTemplateColumns = `repeat(${state.activeColCount}, minmax(0, 1fr))`;
    h.innerHTML = '';
    
    for(let i=0; i<state.activeColCount; i++) {
        const el = document.createElement('div');
        el.className = "text-[9px] font-bold text-white/50";
        el.innerText = i+1;
        h.appendChild(el);
    }
}

function renderSelectors() {
    const s = document.getElementById('column-selectors');
    if(!s) return;

    s.style.gridTemplateColumns = `repeat(${state.activeColCount}, minmax(0, 1fr))`;
    s.innerHTML = '';
    
    for(let c=0; c<state.activeColCount; c++) {
        const el = document.createElement('div');
        el.className = "cursor-pointer hover:bg-white/10 transition-colors rounded-full h-full";
        // Important: Bind click event
        el.onclick = () => handleColumnClick(c);
        s.appendChild(el);
    }
}

function renderScoreboard() {
    const sb = document.getElementById('scoreboard');
    if(!sb) return;

    sb.innerHTML = '';
    for(let i=0; i<state.activePlayersCount; i++) {
        const p = PLAYERS_CONFIG[i];
        const active = i === state.currentPlayerIndex;
        const score = state.playerScores[p.id];
        
        const card = document.createElement('div');
        const activeClass = active ? 
            `bg-white dark:bg-slate-800 scale-105 shadow-xl z-10 ${p.ringClass.replace('ring-','border-')}` : 
            'bg-slate-100 dark:bg-slate-800/50 border-transparent opacity-60 scale-95';
            
        card.className = `flex flex-col items-center justify-center p-1.5 rounded-lg border-2 transition-all min-w-[60px] ${activeClass}`;
        
        card.innerHTML = `
            <div class="w-2 h-2 rounded-full mb-0.5 ${p.colorClass}"></div>
            <span class="text-[10px] font-bold ${p.textClass}">${p.name}</span>
            <span class="text-[9px] font-bold bg-slate-200 dark:bg-slate-700 px-1 py-0 rounded mt-0.5 text-slate-600 dark:text-slate-300">${score}</span>
        `;
        sb.appendChild(card);
    }
}
