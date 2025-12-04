
const clickArea = document.getElementById('click-area');
const resultScreen = document.getElementById('result-screen');
const statusText = document.getElementById('status-text');
const subText = document.getElementById('sub-text');
const statusIcon = document.getElementById('status-icon');

let startTime;
let timeoutId;
let gameState = 'start'; // start, waiting, ready, early

function init() {
    lucide.createIcons();
    updateBestScore();
    setIdleState();
}

function setIdleState() {
    gameState = 'start';
    clickArea.className = 'state-idle';
    statusText.innerText = "اضغط للبدء";
    subText.innerText = "اضغط في أي مكان على الشاشة";
    statusIcon.setAttribute('data-lucide', 'play');
    lucide.createIcons();
    resultScreen.classList.add('hidden');
}

function setWaitingState() {
    gameState = 'waiting';
    clickArea.className = 'state-waiting';
    statusText.innerText = "انتظر اللون الأخضر...";
    subText.innerText = "لا تضغط الآن";
    statusIcon.setAttribute('data-lucide', 'more-horizontal');
    lucide.createIcons();

    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    timeoutId = setTimeout(setReadyState, randomDelay);
}

function setReadyState() {
    gameState = 'ready';
    clickArea.className = 'state-ready';
    statusText.innerText = "اضغط الآن!";
    subText.innerText = "";
    statusIcon.setAttribute('data-lucide', 'zap');
    lucide.createIcons();
    startTime = Date.now();
}

function setEarlyState() {
    clearTimeout(timeoutId);
    gameState = 'early';
    clickArea.className = 'state-early';
    statusText.innerText = "مبكر جداً!";
    subText.innerText = "اضغط للمحاولة مرة أخرى";
    statusIcon.setAttribute('data-lucide', 'alert-circle');
    lucide.createIcons();
}

function showResults(time) {
    gameState = 'result';
    const best = localStorage.getItem('reaction_best_score');
    
    if (!best || time < parseInt(best)) {
        localStorage.setItem('reaction_best_score', time);
        updateBestScore();
    }

    document.getElementById('current-time').innerText = time + " ms";
    resultScreen.classList.remove('hidden');
}

function updateBestScore() {
    const best = localStorage.getItem('reaction_best_score');
    document.getElementById('best-time').innerText = best ? best + " ms" : "--";
}

function resetGame() {
    setWaitingState();
    resultScreen.classList.add('hidden');
}

clickArea.addEventListener('mousedown', handleAction);
clickArea.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent mouse emulation
    handleAction();
});

function handleAction() {
    if (gameState === 'start') {
        setWaitingState();
    } else if (gameState === 'waiting') {
        setEarlyState();
    } else if (gameState === 'early') {
        setWaitingState();
    } else if (gameState === 'ready') {
        const reactionTime = Date.now() - startTime;
        showResults(reactionTime);
    }
}

init();
