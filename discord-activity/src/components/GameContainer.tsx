import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelLeft, RotateCcw, History, X, Settings2, BookOpen, Grid3x3, DollarSign, Layers, ScanFace, Microscope, Lightbulb, Moon, Globe, Send, Eye, CheckCircle, XCircle, ArrowRight, ArrowLeft, ChevronsUp, ArrowDownToLine, SkipForward, Menu, GraduationCap } from 'lucide-react';
import { QUESTIONS, TOPICS } from '../data/questions';
import { getText } from '../utils/translations';
import confetti from 'canvas-confetti';

// --- Game Components ---
const LADDER = [
    { val: 100, safe: false }, { val: 200, safe: false }, { val: 300, safe: false },
    { val: 500, safe: true },
    { val: 1000, safe: false }, { val: 2000, safe: false }, { val: 4000, safe: false },
    { val: 8000, safe: true },
    { val: 16000, safe: false }, { val: 32000, safe: false }, { val: 64000, safe: false },
    { val: 125000, safe: true },
    { val: 250000, safe: false }, { val: 500000, safe: false }, { val: 1000000, safe: true }
];

export default function GameContainer({ lang, category, initialTopic }: { lang: string, category: string, initialTopic: string }) {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'solo' | 'strategy' | 'millionaire'>('solo');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSetup, setShowSetup] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(initialTopic);
    const [gameState, setGameState] = useState<any>({
        active: false,
        queue: [],
        history: [],
        currentQuestion: null,
        currentResult: null, // 'correct' | 'incorrect'
        userAnswer: null,
        soloScore: 0,
        soloTotal: 0,
        ladderIndex: 0,
        safeAmount: 0,
        lifelines: { '5050': true, 'poll': true, 'consult': true },
        connect4Board: Array(6).fill(null).map(() => Array(7).fill(0)),
        connect4Player: 1,
        connect4Scores: { 1: 0, 2: 0 },
        pendingColumn: null
    });

    // Adjust defaults based on category
    useEffect(() => {
        if (category === 'general') {
            setMode('millionaire');
        } else {
            setMode('solo');
        }
    }, [category]);

    const getQuestions = (topicKey: string) => {
        const meta = TOPICS[topicKey as keyof typeof TOPICS];
        if (!meta) return [];
        let allQ: any[] = [];
        const langData = QUESTIONS[lang as keyof typeof QUESTIONS] || QUESTIONS['en'];
        
        meta.keys.forEach((k: string) => {
            if (langData[k as keyof typeof langData]) {
                allQ = [...allQ, ...langData[k as keyof typeof langData]];
            }
        });
        return allQ;
    };

    const startGame = () => {
        const db = getQuestions(currentTopic);
        if (db.length === 0) {
            alert("No questions available for this topic/language combination yet.");
            return;
        }

        let queue = [];
        if (mode === 'millionaire') {
            const easy = db.filter(q => (q.difficulty || 1) === 1);
            const medium = db.filter(q => (q.difficulty || 2) === 2);
            const hard = db.filter(q => (q.difficulty || 3) === 3);
            
            // Simple shuffle
            const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
            
            queue = [
                ...shuffle(easy).slice(0, 5),
                ...shuffle(medium).slice(0, 5),
                ...shuffle(hard).slice(0, 5)
            ];
            
            // Fill if missing
            if (queue.length < 15) {
                 const remaining = db.filter(q => !queue.includes(q));
                 queue = [...queue, ...shuffle(remaining).slice(0, 15 - queue.length)];
            }
        } else {
            queue = db.sort(() => Math.random() - 0.5).slice(0, 20); // Limit to 20 for performance
        }

        setGameState({
            ...gameState,
            active: true,
            queue,
            history: [],
            currentQuestion: mode === 'strategy' ? null : queue[0], // Strategy waits for column pick
            queueIndex: 0,
            soloScore: 0,
            soloTotal: 0,
            ladderIndex: 0,
            safeAmount: 0,
            lifelines: { '5050': true, 'poll': true, 'consult': true },
            connect4Board: Array(6).fill(null).map(() => Array(7).fill(0)),
            connect4Player: 1,
            connect4Scores: { 1: 0, 2: 0 },
            pendingColumn: null,
            currentResult: null,
            userAnswer: null
        });
        setShowSetup(false);
    };

    const handleAnswer = (ans: any) => {
        const q = gameState.currentQuestion;
        const isCorrect = typeof ans === 'string' 
            ? checkStringAnswer(ans, q.correct) 
            : ans === q.correct;
        
        const newHistory = [{ q, ans, isCorrect, player: mode === 'strategy' ? gameState.connect4Player : 1 }, ...gameState.history];
        
        let updates: any = {
            currentResult: isCorrect ? 'correct' : 'incorrect',
            userAnswer: ans,
            history: newHistory
        };

        if (mode === 'solo') {
            updates.soloTotal = gameState.soloTotal + 1;
            if (isCorrect) updates.soloScore = gameState.soloScore + 1;
        } else if (mode === 'millionaire') {
             // Logic handled in next step button mostly, but we record result here
        } else if (mode === 'strategy' && isCorrect) {
             // Score update for strategy done after drop
        }

        setGameState(prev => ({ ...prev, ...updates }));
        if (isCorrect) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };

    const nextStep = () => {
        if (mode === 'solo') {
             const nextIndex = gameState.queueIndex + 1;
             if (nextIndex >= gameState.queue.length) {
                 // End game
                 setGameState(prev => ({ ...prev, active: false }));
                 setShowSetup(true); // Or show winner modal
                 alert(`Finished! Score: ${gameState.soloScore + (gameState.currentResult === 'correct' ? 0 : 0)}/${gameState.soloTotal}`);
             } else {
                 setGameState(prev => ({
                     ...prev,
                     currentQuestion: prev.queue[nextIndex],
                     queueIndex: nextIndex,
                     currentResult: null,
                     userAnswer: null
                 }));
             }
        } else if (mode === 'millionaire') {
            if (gameState.currentResult === 'correct') {
                const nextLadder = gameState.ladderIndex + 1;
                if (nextLadder >= LADDER.length) {
                    alert("YOU WON 1 MILLION!");
                    setShowSetup(true);
                } else {
                    const safe = LADDER[gameState.ladderIndex].safe ? LADDER[gameState.ladderIndex].val : gameState.safeAmount;
                     setGameState(prev => ({
                         ...prev,
                         ladderIndex: nextLadder,
                         safeAmount: safe,
                         currentQuestion: prev.queue[prev.queueIndex + 1],
                         queueIndex: prev.queueIndex + 1,
                         currentResult: null,
                         userAnswer: null
                     }));
                }
            } else {
                alert(`Game Over! You won $${gameState.safeAmount}`);
                setShowSetup(true);
            }
        } else if (mode === 'strategy') {
            if (gameState.currentResult === 'correct') {
                // Drop piece
                const col = gameState.pendingColumn;
                const board = [...gameState.connect4Board.map(r => [...r])];
                let placed = false;
                for (let r = 5; r >= 0; r--) {
                    if (board[r][col] === 0) {
                        board[r][col] = gameState.connect4Player;
                        placed = true;
                        break;
                    }
                }
                // Check win (omitted for brevity, just switch turn)
                setGameState(prev => ({
                    ...prev,
                    connect4Board: board,
                    connect4Player: prev.connect4Player === 1 ? 2 : 1,
                    currentQuestion: null,
                    currentResult: null,
                    userAnswer: null
                }));
            } else {
                // Just switch turn
                setGameState(prev => ({
                    ...prev,
                    connect4Player: prev.connect4Player === 1 ? 2 : 1,
                    currentQuestion: null,
                    currentResult: null,
                    userAnswer: null
                }));
            }
        }
    };

    const handleColumnSelect = (col: number) => {
        if (gameState.connect4Board[0][col] !== 0) return;
        // Pick a random question
        const q = gameState.queue[Math.floor(Math.random() * gameState.queue.length)];
        setGameState(prev => ({
            ...prev,
            pendingColumn: col,
            currentQuestion: q,
            currentResult: null,
            userAnswer: null
        }));
    };

    const checkStringAnswer = (u: string, c: string) => {
         return u.trim().toLowerCase() === c.trim().toLowerCase();
    }

    // Sidebar
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className={`flex h-screen bg-slate-950 text-slate-100 ${dir === 'rtl' ? 'font-arabic' : 'font-sans'}`} dir={dir}>
            {/* Sidebar */}
            <div className={`fixed inset-y-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')} ${dir === 'rtl' ? 'right-0 border-l border-r-0' : 'left-0'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-medical-500 flex items-center gap-2">
                        <History className="w-5 h-5" /> {getText(lang, 'sessionHistory')}
                    </h2>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-800 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-2 overflow-y-auto h-full pb-20 space-y-2">
                    {gameState.history.length === 0 && <p className="text-slate-500 text-xs text-center py-4">{getText(lang, 'noHistory')}</p>}
                    {gameState.history.map((h: any, i: number) => (
                        <div key={i} className={`p-2 rounded border-l-2 bg-slate-800/50 text-xs ${h.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="flex justify-between mb-1">
                                <span className="font-bold">{mode === 'strategy' ? `Player ${h.player}` : `Q${gameState.history.length - i}`}</span>
                                <span className="text-slate-500">{h.isCorrect ? '✓' : '✗'}</span>
                            </div>
                            <p className="line-clamp-2 opacity-70">{h.q.q}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? (dir === 'rtl' ? 'mr-64' : 'ml-64') : ''}`}>
                {/* Header */}
                <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded text-slate-400">
                            {dir === 'rtl' ? <Menu className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-lg ${category === 'educational' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                                 {category === 'educational' ? <GraduationCap className="w-4 h-4 text-white" /> : <Lightbulb className="w-4 h-4 text-white" />}
                             </div>
                             <h1 className="font-bold text-sm hidden md:block">{TOPICS[currentTopic as keyof typeof TOPICS]?.label || 'Game'}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSetup(true)} className="bg-medical-600 hover:bg-medical-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                            <RotateCcw className="w-3 h-3" /> <span>{getText(lang, 'newSession')}</span>
                        </button>
                    </div>
                </header>

                {/* Game Area */}
                <main className="flex-1 relative overflow-hidden p-4 flex flex-col items-center justify-center">
                    {/* Background Elements */}
                    <div className="absolute inset-0 pointer-events-none opacity-5">
                         <div className="absolute top-10 left-10 w-96 h-96 bg-medical-500 rounded-full blur-3xl"></div>
                    </div>

                    {!gameState.active ? (
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-slate-500">Select options to start</h2>
                        </div>
                    ) : (
                        <>
                            {/* Mode: Solo */}
                            {mode === 'solo' && gameState.currentQuestion && (
                                <div className="w-full max-w-lg">
                                    <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400">
                                        <span>Progress: {gameState.queueIndex + 1} / {gameState.queue.length}</span>
                                        <span>Score: {gameState.soloScore}</span>
                                    </div>
                                    <QuestionCard 
                                        question={gameState.currentQuestion} 
                                        onAnswer={handleAnswer} 
                                        result={gameState.currentResult}
                                        userAns={gameState.userAnswer}
                                        onNext={nextStep}
                                        lang={lang}
                                    />
                                </div>
                            )}

                            {/* Mode: Millionaire */}
                            {mode === 'millionaire' && (
                                <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 h-full max-h-[600px]">
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="mb-6">
                                            <div className="text-4xl font-black text-center text-gold-400">${LADDER[gameState.ladderIndex].val.toLocaleString()}</div>
                                            <div className="text-center text-xs text-slate-500 uppercase tracking-widest">Current Prize</div>
                                        </div>
                                        {gameState.currentQuestion && (
                                            <QuestionCard 
                                                question={gameState.currentQuestion} 
                                                onAnswer={handleAnswer} 
                                                result={gameState.currentResult}
                                                userAns={gameState.userAnswer}
                                                onNext={nextStep}
                                                lang={lang}
                                            />
                                        )}
                                    </div>
                                    <div className="w-48 bg-slate-900 rounded-xl border border-slate-800 flex flex-col-reverse overflow-y-auto p-2">
                                        {LADDER.map((step, i) => (
                                            <div key={i} className={`flex justify-between px-3 py-1 text-xs font-bold rounded ${i === gameState.ladderIndex ? 'bg-gold-500 text-black' : (i < gameState.ladderIndex ? 'text-green-500' : 'text-slate-600')} ${step.safe ? 'text-white' : ''}`}>
                                                <span>{i + 1}</span>
                                                <span>${step.val.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mode: Strategy (Connect 4) */}
                            {mode === 'strategy' && (
                                <div className="flex flex-col items-center gap-4 h-full w-full max-w-3xl">
                                    {/* Board */}
                                    {!gameState.currentQuestion && (
                                        <div className="bg-blue-900 p-4 rounded-xl shadow-2xl border-4 border-blue-800">
                                            <div className="grid grid-cols-7 gap-2">
                                                 {gameState.connect4Board.map((row: number[], rIdx: number) => (
                                                     row.map((cell: number, cIdx: number) => (
                                                         <div key={`${rIdx}-${cIdx}`} onClick={() => handleColumnSelect(cIdx)} className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative bg-blue-950">
                                                             {cell !== 0 && <div className={`w-full h-full rounded-full ${cell === 1 ? 'bg-red-500' : 'bg-yellow-400'} shadow-inner`}></div>}
                                                         </div>
                                                     ))
                                                 ))}
                                            </div>
                                            <div className="mt-2 text-center text-xs font-bold text-blue-200">Player {gameState.connect4Player}'s Turn</div>
                                        </div>
                                    )}
                                    {/* Question Overlay */}
                                    {gameState.currentQuestion && (
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center p-4">
                                            <div className="max-w-md w-full">
                                                <QuestionCard 
                                                    question={gameState.currentQuestion} 
                                                    onAnswer={handleAnswer} 
                                                    result={gameState.currentResult}
                                                    userAns={gameState.userAnswer}
                                                    onNext={nextStep}
                                                    lang={lang}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Setup Modal */}
            {showSetup && (
                <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                            <h2 className="text-lg font-bold flex items-center gap-2 justify-center"><Settings2 className="w-5 h-5 text-medical-500" /> {getText(lang, 'config')}</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Mode Select */}
                            {category !== 'general' && (
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">{getText(lang, 'mode')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => setMode('solo')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'solo' ? 'border-medical-500 bg-medical-500/10 text-white' : 'border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                                            <BookOpen className="w-5 h-5" />
                                            <span className="text-xs font-bold">{getText(lang, 'mSolo')}</span>
                                        </button>
                                        <button onClick={() => setMode('strategy')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'strategy' ? 'border-medical-500 bg-medical-500/10 text-white' : 'border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                                            <Grid3x3 className="w-5 h-5" />
                                            <span className="text-xs font-bold">{getText(lang, 'mConnect')}</span>
                                        </button>
                                        <button onClick={() => setMode('millionaire')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'millionaire' ? 'border-medical-500 bg-medical-500/10 text-white' : 'border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                                            <DollarSign className="w-5 h-5" />
                                            <span className="text-xs font-bold">{getText(lang, 'mResidency')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Topic Select */}
                            {category === 'educational' && (
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">{getText(lang, 'topic')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => setCurrentTopic('mixed')} className={`p-2 rounded-lg border text-xs font-bold transition-all ${currentTopic === 'mixed' ? 'bg-medical-600 border-transparent text-white' : 'border-slate-700 text-slate-400'}`}>{getText(lang, 'tMixed')}</button>
                                        <button onClick={() => setCurrentTopic('derma')} className={`p-2 rounded-lg border text-xs font-bold transition-all ${currentTopic === 'derma' ? 'bg-medical-600 border-transparent text-white' : 'border-slate-700 text-slate-400'}`}>{getText(lang, 'tDerma')}</button>
                                        <button onClick={() => setCurrentTopic('patho')} className={`p-2 rounded-lg border text-xs font-bold transition-all ${currentTopic === 'patho' ? 'bg-medical-600 border-transparent text-white' : 'border-slate-700 text-slate-400'}`}>{getText(lang, 'tPatho')}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                            <button onClick={startGame} className="w-full py-3 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-xl shadow-lg shadow-medical-500/20 transition-all flex items-center justify-center gap-2">
                                <span>{getText(lang, 'startGame')}</span>
                                <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuestionCard({ question, onAnswer, result, userAns, onNext, lang }: any) {
    const topic = TOPICS[resolveTopicPrefix(question.id) as keyof typeof TOPICS] || { label: 'General', labelAr: 'عام', color: 'bg-slate-500', mode: 'mcq' };
    const isInput = topic.mode === 'input';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden w-full animate-fade-in">
            <div className="h-2 bg-slate-800 w-full">
                <div className={`h-full ${topic.color}`} style={{width: '100%'}}></div>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500`}>
                        {lang === 'ar' ? topic.labelAr : topic.label}
                    </span>
                    {question.difficulty && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${getDiffClass(question.difficulty)}`}>
                            {getDiffLabel(question.difficulty, lang)}
                        </span>
                    )}
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                    {question.q}
                </h3>

                {!result ? (
                    <div className="space-y-3">
                        {isInput ? (
                            <InputAnswer onSubmit={(val: string) => onAnswer(val)} lang={lang} />
                        ) : (
                            question.options.map((opt: string, idx: number) => (
                                <button 
                                    key={idx}
                                    onClick={() => onAnswer(idx)}
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-medical-500 hover:bg-medical-50 dark:hover:bg-medical-900/10 transition-all flex items-center gap-4 group text-left rtl:text-right"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center group-hover:bg-medical-500 group-hover:text-white transition-colors">
                                        {String.fromCharCode(65+idx)}
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-medical-700 dark:group-hover:text-white">{opt}</span>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                         <div className={`p-4 rounded-xl border-2 text-center ${result === 'correct' ? 'bg-green-50 border-green-500 dark:bg-green-900/20' : 'bg-red-50 border-red-500 dark:bg-red-900/20'}`}>
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${result === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                 {result === 'correct' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                             </div>
                             <h4 className={`text-lg font-black ${result === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                 {result === 'correct' ? getText(lang, 'correct') : getText(lang, 'wrong')}
                             </h4>
                             {result === 'incorrect' && (
                                 <div className="mt-2 text-sm">
                                     <p className="text-slate-500">{getText(lang, 'correctAnswer')}</p>
                                     <p className="font-bold text-slate-900 dark:text-white">
                                         {isInput ? question.correct : question.options[question.correct]}
                                     </p>
                                 </div>
                             )}
                         </div>
                         <button onClick={onNext} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors flex items-center justify-center gap-2">
                             <span>{getText(lang, 'nextQuestion')}</span>
                             <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                         </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function InputAnswer({ onSubmit, lang }: any) {
    const [val, setVal] = useState('');
    return (
        <div className="flex flex-col gap-3">
            <input 
                type="text" 
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && val && onSubmit(val)}
                placeholder={getText(lang, 'typeAnswer')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent font-bold focus:border-medical-500 outline-none"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <button onClick={() => val && onSubmit(val)} className="w-full py-3 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <span>{getText(lang, 'submit')}</span> <Send className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
        </div>
    )
}

function resolveTopicPrefix(id: string) {
    if(id.startsWith('geo')) return 'geography';
    if(id.startsWith('riddle')) return 'riddles';
    if(id.startsWith('seerah')) return 'seerah';
    if(id.startsWith('derma')) return 'derma';
    if(id.startsWith('clinical')) return 'patho';
    return 'mixed';
}

function getDiffClass(d: number) {
    if(d === 1) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    if(d === 3) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
}

function getDiffLabel(d: number, lang: string) {
    if(d === 1) return lang === 'ar' ? "سهل" : "EASY";
    if(d === 3) return lang === 'ar' ? "صعب" : "HARD";
    return lang === 'ar' ? "متوسط" : "MEDIUM";
}