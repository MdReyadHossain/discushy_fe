import { Box, Divider, FormControl, FormLabel, LoadingButton, Stack, TextField, Typography } from 'convertupleads-theme';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { selectMeetingState } from '../state/features/liveInterview/liveInterview.selector';
import { setMeetingUserName } from '../state/features/liveInterview/liveInterview.slice';
import { AppDispatch } from '../state/store';
import { isEmpty } from '../utils/core.utils';
import Style from './room.module.css';
import VoiceTestBar from './VoiceTestBar';

interface IProps {
    roomId: string;
    onClose: () => void;
}

const JoinRoomModal = ({ roomId, onClose }: IProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { meetingUser } = useSelector(selectMeetingState);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [deviceErrorMessage, setDeviceErrorMessage] = useState<string | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopStream = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setMediaStream(null);
    };

    const startStream = async () => {
        setDeviceErrorMessage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => { });
            }
            streamRef.current = stream;
            setMediaStream(stream);
        } catch (err) {
            setDeviceErrorMessage('Need to access both camera and microphone for joining the interview. Please allow access and try again.');
        }
    };

    const handleChangeUserName = (text: string) => {
        dispatch(setMeetingUserName(text));
        setErrorMessage(null);
    }

    const joinRoom = () => {
        navigate(`/room/${roomId}`);
    };

    const onSubmit = async () => {
        setErrorMessage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => { });
            }
            if (isEmpty(meetingUser.name)) {
                toast.error('Please enter your name.');
                return;
            }
            joinRoom();
            onClose();
        } catch (err: any) {
            let message = 'Please allow camera and microphone access from your browser settings.';
            if (err?.name === 'NotFoundError') message = 'No camera or microphone found.';
            toast.error(message);
        }
    }

    useEffect(() => {
        startStream();
        return () => stopStream();
    }, []);
    return (
        <Box>
            <Stack direction={"row"} alignItems={"center"} spacing={2} sx={{ p: 2 }}>
                <Box className={Style.videoWrapper}>
                    <video ref={videoRef} className={Style.video} muted playsInline />
                    {deviceErrorMessage && (
                        <Box className={Style.cameraOff}>
                            <Typography>Camera is off</Typography>
                        </Box>
                    )}
                    <Box className={Style.videoLabel} />
                </Box>
                <Box width={500}>
                    <FormControl sx={{ mb: 2 }} fullWidth error={!!errorMessage}>
                        <FormLabel>Enter your name *</FormLabel>
                        <TextField
                            type='text'
                            autoComplete='off'
                            placeholder='Write your name'
                            value={meetingUser.name}
                            onChange={(e) => handleChangeUserName(e.target.value)}
                            helperText={errorMessage}
                            error={!!errorMessage}
                            fullWidth
                            required
                        />
                    </FormControl>
                    <FormControl sx={{ mb: 2 }} fullWidth error={!!errorMessage}>
                        <FormLabel>Voice test</FormLabel>
                        <VoiceTestBar stream={mediaStream} />
                    </FormControl>
                </Box>
            </Stack>

            <Divider light />
            <Stack direction={'row'} justifyContent={'flex-end'} my={2} mx={2} spacing={1.3}>
                <LoadingButton
                    type='submit'
                    variant={'contained'}
                    size={'medium'}
                    onClick={onSubmit}
                >
                    Join Room
                </LoadingButton>
            </Stack>
        </Box>
    )
}

export default JoinRoomModal
