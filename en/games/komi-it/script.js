
const BOARD_SIZE = 6;
const WORD_LENGTH = 5;

let TARGET_WORDS = []; // Will be loaded from bank.json
let currentGuess = '';
let guesses = [];
let gameOver = false;
let solution = '';

const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');
const toast = document.getElementById('toast');

// Seeded Random Number Generator
function seededRandom(seed) {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));
    
    return function() {
        state = (a * state + c) % m;
        return state / (m - 1);
    }
}

function getDailyTarget() {
    if (TARGET_WORDS.length === 0) return "ERROR";

    const epochMs = new Date('2024-01-01T00:00:00').valueOf();
    const now = Date.now();
    const msPerDay = 86400000;
    const dayIndex = Math.floor((now - epochMs) / msPerDay);
    
    // Use the day index as a seed for randomness
    const rng = seededRandom(dayIndex);
    const randomIndex = Math.floor(rng() * TARGET_WORDS.length);
    
    return TARGET_WORDS[randomIndex];
}

async function initGame() {
    // Load Word Bank
    try {
        const response = await fetch('bank.json');
        const data = await response.json();
        // Normalize to uppercase
        TARGET_WORDS = data.map(w => w.toUpperCase());
    } catch (e) {
        console.error("Failed to load bank.json", e);
        showToast("Error loading word bank");
        return;
    }

    if (TARGET_WORDS.length === 0) {
        showToast("Word bank is empty");
        return;
    }

    solution = getDailyTarget();
    
    // Initialize Board UI
    board.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        board.appendChild(row);
    }

    // Initialize Keyboard UI
    const keys = [
        'QWERTYUIOP',
        'ASDFGHJKL',
        'ZXCVBNM'
    ];
    
    keyboard.innerHTML = '';
    keys.forEach((rowString, i) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        if (i === 2) {
            // Add Enter key
            const enterKey = createKey('ENTER');
            enterKey.classList.add('wide');
            rowDiv.appendChild(enterKey);
        }

        rowString.split('').forEach(char => {
            rowDiv.appendChild(createKey(char));
        });

        if (i === 2) {
            // Add Backspace key
            const bsKey = createKey('⌫');
            bsKey.classList.add('wide');
            bsKey.dataset.key = 'BACKSPACE';
            rowDiv.appendChild(bsKey);
        }
        
        keyboard.appendChild(rowDiv);
    });

    loadState();
    updateBoard();
    
    // Add global event listener
    document.addEventListener('keydown', handleKeyDown);
}

function createKey(char) {
    const key = document.createElement('button');
    key.textContent = char;
    key.className = 'key';
    key.dataset.key = char;
    key.addEventListener('click', () => handleInput(char === '⌫' ? 'BACKSPACE' : char));
    return key;
}

function handleKeyDown(e) {
    if (gameOver) return;
    
    const key = e.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE') {
        handleInput(key);
    } else if (/^[A-Z]$/.test(key)) {
        handleInput(key);
    }
}

function handleInput(key) {
    if (gameOver) return;

    if (key === 'BACKSPACE') {
        currentGuess = currentGuess.slice(0, -1);
    } else if (key === 'ENTER') {
        if (currentGuess.length === WORD_LENGTH) {
            submitGuess();
        } else {
            showToast('Not enough letters');
            shakeRow();
        }
    } else if (currentGuess.length < WORD_LENGTH) {
        currentGuess += key;
    }
    updateBoard();
}

function submitGuess() {
    // Validate against bank
    if (!TARGET_WORDS.includes(currentGuess)) {
        showToast('Not in word list');
        shakeRow();
        return;
    }

    guesses.push(currentGuess);
    currentGuess = '';
    
    saveState();
    animateRow(guesses.length - 1);
    updateKeyboard();

    const lastGuess = guesses[guesses.length - 1];
    
    if (lastGuess === solution) {
        gameOver = true;
        setTimeout(() => {
            showToast(getWinMessage(guesses.length), 2000);
            showShareButton();
        }, 1500);
    } else if (guesses.length === BOARD_SIZE) {
        gameOver = true;
        setTimeout(() => {
            showToast(solution, 5000);
        }, 1500);
    }
}

function updateBoard() {
    const rows = board.children;
    
    // Render previous guesses
    guesses.forEach((guess, i) => {
        const row = rows[i];
        const tiles = row.children;
        for (let j = 0; j < WORD_LENGTH; j++) {
            tiles[j].textContent = guess[j];
            colorTile(tiles[j], guess[j], j, solution, true);
        }
    });

    // Render current guess
    if (guesses.length < BOARD_SIZE) {
        const currentRow = rows[guesses.length];
        const tiles = currentRow.children;
        for (let j = 0; j < WORD_LENGTH; j++) {
            const letter = currentGuess[j] || '';
            tiles[j].textContent = letter;
            tiles[j].className = 'tile' + (letter ? ' active' : '');
        }
    }
}

function colorTile(tile, letter, index, sol, finalize) {
    // Logic to color tiles based on correctness
    // This is a simplified logic. A full Wordle implementation handles duplicates more strictly.
    // For strict coloring we need to count frequencies.
    
    if (!finalize) return;

    const solArr = sol.split('');
    const letterCounts = {};
    solArr.forEach(l => letterCounts[l] = (letterCounts[l] || 0) + 1);

    // First pass: Correct (Green)
    // We need the full guess to do this properly, but this function processes one tile.
    // Better to process row by row. See animateRow.
    
    // Fallback simple coloring if called individually (mostly for restore)
    // Actually, let's rely on animateRow and updateKeyboard for state, 
    // and this function just for visual consistency on reload.
    
    // Proper logic for reload:
    // We need the full guess this tile belongs to.
    // Let's assume `tile` is in a row that corresponds to a full guess.
    
    // To keep it simple, we will replicate the logic used in animation but instantly.
    const row = tile.parentElement;
    const rowIdx = Array.from(board.children).indexOf(row);
    if(rowIdx === -1) return; // Should not happen
    
    const guess = guesses[rowIdx];
    if (!guess) return;

    // Calculate colors for the whole row
    const colors = getColors(guess, sol);
    const color = colors[index];
    
    tile.classList.add(color);
}

function getColors(guess, sol) {
    const solArr = sol.split('');
    const guessArr = guess.split('');
    const colors = new Array(5).fill('absent');
    const solCounts = {};

    solArr.forEach(l => solCounts[l] = (solCounts[l] || 0) + 1);

    // Green Pass
    guessArr.forEach((l, i) => {
        if (l === solArr[i]) {
            colors[i] = 'correct';
            solCounts[l]--;
        }
    });

    // Yellow Pass
    guessArr.forEach((l, i) => {
        if (colors[i] !== 'correct' && solCounts[l] > 0) {
            colors[i] = 'present';
            solCounts[l]--;
        }
    });

    return colors;
}

function updateKeyboard() {
    guesses.forEach(guess => {
        const colors = getColors(guess, solution);
        guess.split('').forEach((letter, i) => {
            const key = document.querySelector(`.key[data-key="${letter}"]`);
            if (!key) return;
            
            const color = colors[i];
            // Logic to upgrade color: absent -> present -> correct
            if (color === 'correct') {
                key.className = 'key correct';
            } else if (color === 'present' && !key.classList.contains('correct')) {
                key.className = 'key present';
            } else if (color === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
                key.className = 'key absent';
            }
        });
    });
}

function animateRow(rowIdx) {
    const row = board.children[rowIdx];
    const tiles = row.children;
    const guess = guesses[rowIdx];
    const colors = getColors(guess, solution);

    for (let i = 0; i < WORD_LENGTH; i++) {
        setTimeout(() => {
            tiles[i].classList.add('flip');
            tiles[i].classList.add(colors[i]);
        }, i * 100); // Cascade animation
    }
}

function shakeRow() {
    if (guesses.length >= BOARD_SIZE) return;
    const row = board.children[guesses.length];
    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 500);
}

function showToast(msg, duration = 2000) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function getWinMessage(attempts) {
    const messages = ['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'];
    return messages[attempts - 1] || 'Good';
}

// --- Persistence ---

function saveState() {
    const state = {
        guesses,
        solution, // Save solution to check for day change
        gameOver,
        lastPlayed: Date.now()
    };
    localStorage.setItem('komi_it_state', JSON.stringify(state));
}

function loadState() {
    const stateString = localStorage.getItem('komi_it_state');
    if (!stateString) return;

    const state = JSON.parse(stateString);
    
    // If stored solution matches today's solution, restore
    if (state.solution === solution) {
        guesses = state.guesses;
        gameOver = state.gameOver;
        updateKeyboard();
        
        // Restore colors instantly (no animation)
        // updateBoard calls colorTile which does the logic
        
        if (gameOver) {
            setTimeout(() => {
               showToast(guesses[guesses.length-1] === solution ? getWinMessage(guesses.length) : solution, 3000);
               if(guesses[guesses.length-1] === solution) showShareButton();
            }, 500);
        }
    } else {
        // New day or new word -> clear storage
        localStorage.removeItem('komi_it_state');
    }
}

function showShareButton() {
    const header = document.querySelector('header');
    // Remove existing share button if any
    const existing = document.getElementById('share-btn');
    if(existing) return;

    const btn = document.createElement('button');
    btn.id = 'share-btn';
    btn.className = 'header-btn';
    btn.innerHTML = '<i data-lucide="share-2" style="width: 20px; height: 20px;"></i>';
    btn.style.color = '#22c55e';
    btn.onclick = shareResult;
    
    // Replace the dummy rotate button or append
    const dummy = header.lastElementChild;
    if (dummy && dummy.style.opacity === '0') {
        header.replaceChild(btn, dummy);
    } else {
        header.appendChild(btn);
    }
    lucide.createIcons();
}

function shareResult() {
    const title = "Komi-it Daily";
    const attemptCount = guesses.length;
    const max = BOARD_SIZE;
    
    let gridText = "";
    guesses.forEach(g => {
        const colors = getColors(g, solution);
        gridText += colors.map(c => c === 'correct' ? '🟩' : c === 'present' ? '🟨' : '⬜').join('') + "\n";
    });

    const text = `${title} ${attemptCount}/${max}\n\n${gridText}`;
    
    if (navigator.share) {
        navigator.share({ text: text }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard!"));
    }
}

// Load game on start (async to wait for fetch)
document.addEventListener('DOMContentLoaded', initGame);
