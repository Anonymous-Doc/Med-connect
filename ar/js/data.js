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
window.loadedSurgery1Extra = null;
window.loadedSurgery2Extra = null;
window.loadedSurgery3Extra = null;
window.loadedSurgery1AI = null;
window.loadedSurgery2AI = null;
window.loadedSurgery3AI = null;
window.loadedArabic = null;

window.TOPIC_META = {
    'derma': { label: 'Dermatology', labelAr: 'الجلدية', color: 'bg-blue-500', mode: 'mcq', prefix: 'dermatology' },
    'patho': { label: 'Pathology', labelAr: 'علم الأمراض', color: 'bg-purple-500', mode: 'mcq', prefix: 'clinical' },
    'riddles': { label: 'Brain Teasers', labelAr: 'ألغاز', color: 'bg-pink-500', mode: 'input', prefix: 'riddles' },
    'geography': { label: 'Geography', labelAr: 'جغرافيا', color: 'bg-green-600', mode: 'mcq', prefix: 'geo' },
    'seerah': { label: 'Seerah', labelAr: 'السيرة النبوية', color: 'bg-emerald-600', mode: 'mcq', prefix: 'seerah' },
    'aqidah': { label: 'Aqidah', labelAr: 'العقيدة', color: 'bg-teal-600', mode: 'mcq', prefix: 'aqidah' },
    'surgery1': { label: 'Surgery P1', labelAr: 'جراحة ١', color: 'bg-rose-500', mode: 'mcq', prefix: 'surgery' },
    'surgery2': { label: 'Surgery P2', labelAr: 'جراحة ٢', color: 'bg-rose-600', mode: 'mcq', prefix: 'surgery' },
    'surgery3': { label: 'Surgery P3', labelAr: 'جراحة ٣', color: 'bg-rose-700', mode: 'mcq', prefix: 'surgery' },
    'surgery1_extra': { label: 'Surgery P1 (Extra)', labelAr: 'جراحة ١ (إضافي)', color: 'bg-orange-500', mode: 'mcq', prefix: 'surgery' },
    'surgery2_extra': { label: 'Surgery P2 (Extra)', labelAr: 'جراحة ٢ (إضافي)', color: 'bg-orange-600', mode: 'mcq', prefix: 'surgery' },
    'surgery3_extra': { label: 'Surgery P3 (Extra)', labelAr: 'جراحة ٣ (إضافي)', color: 'bg-orange-700', mode: 'mcq', prefix: 'surgery' },
    'surgery1_ai': { label: 'Surgery P1 (AI)', labelAr: 'جراحة ١ (ذكاء)', color: 'bg-violet-500', mode: 'mcq', prefix: 'surgery' },
    'surgery2_ai': { label: 'Surgery P2 (AI)', labelAr: 'جراحة ٢ (ذكاء)', color: 'bg-violet-600', mode: 'mcq', prefix: 'surgery' },
    'surgery3_ai': { label: 'Surgery P3 (AI)', labelAr: 'جراحة ٣ (ذكاء)', color: 'bg-violet-700', mode: 'mcq', prefix: 'surgery' },
    'arabic': { label: 'Arabic', labelAr: 'لغة عربية', color: 'bg-emerald-500', mode: 'mcq', prefix: 'arabic' }
};

window.resolveTopic = function(question) {
    if (!question) return { label: 'General', labelAr: 'عام', color: 'bg-medical-500', mode: 'mcq' };
    
    // 1. Check for the injected tag first (Robust Method)
    if (question._topic && TOPIC_META[question._topic]) {
        return TOPIC_META[question._topic];
    }

    // 2. Fallback to ID prefix (Legacy Method)
    if (question.id) {
        const id = question.id.toLowerCase();
        for (const key in TOPIC_META) {
            if (id.startsWith(TOPIC_META[key].prefix)) {
                return TOPIC_META[key];
            }
        }
    }
    
    return { label: 'General', labelAr: 'عام', color: 'bg-medical-500', mode: 'mcq' };
};

window.loadQuestionBank = async function(type) {
    const startBtn = document.querySelector('#setup-modal button[onclick="startGame()"]');
    
    const lang = state.lang || 'en';
    const config = window.gameConfig || {};
    const basePath = config.basePath || '';
    const globalPrefix = `${basePath}qbank/${lang}/`;
    
    const getUrl = (topicKey, defaultFile) => {
        if (config.topics && config.topics[topicKey]) {
            return config.topics[topicKey];
        }
        return globalPrefix + defaultFile;
    };
    
    // Helper to fetch and TAG the questions
    const fetchAndTag = (url, topicKey) => {
        return fetch(url)
            .then(r => r.json())
            .then(data => {
                // Inject the topic key into every question
                return data.map(q => ({ ...q, _topic: topicKey }));
            });
    };

    // Need flags
    const needsDerma = !loadedDerma && type === 'derma';
    const needsPatho = !loadedPatho && type === 'patho';
    const needsRiddles = !loadedRiddles && type === 'riddles';
    const needsGeography = !loadedGeography && type === 'geography';
    const needsSeerah = !loadedSeerah && type === 'seerah';
    const needsAqidah = !loadedAqidah && type === 'aqidah';
    const needsSurgery1 = !loadedSurgery1 && type === 'surgery1';
    const needsSurgery2 = !loadedSurgery2 && type === 'surgery2';
    const needsSurgery3 = !loadedSurgery3 && type === 'surgery3';
    const needsSurgery1Extra = !loadedSurgery1Extra && type === 'surgery1_extra';
    const needsSurgery2Extra = !loadedSurgery2Extra && type === 'surgery2_extra';
    const needsSurgery3Extra = !loadedSurgery3Extra && type === 'surgery3_extra';
    const needsSurgery1AI = !loadedSurgery1AI && type === 'surgery1_ai';
    const needsSurgery2AI = !loadedSurgery2AI && type === 'surgery2_ai';
    const needsSurgery3AI = !loadedSurgery3AI && type === 'surgery3_ai';
    const needsArabic = !loadedArabic && type === 'arabic';
    
    const needsFetch = needsDerma || needsPatho || needsRiddles || needsGeography || needsSeerah || needsAqidah || 
                       needsSurgery1 || needsSurgery2 || needsSurgery3 || 
                       needsSurgery1Extra || needsSurgery2Extra || needsSurgery3Extra ||
                       needsSurgery1AI || needsSurgery2AI || needsSurgery3AI ||
                       needsArabic;
    
    if (needsFetch && startBtn) {
        startBtn.disabled = true;
        startBtn.classList.add('opacity-75', 'cursor-wait');
        const textEl = document.getElementById('start-btn-text');
        if(textEl) textEl.innerText = getText('loading');
    }

    let questions = [];

    try {
        const promises = [];
        
        if (needsDerma) promises.push(fetchAndTag(getUrl('derma', 'dermatology.json'), 'derma').then(d => loadedDerma = d).catch(e => { console.warn("Failed: derma", e); loadedDerma = []; }));
        if (needsPatho) promises.push(fetchAndTag(getUrl('patho', 'clinical_pathology.json'), 'patho').then(d => loadedPatho = d).catch(e => { console.warn("Failed: patho", e); loadedPatho = []; }));
        
        // Tag riddles specifically so input mode triggers
        if (needsRiddles) promises.push(fetchAndTag(getUrl('riddles', 'riddles.json'), 'riddles').then(d => loadedRiddles = d).catch(e => { console.warn("Failed: riddles", e); loadedRiddles = []; }));
        if (needsGeography) promises.push(fetchAndTag(getUrl('geography', 'geography.json'), 'geography').then(d => loadedGeography = d).catch(e => { console.warn("Failed: geography", e); loadedGeography = []; }));
        
        if (needsSeerah) promises.push(fetchAndTag(getUrl('seerah', 'seerah.json'), 'seerah').then(d => loadedSeerah = d).catch(e => { console.warn("Failed: seerah", e); loadedSeerah = []; }));
        if (needsAqidah) promises.push(fetchAndTag(getUrl('aqidah', 'aqidah.json'), 'aqidah').then(d => loadedAqidah = d).catch(e => { console.warn("Failed: aqidah", e); loadedAqidah = []; }));
        
        // Surgery
        if (needsSurgery1) promises.push(fetchAndTag(getUrl('surgery1', 'surgery_paper_1.json'), 'surgery1').then(d => loadedSurgery1 = d).catch(e => { console.warn("Failed: surgery1", e); loadedSurgery1 = []; }));
        if (needsSurgery2) promises.push(fetchAndTag(getUrl('surgery2', 'surgery_paper_2.json'), 'surgery2').then(d => loadedSurgery2 = d).catch(e => { console.warn("Failed: surgery2", e); loadedSurgery2 = []; }));
        if (needsSurgery3) promises.push(fetchAndTag(getUrl('surgery3', 'surgery_paper_3.json'), 'surgery3').then(d => loadedSurgery3 = d).catch(e => { console.warn("Failed: surgery3", e); loadedSurgery3 = []; }));
        
        if (needsSurgery1Extra) promises.push(fetchAndTag(getUrl('surgery1_extra', 'surgery_paper_1_extra.json'), 'surgery1_extra').then(d => loadedSurgery1Extra = d).catch(e => { console.warn("Failed: surgery1_extra", e); loadedSurgery1Extra = []; }));
        if (needsSurgery2Extra) promises.push(fetchAndTag(getUrl('surgery2_extra', 'surgery_paper_2_extra.json'), 'surgery2_extra').then(d => loadedSurgery2Extra = d).catch(e => { console.warn("Failed: surgery2_extra", e); loadedSurgery2Extra = []; }));
        if (needsSurgery3Extra) promises.push(fetchAndTag(getUrl('surgery3_extra', 'surgery_paper_3_extra.json'), 'surgery3_extra').then(d => loadedSurgery3Extra = d).catch(e => { console.warn("Failed: surgery3_extra", e); loadedSurgery3Extra = []; }));
        
        if (needsSurgery1AI) promises.push(fetchAndTag(getUrl('surgery1_ai', 'surgery_paper_1_ai.json'), 'surgery1_ai').then(d => loadedSurgery1AI = d).catch(e => { console.warn("Failed: surgery1_ai", e); loadedSurgery1AI = []; }));
        if (needsSurgery2AI) promises.push(fetchAndTag(getUrl('surgery2_ai', 'surgery_paper_2_ai.json'), 'surgery2_ai').then(d => loadedSurgery2AI = d).catch(e => { console.warn("Failed: surgery2_ai", e); loadedSurgery2AI = []; }));
        if (needsSurgery3AI) promises.push(fetchAndTag(getUrl('surgery3_ai', 'surgery_paper_3_ai.json'), 'surgery3_ai').then(d => loadedSurgery3AI = d).catch(e => { console.warn("Failed: surgery3_ai", e); loadedSurgery3AI = []; }));

        if (needsArabic) promises.push(fetchAndTag(getUrl('arabic', 'arabic.json'), 'arabic').then(d => loadedArabic = d).catch(e => { console.warn("Failed: arabic", e); loadedArabic = []; }));
        
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
        else if (type === 'surgery1_extra') questions = [...(loadedSurgery1Extra || [])];
        else if (type === 'surgery2_extra') questions = [...(loadedSurgery2Extra || [])];
        else if (type === 'surgery3_extra') questions = [...(loadedSurgery3Extra || [])];
        else if (type === 'surgery1_ai') questions = [...(loadedSurgery1AI || [])];
        else if (type === 'surgery2_ai') questions = [...(loadedSurgery2AI || [])];
        else if (type === 'surgery3_ai') questions = [...(loadedSurgery3AI || [])];
        
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