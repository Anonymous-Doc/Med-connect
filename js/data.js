

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
window.loadedAnatomy = null;
window.loadedPhysiology = null;
window.loadedBiochemistry = null;
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
    'anatomy': { label: 'Anatomy', labelAr: 'تشريح', color: 'bg-slate-500', mode: 'mcq', prefix: 'anatomy' },
    'physiology': { label: 'Physiology', labelAr: 'فسيولوجي', color: 'bg-red-400', mode: 'mcq', prefix: 'physiology' },
    'biochemistry': { label: 'Biochemistry', labelAr: 'كيمياء حيوية', color: 'bg-yellow-500', mode: 'mcq', prefix: 'biochemistry' },
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
    const needsSurgery1Extra = !loadedSurgery1Extra && type === 'surgery1_extra';
    const needsSurgery2Extra = !loadedSurgery2Extra && type === 'surgery2_extra';
    const needsSurgery3Extra = !loadedSurgery3Extra && type === 'surgery3_extra';
    const needsSurgery1AI = !loadedSurgery1AI && type === 'surgery1_ai';
    const needsSurgery2AI = !loadedSurgery2AI && type === 'surgery2_ai';
    const needsSurgery3AI = !loadedSurgery3AI && type === 'surgery3_ai';
    const needsAnatomy = !loadedAnatomy && type === 'anatomy';
    const needsPhysiology = !loadedPhysiology && type === 'physiology';
    const needsBiochemistry = !loadedBiochemistry && type === 'biochemistry';
    const needsArabic = !loadedArabic && type === 'arabic';
    
    const needsFetch = needsDerma || needsPatho || needsRiddles || needsGeography || needsSeerah || needsAqidah || 
                       needsSurgery1 || needsSurgery2 || needsSurgery3 || 
                       needsSurgery1Extra || needsSurgery2Extra || needsSurgery3Extra ||
                       needsSurgery1AI || needsSurgery2AI || needsSurgery3AI ||
                       needsAnatomy || needsPhysiology || needsBiochemistry || needsArabic;
    
    if (needsFetch && startBtn) {
        startBtn.disabled = true;
        startBtn.classList.add('opacity-75', 'cursor-wait');
        const textEl = document.getElementById('start-btn-text');
        if(textEl) textEl.innerText = getText('loading');
    }

    let questions = [];

    try {
        const promises = [];
        
        if (needsDerma) promises.push(fetch(getUrl('derma', 'dermatology.json')).then(r => r.json()).then(d => loadedDerma = d).catch(e => { console.warn("Failed: derma", e); loadedDerma = []; }));
        if (needsPatho) promises.push(fetch(getUrl('patho', 'clinical_pathology.json')).then(r => r.json()).then(d => loadedPatho = d).catch(e => { console.warn("Failed: patho", e); loadedPatho = []; }));
        if (needsRiddles) promises.push(fetch(getUrl('riddles', 'riddles.json')).then(r => r.json()).then(d => loadedRiddles = d).catch(e => { console.warn("Failed: riddles", e); loadedRiddles = []; }));
        if (needsGeography) promises.push(fetch(getUrl('geography', 'geography.json')).then(r => r.json()).then(d => loadedGeography = d).catch(e => { console.warn("Failed: geography", e); loadedGeography = []; }));
        if (needsSeerah) promises.push(fetch(getUrl('seerah', 'seerah.json')).then(r => r.json()).then(d => loadedSeerah = d).catch(e => { console.warn("Failed: seerah", e); loadedSeerah = []; }));
        if (needsAqidah) promises.push(fetch(getUrl('aqidah', 'aqidah.json')).then(r => r.json()).then(d => loadedAqidah = d).catch(e => { console.warn("Failed: aqidah", e); loadedAqidah = []; }));
        
        // Surgery Main
        if (needsSurgery1) promises.push(fetch(getUrl('surgery1', 'surgery_paper_1.json')).then(r => r.json()).then(d => loadedSurgery1 = d).catch(e => { console.warn("Failed: surgery1", e); loadedSurgery1 = []; }));
        if (needsSurgery2) promises.push(fetch(getUrl('surgery2', 'surgery_paper_2.json')).then(r => r.json()).then(d => loadedSurgery2 = d).catch(e => { console.warn("Failed: surgery2", e); loadedSurgery2 = []; }));
        if (needsSurgery3) promises.push(fetch(getUrl('surgery3', 'surgery_paper_3.json')).then(r => r.json()).then(d => loadedSurgery3 = d).catch(e => { console.warn("Failed: surgery3", e); loadedSurgery3 = []; }));
        
        // Surgery Extra
        if (needsSurgery1Extra) promises.push(fetch(getUrl('surgery1_extra', 'surgery_paper_1_extra.json')).then(r => r.json()).then(d => loadedSurgery1Extra = d).catch(e => { console.warn("Failed: surgery1_extra", e); loadedSurgery1Extra = []; }));
        if (needsSurgery2Extra) promises.push(fetch(getUrl('surgery2_extra', 'surgery_paper_2_extra.json')).then(r => r.json()).then(d => loadedSurgery2Extra = d).catch(e => { console.warn("Failed: surgery2_extra", e); loadedSurgery2Extra = []; }));
        if (needsSurgery3Extra) promises.push(fetch(getUrl('surgery3_extra', 'surgery_paper_3_extra.json')).then(r => r.json()).then(d => loadedSurgery3Extra = d).catch(e => { console.warn("Failed: surgery3_extra", e); loadedSurgery3Extra = []; }));
        
        // Surgery AI
        if (needsSurgery1AI) promises.push(fetch(getUrl('surgery1_ai', 'surgery_paper_1_ai.json')).then(r => r.json()).then(d => loadedSurgery1AI = d).catch(e => { console.warn("Failed: surgery1_ai", e); loadedSurgery1AI = []; }));
        if (needsSurgery2AI) promises.push(fetch(getUrl('surgery2_ai', 'surgery_paper_2_ai.json')).then(r => r.json()).then(d => loadedSurgery2AI = d).catch(e => { console.warn("Failed: surgery2_ai", e); loadedSurgery2AI = []; }));
        if (needsSurgery3AI) promises.push(fetch(getUrl('surgery3_ai', 'surgery_paper_3_ai.json')).then(r => r.json()).then(d => loadedSurgery3AI = d).catch(e => { console.warn("Failed: surgery3_ai", e); loadedSurgery3AI = []; }));

        // 1st Year Basics
        if (needsAnatomy) promises.push(fetch(getUrl('anatomy', 'anatomy.json')).then(r => r.json()).then(d => loadedAnatomy = d).catch(e => { console.warn("Failed: anatomy", e); loadedAnatomy = []; }));
        if (needsPhysiology) promises.push(fetch(getUrl('physiology', 'physiology.json')).then(r => r.json()).then(d => loadedPhysiology = d).catch(e => { console.warn("Failed: physiology", e); loadedPhysiology = []; }));
        if (needsBiochemistry) promises.push(fetch(getUrl('biochemistry', 'biochemistry.json')).then(r => r.json()).then(d => loadedBiochemistry = d).catch(e => { console.warn("Failed: biochemistry", e); loadedBiochemistry = []; }));

        if (needsArabic) promises.push(fetch(getUrl('arabic', 'arabic.json')).then(r => r.json()).then(d => loadedArabic = d).catch(e => { console.warn("Failed: arabic", e); loadedArabic = []; }));
        
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
        
        else if (type === 'anatomy') questions = [...(loadedAnatomy || [])];
        else if (type === 'physiology') questions = [...(loadedPhysiology || [])];
        else if (type === 'biochemistry') questions = [...(loadedBiochemistry || [])];
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
