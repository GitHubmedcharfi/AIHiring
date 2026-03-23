import { useState, useRef, useEffect } from "react";

export default function MicTest({ onTestComplete }) {
    const [isTesting, setIsTesting] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [testResult, setTestResult] = useState(null); // 'success' | 'fail' | null
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);

    const startTest = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            setIsTesting(true);
            setTestResult(null);

            const checkLevel = () => {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setAudioLevel(average);
                animationFrameRef.current = requestAnimationFrame(checkLevel);
            };

            checkLevel();

            // Auto-stop after 3 seconds of activity
            setTimeout(() => {
                stopTest(true);
            }, 5000);

        } catch (err) {
            console.error("Mic test failed", err);
            setTestResult('fail');
            onTestComplete(false);
        }
    };

    const stopTest = (success) => {
        setIsTesting(false);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) audioContextRef.current.close();
        
        if (success) {
            setTestResult('success');
            onTestComplete(true);
        } else {
            setTestResult('fail');
            onTestComplete(false);
        }
    };

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Microphone Test</span>
                {testResult === 'success' && <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Ready
                </span>}
                {testResult === 'fail' && <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    Not Working
                </span>}
            </div>

            {isTesting ? (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-full transition-all duration-75" 
                            style={{ width: `${Math.min(100, audioLevel * 2)}%` }}
                        ></div>
                    </div>
                    <p className="text-center text-xs text-indigo-600 animate-pulse">Speak now to test your levels...</p>
                </div>
            ) : (
                <button
                    onClick={startTest}
                    className="w-full py-2 px-4 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors"
                >
                    {testResult ? "Test Again" : "Check Microphone"}
                </button>
            )}
        </div>
    );
}
