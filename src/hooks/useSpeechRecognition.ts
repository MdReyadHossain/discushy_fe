import { useRef, useState, useEffect } from "react";
import { isEmpty } from "../utils/core.utils";

export const useSpeechRecognition = (lang: string = "en-US") => {
    const [text, setText] = useState<string>("");
    const [isListening, setIsListening] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(0);
    const isPausedRef = useRef(false);
    const textRef = useRef("");
    const chunksRef = useRef<string[]>([]);
    const callbackRef = useRef<((opt?: string) => void) | undefined>(undefined);
    const finalAccumulatedRef = useRef<string>("");

    const CHUNK_WORD_LIMIT = 100;

    const recognitionRef = useRef<any | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isRecognitionActiveRef = useRef<boolean>(false);
    const shouldStopRef = useRef<boolean>(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const muteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const MUTE_THRESHOLD_DB = -30;
    const MUTE_DELAY_MS = 2000;

    let stream: MediaStream | null = null;

    const initializeAudio = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);

            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            source.connect(analyserRef.current);

            const update = () => {
                if (!analyserRef.current || !dataArrayRef.current) return;

                analyserRef.current.getByteTimeDomainData(dataArrayRef.current as any);

                let sum = 0;
                for (let i = 0; i < dataArrayRef.current.length; i++) {
                    const val = (dataArrayRef.current[i] - 128) / 128;
                    sum += val * val;
                }

                const rms = Math.sqrt(sum / dataArrayRef.current.length);
                const db = 20 * Math.log10(rms);
                const clampedDb = Math.max(-100, db);

                setVolume(clampedDb);

                if (clampedDb < MUTE_THRESHOLD_DB) {
                    if (!muteTimeoutRef.current) {
                        muteTimeoutRef.current = setTimeout(() => {
                            const allText = [...chunksRef.current, textRef.current].join(" ").trim();
                            if (!isEmpty(allText)) {
                                if (callbackRef.current && allText) callbackRef.current(allText);
                                chunksRef.current = [];
                                textRef.current = "";
                                finalAccumulatedRef.current = "";
                                setText("");
                            }
                        }, MUTE_DELAY_MS);
                    }
                } else {
                    if (muteTimeoutRef.current) {
                        clearTimeout(muteTimeoutRef.current);
                        muteTimeoutRef.current = null;
                    }
                }

                animationFrameIdRef.current = requestAnimationFrame(update);
            };

            update();
        } catch (err) {
            console.error('Microphone access denied or error:', err);
        }
    };

    const initializeRecognition = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser.");
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = true;
        recognition.interimResults = true;
        initializeAudio();
        return recognition;
    };

    const startListening = (callBackFunction?: (opt?: string) => void) => {
        try {
            if (typeof window === "undefined") return;
            if (isPaused) return;
            if (callBackFunction) callbackRef.current = callBackFunction;

            shouldStopRef.current = false;

            if (!recognitionRef.current) {
                recognitionRef.current = initializeRecognition();
                if (!recognitionRef.current) return;
            }

            const recognition = recognitionRef.current;

            const startRecognitionSafely = () => {
                if (!recognitionRef.current) return;
                if (isPausedRef.current || shouldStopRef.current) return;
                if (isRecognitionActiveRef.current) return;
                recognitionRef.current.start();
            };

            recognition.onstart = () => {
                setIsListening(true);
                setIsPaused(false);
                isRecognitionActiveRef.current = true;
            };

            recognition.onresult = (event: any) => {
                if (isPausedRef.current) return;
                let interim = "";

                const startIndex = typeof event.resultIndex === "number" ? event.resultIndex : 0;
                for (let i = startIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    const transcript = (res?.[0]?.transcript ?? "");
                    if (!transcript) continue;
                    if (res.isFinal) {
                        finalAccumulatedRef.current += transcript + " ";
                    } else {
                        interim += transcript + " ";
                    }
                }

                const combined = (finalAccumulatedRef.current + interim).trim();
                textRef.current = combined;
                setText(combined);

                const countWords = (s: string) => s ? s.trim().split(/\s+/).length : 0;
                const currentWordCount = countWords(combined);

                if (currentWordCount >= CHUNK_WORD_LIMIT && combined) {
                    setText("");
                    textRef.current = "";
                    finalAccumulatedRef.current = "";
                    chunksRef.current.push(combined);
                    recognition.stop();
                    return;
                }

                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            };

            recognition.onerror = (event: any) => {
                const err = event?.error;
                if (err === "no-speech" || err === "audio-capture") {
                    if (isRecognitionActiveRef.current && recognitionRef.current) {
                        recognitionRef.current.stop();
                    } else {
                        startRecognitionSafely();
                    }
                    return;
                }
                if (err === "aborted") return;
                console.error("Recognition error:", err);
            };

            recognition.onend = () => {
                setIsListening(false);
                isRecognitionActiveRef.current = false;
                if (!isPausedRef.current && !shouldStopRef.current) {
                    setTimeout(() => {
                        startRecognitionSafely();
                    }, 150);
                }
            };
            recognition.start();
        } catch (e) {
            console.error("Error starting speech recognition:", e);
        }
    };

    const mute = () => {
        setIsPaused(true);
        isPausedRef.current = true;
        shouldStopRef.current = true;
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        isRecognitionActiveRef.current = false;
    };

    const unmute = () => {
        try {
            setIsPaused(false);
            isPausedRef.current = false;
            shouldStopRef.current = false;
            if (recognitionRef.current) {
                if (!isRecognitionActiveRef.current) {
                    recognitionRef.current.start();
                }
            } else {
                recognitionRef.current = initializeRecognition();
                if (recognitionRef.current) startListening();
            }
        } catch (e) {
            console.error("Error on unmuting speech recognition:", e);
        }
    };

    const stopListening = () => {
        shouldStopRef.current = true;
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        chunksRef.current = [];
        textRef.current = "";
        finalAccumulatedRef.current = "";
        setText("");
        setIsListening(false);
        setIsPaused(false);
        isRecognitionActiveRef.current = false;
    };

    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    return {
        startListening,
        mute,
        unmute,
        stopListening,
        text,
        isListening,
        isPaused,
        volume
    };
};
