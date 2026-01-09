import { useRef, useState } from "react";

const SPEAKING_DELAY_MS = 500;

const useVoiceAudioAnalyzer = () => {
    const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
    const [isMeSpeaking, setIsMeSpeaking] = useState<boolean>(false);
    const analyserMapRef = useRef<Map<string, AnalyserNode>>(new Map());
    const animationFrameRef = useRef<number | null>(null);
    const lastSpeakingTimeRef = useRef<Map<string, number>>(new Map());
    const lastMeSpeakingTimeRef = useRef<number>(0);

    const createAudioAnalyser = (stream: MediaStream, peerId: string, isLocal: boolean = false): AnalyserNode | null => {
        try {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.4;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            if (!isLocal) {
                analyserMapRef.current.set(peerId, analyser);
            }

            return analyser;
        } catch (error) {
            console.error("Error creating audio analyser:", error);
            return null;
        }
    };

    const detectSpeaking = (analyser: AnalyserNode, threshold: number = 20): boolean => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        return average > threshold;
    };

    const startSpeakingDetection = (localAnalyser: AnalyserNode | null) => {
        const checkSpeaking = () => {
            const now = Date.now();

            // Check local user speaking
            if (localAnalyser) {
                const isCurrentlySpeaking = detectSpeaking(localAnalyser);
                if (isCurrentlySpeaking) {
                    lastMeSpeakingTimeRef.current = now;
                }
                const isLocalSpeaking = (now - lastMeSpeakingTimeRef.current) < SPEAKING_DELAY_MS;
                setIsMeSpeaking(isLocalSpeaking);
            }

            // Check remote users speaking and update their video borders
            const currentSpeaking = new Set<string>();
            analyserMapRef.current.forEach((analyser, odePeerId) => {
                const isCurrentlySpeaking = detectSpeaking(analyser);
                if (isCurrentlySpeaking) {
                    lastSpeakingTimeRef.current.set(odePeerId, now);
                }

                const lastSpeakTime = lastSpeakingTimeRef.current.get(odePeerId) || 0;
                const isSpeaking = (now - lastSpeakTime) < SPEAKING_DELAY_MS;

                if (isSpeaking) {
                    currentSpeaking.add(odePeerId);
                }

                // Update border for remote user video
                const userWrapper = document.querySelector(`.user-video-${odePeerId}`) as HTMLElement;
                if (userWrapper) {
                    userWrapper.style.borderColor = isSpeaking ? '#2196F3' : 'black';
                }
            });
            setSpeakingUsers(currentSpeaking);

            animationFrameRef.current = requestAnimationFrame(checkSpeaking);
        };
        checkSpeaking();
    };

    const removeAnalyser = (peerId: string) => {
        analyserMapRef.current.delete(peerId);
        lastSpeakingTimeRef.current.delete(peerId);
    };

    const cleanup = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        analyserMapRef.current.clear();
        lastSpeakingTimeRef.current.clear();
    };

    return {
        isMeSpeaking,
        speakingUsers,
        createAudioAnalyser,
        startSpeakingDetection,
        removeAnalyser,
        cleanup
    };
}

export default useVoiceAudioAnalyzer;