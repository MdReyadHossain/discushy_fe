import { Box, LinearProgress, Typography } from 'convertupleads-theme';
import { useEffect, useRef, useState } from 'react';

interface VoiceTestBarProps {
    stream: MediaStream | null;
}

const VoiceTestBar = ({ stream }: VoiceTestBarProps) => {
    const [audioLevel, setAudioLevel] = useState<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!stream) {
            setAudioLevel(0);
            return;
        }

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            setAudioLevel(0);
            return;
        }

        try {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateLevel = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

                // Normalize to 0-100 range with some amplification for better visibility
                const normalizedLevel = Math.min(100, (average / 128) * 100 * 1.5);
                setAudioLevel(normalizedLevel);

                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };

            updateLevel();
        } catch (error) {
            console.error('Error setting up audio analyzer:', error);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            analyserRef.current = null;
            audioContextRef.current = null;
        };
    }, [stream]);

    const getBarColor = (level: number): string => {
        if (level < 20) return '#4caf50'; // Green - low
        if (level < 50) return '#8bc34a'; // Light green - medium low
        if (level < 70) return '#ffeb3b'; // Yellow - medium
        if (level < 85) return '#ff9800'; // Orange - medium high
        return '#f44336'; // Red - high
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={audioLevel}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                backgroundColor: getBarColor(audioLevel),
                                transition: 'transform 0.1s ease-out, background-color 0.2s ease',
                            },
                        }}
                    />
                </Box>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                Speak to see the audio level indicator move.
            </Typography>
        </Box>
    );
};

export default VoiceTestBar;
