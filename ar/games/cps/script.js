
const clickZone = document.getElementById('click-zone');
const clickCountEl = document.getElementById('click-count');
const timerEl = document.getElementById('timer');
const startOverlay = document.getElementById('start-overlay');
const ripplesContainer = document.getElementById('ripples');
const resultModal = document.getElementById('result-modal');
const finalCpsEl = document.getElementById('final-cps');
const finalClicksEl = document.getElementById('final-clicks');
const bestCpsEl = document.getElementById('best-cps');

let clicks = 0;
let isPlaying = false;
let timeLeft = 5.00;
let timerInterval;
const DURATION = 5.00;

function init() {
    lucide.createIcons();
    updateBestDisplay();
}

function updateBestDisplay() {
    const best = localStorage.getItem('cps_best_score') || '0.0';
    bestCpsEl.innerText = `${best} CPS`;
}

function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    clicks = 0;
    timeLeft = DURATION;
    clickCountEl.innerText = '0';
    startOverlay.style.opacity = '0';
    setTimeout(() => startOverlay.classList.add('hidden'), 300);
    
    const startTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timeLeft = Math.max(0, DURATION - elapsed);
        timerEl.innerText = timeLeft.toFixed(2);

        if (timeLeft <= 0) {
            endGame();
        }
    }, 10);
}

function endGame() {
    clearInterval(timerInterval);
    isPlaying = false;
    timerEl.innerText = "0.00";
    
    const cps = (clicks / DURATION).toFixed(2);
    
    // Save best score
    const currentBest = parseFloat(localStorage.getItem('cps_best_score') || '0');
    if (parseFloat(cps) > currentBest) {
        localStorage.setItem('cps_best_score', cps);
    }
    
    finalClicksEl.innerText = clicks;
    finalCpsEl.innerText = cps;
    updateBestDisplay();
    
    resultModal.classList.remove('hidden');
}

function resetGame() {
    resultModal.classList.add('hidden');
    startOverlay.classList.remove('hidden');
    // Force reflow for transition
    void startOverlay.offsetWidth;
    startOverlay.style.opacity = '1';
    
    clicks = 0;
    timeLeft = DURATION;
    clickCountEl.innerText = '0';
    timerEl.innerText = "5.00";
}

function createRipple(e) {
    const circle = document.createElement('div');
    const rect = clickZone.getBoundingClientRect();
    
    // Calculate position relative to the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    circle.classList.add('ripple');
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    
    ripplesContainer.appendChild(circle);
    
    // Remove element after animation
    setTimeout(() => circle.remove(), 600);
}

// Handle Interaction
clickZone.addEventListener('mousedown', (e) => {
    // Prevent default to ensure smooth clicking
    e.preventDefault(); 
    
    if (!isPlaying && timeLeft === DURATION) {
        startGame();
    }
    
    if (isPlaying) {
        clicks++;
        clickCountEl.innerText = clicks;
        createRipple(e);
    }
});

// Support for touch devices
clickZone.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent mouse emulation
    const touch = e.touches[0];
    
    // Mock a mouse event structure for createRipple
    const mockEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    
    if (!isPlaying && timeLeft === DURATION) {
        startGame();
    }
    
    if (isPlaying) {
        clicks++;
        clickCountEl.innerText = clicks;
        createRipple(mockEvent);
    }
});

init();
