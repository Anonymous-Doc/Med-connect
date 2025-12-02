export const QUESTIONS = {
    'ar': {
        'geography': [
            {"id": "geo_001", "q": "ما هي أكبر قارة في العالم من حيث المساحة؟", "options": ["أفريقيا", "آسيا", "أوروبا", "أمريكا الشمالية"], "correct": 1, "difficulty": 1},
            {"id": "geo_002", "q": "ما هو أطول نهر في العالم؟", "options": ["نهر الأمازون", "نهر النيل", "نهر اليانغتسي", "نهر المسيسيبي"], "correct": 1, "difficulty": 1},
            {"id": "geo_003", "q": "ما هي عاصمة اليابان؟", "options": ["كيوتو", "أوساكا", "طوكيو", "سول"], "correct": 2, "difficulty": 1}
        ],
        'riddles': [
            {"id": "riddles_ar_001", "q": "له أسنان ولكنه لا يعض، ما هو؟", "correct": "المشط", "difficulty": 1},
            {"id": "riddles_ar_002", "q": "شيء يجري ولا يمشي، له لسان ولا يتكلم، وله سرير ولا ينام، ما هو؟", "correct": "النهر", "difficulty": 2}
        ],
        'seerah': [
             {"id": "seerah_001", "q": "ما هو اسم والد النبي محمد صلى الله عليه وسلم؟", "options": ["عبد المطلب", "أبو طالب", "عبد الله", "حمزة"], "correct": 2, "difficulty": 1},
             {"id": "seerah_002", "q": "ما هو اسم والدة النبي محمد صلى الله عليه وسلم؟", "options": ["خديجة بنت خويلد", "آمنة بنت وهب", "فاطمة بنت أسد", "حليمة السعدية"], "correct": 1, "difficulty": 1}
        ]
    },
    'en': {
        'riddles': [
             {"id": "riddles_00001", "q": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", "correct": "Echo", "difficulty": 1},
             {"id": "riddles_00002", "q": "You measure my life in hours and I serve you by expiring. I'm quick when I'm thin and slow when I'm fat. The wind is my enemy.", "correct": "Candle", "difficulty": 2}
        ],
        'dermatology': [
            {"id": "dermatology_00001", "q": "Ecthyma is:", "options": ["Crusted impetigo", "Ulcerative impetigo", "Circinate impetigo", "Bullous impetigo", "None of the above"], "correct": 1, "difficulty": 2},
            {"id": "dermatology_00002", "q": "Warts can be treated by all of the following EXCEPT:", "options": ["Laser", "Cryotherapy", "Electrocautery", "Intralesional steroids", "Autosuggestion"], "correct": 3, "difficulty": 2}
        ],
        'clinical_pathology': [
            {"id": "clinical_pathology_00001", "q": "All the following are clinical conditions that carry an increased likelihood of iron deficiency EXCEPT:", "options": ["Pregnancy", "Periods of rapid growth", "An intermittent history of blood loss", "Thalassemia"], "correct": 3, "difficulty": 2},
            {"id": "clinical_pathology_00002", "q": "Diagnosis of sickle cell anemia is confirmed by:", "options": ["Hemoglobin electrophoresis", "Bone marrow aspiration", "Low reticulocyte response", "Increased haptoglobin"], "correct": 0, "difficulty": 2}
        ]
    }
};

export const TOPICS = {
    'mixed': { label: 'All Topics', labelAr: 'كل المواضيع', color: 'bg-blue-500', mode: 'mcq', keys: ['clinical_pathology', 'dermatology', 'seerah', 'geography'] },
    'derma': { label: 'Dermatology', labelAr: 'الأمراض الجلدية', color: 'bg-blue-500', mode: 'mcq', keys: ['dermatology'] },
    'patho': { label: 'Pathology', labelAr: 'علم الأمراض', color: 'bg-purple-500', mode: 'mcq', keys: ['clinical_pathology'] },
    'riddles': { label: 'Brain Teasers', labelAr: 'ألغاز', color: 'bg-pink-500', mode: 'input', keys: ['riddles'] },
    'geography': { label: 'Geography', labelAr: 'جغرافيا', color: 'bg-green-600', mode: 'mcq', keys: ['geography'] },
    'seerah': { label: 'Seerah', labelAr: 'السيرة النبوية', color: 'bg-emerald-600', mode: 'mcq', keys: ['seerah'] }
};