import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Activity, GraduationCap, Lightbulb, Globe, Moon, BookOpen, ArrowRight, Check, X, RotateCcw } from 'lucide-react';
import { getText } from './utils/translations';
import GameContainer from './components/GameContainer';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-medical-500/30">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-medical-500 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 h-full">
             <Routes>
                <Route path="/" element={<LanguageSelection />} />
                <Route path="/:lang" element={<CategorySelection />} />
                <Route path="/:lang/educational" element={<SchoolSelection />} />
                <Route path="/:lang/educational/kasralainy" element={<YearSelection />} />
                <Route path="/:lang/game/:category/:topic?" element={<GameWrapper />} />
             </Routes>
        </div>
    </div>
  );
}

function LanguageSelection() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-10 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                    <Activity className="w-12 h-12 text-medical-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center">Med-Connect <span className="text-medical-500">Ultimate</span></h1>
                <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Discord Activity Edition</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
                <LangCard lang="en" flag="🇬🇧" title="English" sub="Clinical & General" align="left" />
                <LangCard lang="ar" flag="🇸🇦" title="العربية" sub="معلومات طبية وعامة" align="right" dir="rtl" />
            </div>
        </div>
    );
}

function LangCard({ lang, flag, title, sub, align, dir }: any) {
    const navigate = useNavigate();
    return (
        <button onClick={() => navigate(`/${lang}`)} className={`group relative bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-medical-500 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-medical-500/20 w-full ${align === 'right' ? 'text-right' : 'text-left'}`} dir={dir}>
            <div className={`flex justify-between items-start mb-4 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <span className="text-2xl">{flag}</span>
                </div>
                {align === 'right' ? <ArrowLeft className="w-6 h-6 text-slate-500 group-hover:text-medical-500 transition-colors" /> : <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-medical-500 transition-colors" />}
            </div>
            <h2 className="text-2xl font-bold mb-1 group-hover:text-white">{title}</h2>
            <p className="text-slate-400 text-xs">{sub}</p>
        </button>
    )
}

function CategorySelection() {
    const { lang } = useParams();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <h1 className="text-3xl font-black mb-8">{getText(lang!, 'selectCat')}</h1>
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6 animate-fade-in">
                <button onClick={() => navigate(`/${lang}/educational`)} className="group bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-800 hover:border-blue-500 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col items-center text-center gap-4 w-full">
                    <div className="p-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/40 group-hover:rotate-12 transition-transform duration-300">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">{lang === 'ar' ? 'تعليمي' : 'Educational'}</h2>
                        <p className="text-blue-200/60 text-sm font-medium">{lang === 'ar' ? 'علم الأمراض، الجلدية' : 'Pathology, Dermatology'}</p>
                    </div>
                </button>

                <button onClick={() => navigate(`/${lang}/game/general/riddles`)} className="group bg-gradient-to-br from-pink-900 to-slate-900 border border-pink-800 hover:border-pink-500 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 flex flex-col items-center text-center gap-4 w-full">
                    <div className="p-4 bg-pink-500 rounded-full shadow-lg shadow-pink-500/40 group-hover:-rotate-12 transition-transform duration-300">
                        <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">{lang === 'ar' ? 'عام' : 'General'}</h2>
                        <p className="text-pink-200/60 text-sm font-medium">{lang === 'ar' ? 'ألغاز وتحديات' : 'Riddles & Teasers'}</p>
                    </div>
                </button>
            </div>
            <button onClick={() => navigate('/')} className="mt-10 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                 {lang === 'ar' ? <ArrowRight className="w-4 h-4"/> : <ArrowLeft className="w-4 h-4" />}
                 <span>{lang === 'ar' ? 'عودة' : 'Back'}</span>
            </button>
        </div>
    )
}

function SchoolSelection() {
    const { lang } = useParams();
    const navigate = useNavigate();

    if (lang === 'ar') {
        // Arabic goes straight to topic selection basically, but let's simulate the structure
        return <GameWrapper defaultTopic="seerah" />
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 font-sans">
             <h1 className="text-3xl font-black mb-8">{getText(lang!, 'selectSchool')}</h1>
             <div className="max-w-4xl w-full grid grid-cols-1 gap-6 animate-fade-in">
                <button onClick={() => navigate(`/${lang}/educational/kasralainy`)} className="group bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-800 hover:border-indigo-500 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col items-center text-center gap-4 w-full">
                    <div className="p-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40 group-hover:scale-110 transition-transform duration-300">
                        <Globe className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black mb-2">Kasr Al-Ainy</h2>
                        <p className="text-indigo-200/60 text-sm font-medium uppercase tracking-wider">School of Medicine</p>
                    </div>
                </button>
             </div>
             <button onClick={() => navigate(`/${lang}`)} className="mt-10 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                 <ArrowLeft className="w-4 h-4" />
                 <span>Back</span>
            </button>
        </div>
    )
}

function YearSelection() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const years = [
        { id: '1st', color: 'blue', label: 'First Year' },
        { id: '2nd', color: 'purple', label: 'Second Year' },
        { id: '3rd', color: 'green', label: 'Third Year' },
        { id: '4th', color: 'orange', label: 'Fourth Year' },
        { id: '5th', color: 'red', label: 'Fifth Year' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 font-sans">
            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-black mb-2">Academic Years</h1>
                <p className="text-slate-400">Kasr Al-Ainy School of Medicine</p>
            </div>
            <div className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
                {years.map(y => (
                    <button key={y.id} onClick={() => navigate(`/${lang}/game/educational/mixed`)} className={`group bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-${y.color}-500 rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col items-center gap-3 text-center w-full`}>
                        <div className={`w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-xl font-black text-slate-500 group-hover:text-${y.color}-500 group-hover:bg-${y.color}-500/10 transition-colors`}>{y.id[0]}</div>
                        <h3 className={`font-bold text-lg group-hover:text-${y.color}-400 transition-colors`}>{y.label}</h3>
                    </button>
                ))}
            </div>
             <button onClick={() => navigate(`/${lang}/educational`)} className="mt-12 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                 <ArrowLeft className="w-4 h-4" />
                 <span>Back</span>
            </button>
        </div>
    )
}

function GameWrapper({ defaultTopic }: { defaultTopic?: string }) {
    const { lang, category, topic } = useParams();
    // If arabic, topic might be missing in URL for educational, defaults to seerah
    const effectiveTopic = topic || defaultTopic || (lang === 'ar' ? 'seerah' : 'mixed');
    
    return <GameContainer lang={lang || 'en'} category={category || 'general'} initialTopic={effectiveTopic} />;
}

export default App;