import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    generateQuestion,
    evaluateAnswer,
    textToSpeech,
    generateFollowUp,
} from "../../services/aiService";
import { getJobById } from "../../services/JobService";
import { getCandidateById } from "../../services/CandidateService";
import MicTest from "../../components/MicTest";
import Swal from 'sweetalert2';

export default function AIInterviewActive() {
    const { jobId, candidateId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [candidate, setCandidate] = useState(null);
    // States: loading | mic_check | generating | speaking | listening | evaluating | finished
    const [appState, setAppState] = useState("loading");
    const [micReady, setMicReady] = useState(false);

    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(120);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sttStatus, setSttStatus] = useState("idle"); // idle | listening | error | unsupported

    const timerRef = useRef(null);
    const recognitionRef = useRef(null);
    const interimRef = useRef(""); // accumulates interim text during one recording session
    // Guard against React Strict Mode double-invocation
    const hasStarted = useRef(false);
    // Track questions asked so far to avoid repeats
    const askedQuestionsRef = useRef([]);

    const totalQuestions = 10;
    const difficulties = ['easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard'];

    // ─── Init Web Speech API ─────────────────────────────────────────────────
    const initSpeechRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSttStatus("unsupported");
            return false;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setSttStatus("listening");
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            let interimText = "";
            let finalText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += transcript + " ";
                } else {
                    interimText += transcript;
                }
            }
            if (finalText) {
                interimRef.current += finalText;
                setCurrentAnswer(prev => (prev + " " + finalText).trim());
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error !== "aborted") {
                setSttStatus("error");
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            setSttStatus("idle");
        };

        recognitionRef.current = recognition;
        return true;
    }, []);

    // Load job + candidate info, then show mic check
    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const loadInfo = async () => {
            try {
                const [j, c] = await Promise.all([
                    getJobById(jobId),
                    getCandidateById(candidateId)
                ]);
                setJob(j);
                setCandidate(c);
                initSpeechRecognition();
                setAppState("mic_check");
            } catch (err) {
                console.error("Failed to load interview info", err);
                Swal.fire("Error", "Could not load interview details.", "error").then(() => navigate('/ai'));
            }
        };
        loadInfo();
    }, [jobId, candidateId, initSpeechRecognition]);

    // Timer logic
    useEffect(() => {
        if (appState === "listening" || appState === "speaking") {
            if (timeLeft > 0) {
                timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            } else {
                handleAutoSubmit();
            }
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, appState]);

    const startInterview = async () => {
        await fetchNextQuestion(0);
    };

    const fetchNextQuestion = async (index) => {
        setAppState("generating");
        const topic = job.topics?.length ? job.topics.join(", ") : (job.skills?.length ? job.skills.join(", ") : "General");
        const difficulty = difficulties[index] || 'medium';

        try {
            let questionText;

            if (index === 0 || askedQuestionsRef.current.length === 0) {
                // First question: use standard generate
                const res = await generateQuestion({ topic, jobTitle: job.title, difficulty });
                questionText = res.data?.question || `Could you explain your experience with ${topic}?`;
            } else {
                // Follow-up questions: pass all previous to avoid repeats
                const res = await generateFollowUp({
                    topic,
                    jobTitle: job.title,
                    difficulty,
                    previousQuestions: askedQuestionsRef.current,
                });
                questionText = res.data?.question || `Describe a challenge you faced with ${topic}.`;
            }

            const newQ = { text: questionText, difficulty };
            askedQuestionsRef.current = [...askedQuestionsRef.current, questionText];

            setQuestions(prev => {
                const updated = [...prev];
                updated[index] = newQ;
                return updated;
            });
            setCurrentQIndex(index);
            setTimeLeft(120);
            setCurrentAnswer("");
            interimRef.current = "";
            setAppState("speaking");
            speakQuestion(newQ.text);
        } catch (err) {
            console.error("Failed to generate question", err);
            const fallbackText = `Describe a challenge you faced with ${topic}.`;
            const fallbackQ = { text: fallbackText, difficulty };
            askedQuestionsRef.current = [...askedQuestionsRef.current, fallbackText];
            setQuestions(prev => {
                const updated = [...prev];
                updated[index] = fallbackQ;
                return updated;
            });
            setCurrentQIndex(index);
            setTimeLeft(120);
            setCurrentAnswer("");
            interimRef.current = "";
            setAppState("speaking");
            speakQuestion(fallbackQ.text);
        }
    };

    const speakQuestion = async (text) => {
        setIsPlaying(true);
        try {
            const res = await textToSpeech(text);
            const audioUrl = URL.createObjectURL(res.data);
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                setIsPlaying(false);
                setAppState("listening");
            };
            audio.onerror = () => {
                setIsPlaying(false);
                setAppState("listening");
            };
            audio.play();
        } catch (err) {
            console.warn("TTS failed, skipping to listening stage", err);
            setIsPlaying(false);
            setAppState("listening");
        }
    };

    const handleAutoSubmit = () => {
        // Stop recording before submitting
        stopRecording();
        Swal.fire({
            title: "Time's up!",
            text: "The timer has expired for this question. Moving to evaluation...",
            icon: "info",
            timer: 2000,
            showConfirmButton: false
        });
        handleSubmitAnswer();
    };

    const handleSubmitAnswer = async () => {
        // Make sure recording is stopped
        stopRecording();
        setAppState("evaluating");
        const currentQ = questions[currentQIndex];
        const topic = job.topics?.length ? job.topics.join(", ") : "General";

        try {
            const res = await evaluateAnswer({
                question: currentQ.text,
                answer: currentAnswer || "No answer provided.",
                topic
            });

            const updated = [...questions];
            updated[currentQIndex].score = res.data?.score || 0;
            updated[currentQIndex].feedback = res.data?.feedback || "";
            updated[currentQIndex].candidateAnswer = currentAnswer;
            setQuestions(updated);

            if (currentQIndex < totalQuestions - 1) {
                fetchNextQuestion(currentQIndex + 1);
            } else {
                setAppState("finished");
                Swal.fire("Success", "Interview completed! Great job.", "success");
            }
        } catch (err) {
            console.error("Evaluation failed", err);
            if (currentQIndex < totalQuestions - 1) {
                fetchNextQuestion(currentQIndex + 1);
            } else {
                setAppState("finished");
            }
        }
    };

    // ─── Web Speech API recording controls ──────────────────────────────────
    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = () => {
        if (!recognitionRef.current) {
            const ok = initSpeechRecognition();
            if (!ok) {
                Swal.fire("Unsupported", "Your browser does not support Speech Recognition. Please type your answer.", "warning");
                return;
            }
        }
        try {
            interimRef.current = "";
            recognitionRef.current.start();
        } catch (e) {
            // Already started or other error
            console.warn("Recognition start error:", e.message);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.warn("Recognition stop error:", e.message);
            }
        }
    };

    // ─── Loading Screen ───────────────────────────────────────────────────────
    if (appState === "loading") {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // ─── Mic Check Screen (Page 2 — Step 1) ──────────────────────────────────
    if (appState === "mic_check") {
        return (
            <div className="min-h-screen bg-slate-900 text-white font-sans flex items-center justify-center p-6">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-[40px] p-10 max-w-lg w-full shadow-2xl space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black">Microphone Check</h1>
                        <p className="text-slate-400 text-sm">
                            Before we start, let&apos;s make sure your microphone is working properly.
                        </p>
                    </div>

                    {/* Candidate + Job summary */}
                    {job && candidate && (
                        <div className="bg-slate-900/50 rounded-2xl p-4 space-y-2 text-sm border border-slate-700/40">
                            <div className="flex items-center gap-2 text-slate-300">
                                <span className="text-slate-500 font-semibold w-20">Candidate</span>
                                <span className="font-bold text-white">{candidate.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <span className="text-slate-500 font-semibold w-20">Position</span>
                                <span className="font-bold text-white">{job.title}</span>
                            </div>
                        </div>
                    )}

                    {/* Speech Recognition status */}
                    {sttStatus === "unsupported" && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-sm text-yellow-400">
                            ⚠️ Your browser doesn&apos;t support speech recognition. You can still type your answers.
                        </div>
                    )}

                    {/* MicTest widget */}
                    <MicTest onTestComplete={setMicReady} />

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={startInterview}
                            className="w-full py-4 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
                        >
                            {micReady ? "✓ Microphone Ready — Start Interview" : "Start Interview Without Mic Check"}
                        </button>
                        <button
                            onClick={() => navigate('/ai')}
                            className="w-full py-3 rounded-3xl bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-sm transition-all"
                        >
                            ← Go Back to Selection
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Active Interview Screen ───────────────────────────────────────────────
    const currentQ = questions[currentQIndex];

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans p-4 lg:p-12 flex flex-col items-center">
            {/* Header: Progress & Timer */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-12">
                <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Question {currentQIndex + 1} of {totalQuestions}</p>
                    <div className="h-2 w-48 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}></div>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl flex flex-col items-center transition-all ${timeLeft < 20 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-slate-800 text-indigo-400'}`}>
                    <span className="text-2xl font-black">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-bold uppercase">Time Remaining</span>
                </div>
            </div>

            {/* Main Stage */}
            <div className="w-full max-w-4xl flex-1 flex flex-col gap-8 relative">
                {/* Bot Message / Question */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-600 animate-bounce' : 'bg-slate-700'}`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded-lg border border-indigo-500/30">AI Interviewer</span>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${currentQ?.difficulty === 'hard' ? 'bg-red-500/20 text-red-500 border-red-500/30' : currentQ?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}>
                                {currentQ?.difficulty || 'Medium'}
                            </span>
                        </div>

                        {appState === "generating" ? (
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-slate-700 animate-pulse rounded-full"></div>
                                <div className="h-4 w-1/2 bg-slate-700 animate-pulse rounded-full"></div>
                                <p className="text-slate-500 text-sm mt-4 italic">Thinking of a new challenge...</p>
                            </div>
                        ) : (
                            <h2 className="text-2xl lg:text-3xl font-medium leading-relaxed text-slate-100">
                                {currentQ?.text}
                            </h2>
                        )}
                    </div>
                </div>

                {/* Answer Area */}
                <div className="flex flex-col gap-6">
                    <div className="relative group">
                        <textarea
                            disabled={appState === "evaluating" || appState === "speaking" || appState === "generating"}
                            placeholder={
                                appState === "speaking" || appState === "generating"
                                    ? "Listen to the interviewer..."
                                    : isRecording
                                        ? "🎤 Listening — speak your answer..."
                                        : "Click the mic to speak, or type your answer here..."
                            }
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className="w-full h-48 bg-slate-800/30 border-2 border-slate-700 focus:border-indigo-500 rounded-[30px] p-8 outline-none transition-all text-lg font-medium resize-none shadow-inner"
                        ></textarea>

                        <div className="absolute bottom-6 right-6 flex items-center gap-4">
                            {isRecording && (
                                <span className="text-red-400 text-xs font-bold animate-pulse uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-ping"></span>
                                    Recording...
                                </span>
                            )}
                            {sttStatus === "unsupported" ? (
                                <span className="text-xs text-slate-500 italic">Type your answer</span>
                            ) : (
                                <button
                                    onClick={toggleRecording}
                                    disabled={appState === "evaluating" || appState === "speaking" || appState === "generating"}
                                    title={isRecording ? "Stop recording" : "Start voice recording"}
                                    className={`p-5 rounded-3xl shadow-2xl transition-all relative z-10 
                                        ${isRecording ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-slate-700 text-indigo-400 hover:bg-slate-600'}
                                        disabled:opacity-20 disabled:cursor-not-allowed
                                    `}
                                >
                                    {isRecording ? (
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"></path></svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-slate-500 text-xs italic">* Your response will be scored based on technical accuracy and clarity.</p>
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={appState !== "listening" || !currentAnswer.trim()}
                            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black rounded-3xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3"
                        >
                            {appState === "evaluating" ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Evaluating...
                                </>
                            ) : (
                                <>
                                    Submit Answer
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Finished State */}
            {appState === "finished" && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-[50px] p-12 max-w-2xl w-full text-center space-y-8 shadow-2xl">
                        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black">Interview Completed!</h2>
                            <p className="text-slate-400 text-lg">Thank you, {candidate?.name || "Candidate"}. Your performance has been recorded and will be reviewed shortly.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 p-6 rounded-[30px] border border-slate-700">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Questions</p>
                                <p className="text-3xl font-black text-white">{totalQuestions}</p>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-[30px] border border-slate-700">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Avg Score</p>
                                <p className="text-3xl font-black text-indigo-400">
                                    {questions.length > 0
                                        ? Math.round(questions.reduce((acc, q) => acc + (q.score || 0), 0) / questions.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/ai')}
                            className="w-full py-5 bg-white text-slate-900 font-black rounded-3xl hover:bg-slate-200 transition-all text-xl"
                        >
                            Return to Selection
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
