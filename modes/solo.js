
function showSoloSummary() {
    document.getElementById('question-modal').classList.add('hidden');
    const modal = document.getElementById('winner-modal');
    const title = document.getElementById('winner-title');
    const text = document.getElementById('winner-text');
    const stats = document.getElementById('winner-stats');
    title.innerText = getText('completed');
    text.innerText = getText('sessionFinished');
    const percentage = state.soloTotal > 0 ? Math.round((state.soloScore / state.soloTotal) * 100) : 0;
    stats.innerText = `${getText('score')}: ${state.soloScore}/${state.soloTotal} (${percentage}%)`;
    stats.classList.remove('hidden', 'text-3xl', 'text-gold-500');
    modal.classList.remove('hidden');
}
