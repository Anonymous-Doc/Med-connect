

// Global Cache Variables for Question Banks
window.loadedDerma = null;
window.loadedPatho = null;
window.loadedRiddles = null;
window.loadedGeography = null;
window.loadedSeerah = null;
window.loadedAqidah = null;
window.loadedSurgery1 = null;
window.loadedSurgery2 = null;
window.loadedSurgery3 = null;
window.loadedArabic = null;

window.TOPIC_META = {
    'derma': { label: 'Dermatology', labelAr: 'الجلدية', color: 'bg-blue-500', mode: 'mcq', prefix: 'dermatology' },
    'patho': { label: 'Pathology', labelAr: 'علم الأمراض', color: 'bg-purple-500', mode: 'mcq', prefix: 'clinical' },
    'riddles': { label: 'Brain Teasers', labelAr: 'ألغاز', color: 'bg-pink-500', mode: 'input', prefix: 'riddles' },
    'geography': { label: 'Geography', labelAr: 'جغرافيا', color: 'bg-green-600', mode: 'mcq', prefix: 'geo' },
    'seerah': { label: 'Seerah', labelAr: 'السيرة النبوية', color: 'bg-emerald-600', mode: 'mcq', prefix: 'seerah' },
    'aqidah': { label: 'Aqidah', labelAr: 'العقيدة', color: 'bg-teal-600', mode: 'mcq', prefix: 'aqidah' },
    'surgery1': { label: 'Surgery P1', labelAr: 'جراحة ١', color: 'bg-rose-500', mode: 'mcq', prefix: 'surgery_paper_1' },
    'surgery2': { label: 'Surgery P2', labelAr: 'جراحة ٢', color: 'bg-rose-600', mode: 'mcq', prefix: 'surgery_paper_2' },
    'surgery3': { label: 'Surgery P3', labelAr: 'جراحة ٣', color: 'bg-rose-700', mode: 'mcq', prefix: 'surgery_paper_3' },
    'arabic': { label: 'Arabic', labelAr: 'لغة عربية', color: 'bg-emerald-500', mode: 'mcq', prefix: 'arabic' }
};

window.resolveTopic = function(question) {
    if (!question || !question.id) return { label: 'General', labelAr: 'عام', color: 'bg-medical-500', mode: 'mcq' };
    const id = question.id.toLowerCase();
    for (const key in TOPIC_META) {
        if (id.startsWith(TOPIC_META[key].prefix)) {
            return TOPIC_META[key];
        }
    }
    return { label: 'General', labelAr: 'عام', color: 'bg-medical-500', mode: 'mcq' };
};

window.loadQuestionBank = async function(type) {
    const startBtn = document.querySelector('#setup-modal button[onclick="startGame()"]');
    
    // Determine language and base path from config or defaults
    const lang = state.lang || 'en';
    const config = window.gameConfig || {};
    const basePath = config.basePath || '';
    
    // Construct default global path
    const globalPrefix = `${basePath}qbank/${lang}/`;
    
    // Helper to get URL: prefers specific topic config, falls back to global path
    const getUrl = (topicKey, defaultFile) => {
        if (config.topics && config.topics[topicKey]) {
            return config.topics[topicKey];
        }
        return globalPrefix + defaultFile;
    };
    
    // Only fetch what is requested
    const needsDerma = !loadedDerma && type === 'derma';
    const needsPatho = !loadedPatho && type === 'patho';
    const needsRiddles = !loadedRiddles && type === 'riddles';
    const needsGeography = !loadedGeography && type === 'geography';
    const needsSeerah = !loadedSeerah && type === 'seerah';
    const needsAqidah = !loadedAqidah && type === 'aqidah';
    const needsSurgery1 = !loadedSurgery1 && type === 'surgery1';
    const needsSurgery2 = !loadedSurgery2 && type === 'surgery2';
    const needsSurgery3 = !loadedSurgery3 && type === 'surgery3';
    const needsArabic = !loadedArabic && type === 'arabic';
    
    const needsFetch = needsDerma || needsPatho || needsRiddles || needsGeography || needsSeerah || needsAqidah || needsSurgery1 || needsSurgery2 || needsSurgery3 || needsArabic;
    
    if (needsFetch && startBtn) {
        startBtn.disabled = true;
        startBtn.classList.add('opacity-75', 'cursor-wait');
        const textEl = document.getElementById('start-btn-text');
        if(textEl) textEl.innerText = getText('loading');
    }

    let questions = [];

    try {
        const promises = [];
        
        if (needsDerma) {
            promises.push(
                fetch(getUrl('derma', 'dermatology.json'))
                .then(r => r.json())
                .then(d => loadedDerma = d)
                .catch(e => { console.warn("Failed to load derma:", e); loadedDerma = []; })
            );
        }
        if (needsPatho) {
            promises.push(
                fetch(getUrl('patho', 'clinical_pathology.json'))
                .then(r => r.json())
                .then(d => loadedPatho = d)
                .catch(e => { console.warn("Failed to load patho:", e); loadedPatho = []; })
            );
        }
        if (needsRiddles) {
            promises.push(
                fetch(getUrl('riddles', 'riddles.json'))
                .then(r => r.json())
                .then(d => loadedRiddles = d)
                .catch(e => { console.warn("Failed to load riddles:", e); loadedRiddles = []; })
            );
        }
        if (needsGeography) {
            promises.push(
                fetch(getUrl('geography', 'geography.json'))
                .then(r => r.json())
                .then(d => loadedGeography = d)
                .catch(e => { console.warn("Failed to load geography:", e); loadedGeography = []; })
            );
        }
        if (needsSeerah) {
            promises.push(
                fetch(getUrl('seerah', 'seerah.json'))
                .then(r => r.json())
                .then(d => loadedSeerah = d)
                .catch(e => { console.warn("Failed to load seerah:", e); loadedSeerah = []; })
            );
        }
        if (needsAqidah) {
            promises.push(
                fetch(getUrl('aqidah', 'aqidah.json'))
                .then(r => r.json())
                .then(d => loadedAqidah = d)
                .catch(e => { console.warn("Failed to load aqidah:", e); loadedAqidah = []; })
            );
        }
        if (needsSurgery1) {
            promises.push(
                fetch(getUrl('surgery1', 'surgery_paper_1.json'))
                .then(r => r.json())
                .then(d => loadedSurgery1 = d)
                .catch(e => { console.warn("Failed to load surgery1:", e); loadedSurgery1 = []; })
            );
        }
        if (needsSurgery2) {
            promises.push(
                fetch(getUrl('surgery2', 'surgery_paper_2.json'))
                .then(r => r.json())
                .then(d => loadedSurgery2 = d)
                .catch(e => { console.warn("Failed to load surgery2:", e); loadedSurgery2 = []; })
            );
        }
        if (needsSurgery3) {
            promises.push(
                fetch(getUrl('surgery3', 'surgery_paper_3.json'))
                .then(r => r.json())
                .then(d => loadedSurgery3 = d)
                .catch(e => { console.warn("Failed to load surgery3:", e); loadedSurgery3 = []; })
            );
        }
        if (needsArabic) {
            promises.push(
                fetch(getUrl('arabic', 'arabic.json'))
                .then(r => r.json())
                .then(d => loadedArabic = d)
                .catch(e => { console.warn("Failed to load arabic:", e); loadedArabic = []; })
            );
        }
        
        await Promise.all(promises);

        if (type === 'derma') questions = [...(loadedDerma || [])];
        else if (type === 'patho') questions = [...(loadedPatho || [])];
        else if (type === 'riddles') questions = [...(loadedRiddles || [])];
        else if (type === 'geography') questions = [...(loadedGeography || [])];
        else if (type === 'seerah') questions = [...(loadedSeerah || [])];
        else if (type === 'aqidah') questions = [...(loadedAqidah || [])];
        else if (type === 'surgery1') questions = [...(loadedSurgery1 || [])];
        else if (type === 'surgery2') questions = [...(loadedSurgery2 || [])];
        else if (type === 'surgery3') questions = [...(loadedSurgery3 || [])];
        else if (type === 'arabic') questions = [...(loadedArabic || [])];
        
        // Filter out questions that are missing ID or Difficulty
        questions = questions.filter(q => q.id && q.difficulty);

    } catch (error) {
        console.error("Critical error loading question bank", error);
    } finally {
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-75', 'cursor-wait');
            const textEl = document.getElementById('start-btn-text');
            if(textEl) {
                if (state.gameMode === 'strategy') textEl.innerText = getText('startGame');
                else if (state.gameMode === 'millionaire') textEl.innerText = getText('beginRes');
                else if (state.gameMode === 'points') textEl.innerText = getText('beginBattle');
                else textEl.innerText = getText('startQuiz');
            }
        }
        return questions;
    }
};
