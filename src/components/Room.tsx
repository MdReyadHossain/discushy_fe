import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Avatar, Box, Button, CallMissedIcon, DrawerWithHeader, IconButton, MicrophoneOffSmallIcon } from "convertupleads-theme";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import WaveAnimation from '../assets/WaveAnimation';
import useWebRTC from "../hooks/useWebRTC";
import { socket } from '../socket';
import { selectMeetingState } from '../state/features/liveInterview/liveInterview.selector';
import { isEmpty } from '../utils/core.utils';
import PeopleBar from './PeopleBar';
import RoomDevice from './RoomDevice';
import RoomHeader from "./RoomHeader";
import Style from './room.module.css';

export interface User {
    userId: string;
    userName: string;
}

export default function Room() {
    const { roomId } = useParams<{ roomId: string }>();
    const { meetingUser } = useSelector(selectMeetingState);
    const {
        myVideoRef,
        screenVideoRef,
        users,
        userId,
        isCameraOn,
        isMicOn,
        isScreenSharing,
        screenShareStream,
        screenShareUser,
        endMeeting,
        toggleCamera,
        toggleMic,
        toggleScreenShare,
        isMeSpeaking
    } = useWebRTC(roomId || '');
    const [isSharedScreenFull, setIsSharedScreenFull] = useState<boolean>(false);
    const [isPeopleDrawerOpen, setIsPeopleDrawerOpen] = useState<boolean>(false);

    useEffect(() => {
        if (isEmpty(meetingUser.name)) window.location.assign('/');
        if (screenVideoRef.current && screenShareStream) {
            screenVideoRef.current.srcObject = screenShareStream;
        }
    }, [screenShareStream]);
    return (
        <Box className={Style.roomContainer}>
            {/* Top Bar */}
            <RoomHeader
                users={users}
                roomId={roomId || ''}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                isScreenSharing={isScreenSharing}
                onEndMeeting={endMeeting}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
                onToggleScreenShare={toggleScreenShare}
                onPeopleDrawerToggle={() => setIsPeopleDrawerOpen(true)}
            />

            {/* Content Area */}
            <Box className={Style.contentArea}>
                {/* Screen Share Display */}
                {screenShareStream && (
                    <Box className={`${Style.screenShareContainer} ${isSharedScreenFull ? Style.screenShareContainerFull : Style.screenShareContainerDefault}`}>
                        <video
                            ref={screenVideoRef}
                            autoPlay
                            playsInline
                            className={Style.screenShareVideo}
                        />
                        <Box className={Style.screenShareLabel}>
                            {screenShareUser === userId ? 'You are sharing your screen' : `Screen shared by ${users.find(u => u.userId === screenShareUser)?.userName || 'User'}`}
                        </Box>
                        <IconButton
                            sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                fontSize: 14,
                                fontWeight: 500
                            }}
                            onClick={() => setIsSharedScreenFull(prev => !prev)}
                        >
                            {isSharedScreenFull ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Box>
                )}

                <Box className={`${Style.videoGridWrapper} ${(isSharedScreenFull && screenShareStream) ? Style.videoGridWrapperHidden : ''}`}>
                    {/* Video Grid Stage */}
                    <Box className={Style.videoContainer}>
                        <Box
                            id="video-grid"
                            className={Style.videoGrid}
                            sx={{
                                gridTemplateColumns: screenShareStream
                                    ? { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(6, 1fr)" }
                                    : users.length === 0
                                        ? "repeat(1, 1fr)"
                                        : users.length === 1
                                            ? { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }
                                            : users.length === 2
                                                ? { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }
                                                : { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                                gridTemplateRows: screenShareStream
                                    ? "1fr"
                                    : users.length <= 1
                                        ? "1fr"
                                        : { xs: "auto", sm: "repeat(2, 1fr)" },
                                gridAutoRows: "1fr"
                            }}
                        >
                            {/* My Video */}
                            <Box
                                className={`${Style.myVideoBox} ${isMeSpeaking ? Style.myVideoBoxSpeaking : Style.myVideoBoxNotSpeaking}`}
                            >
                                <video
                                    ref={myVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={Style.myVideo}
                                    style={{ display: isCameraOn ? 'block' : 'none' }}
                                />
                                {!isCameraOn && (
                                    <Box className={Style.myOffCameraBox}>
                                        <Avatar size="large" sx={{
                                            bgcolor: 'primary.main',
                                            width: { xs: "56px", sm: "72px", md: "86px" },
                                            height: { xs: "56px", sm: "72px", md: "86px" },
                                            fontSize: { xs: 24, sm: 30, md: 36 },
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}>
                                            {(meetingUser.name || 'You').charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Box>
                                )}
                                <Box className={Style.myVideoLabel}>
                                    You
                                </Box>
                                {!isMicOn ? (
                                    <Box className={Style.myMutedIcon}>
                                        <MicrophoneOffSmallIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                                    </Box>
                                ) : (isMeSpeaking) && (
                                    <Box className={Style.myVoiceWave}>
                                        <WaveAnimation />
                                    </Box>
                                )}
                            </Box>

                            {/* AI Assistant Avatar */}
                            {/* <Box className={Style.aiBox}>
                                <Box
                                    className={Style.aiContent}
                                >
                                    <Avatar
                                        sx={{
                                            backgroundColor: 'black',
                                            width: "86px",
                                            height: "86px",
                                            fontSize: "36px",
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}
                                        size="large"
                                    >
                                        S
                                    </Avatar>
                                </Box>
                                <Box className={Style.aiAvatarLabel}>
                                    Sofia
                                </Box>
                            </Box> */}
                        </Box>
                    </Box>

                    <DrawerWithHeader
                        anchor="right"
                        header={`People (${users.length + 1})`}
                        open={isPeopleDrawerOpen}
                        onClose={() => setIsPeopleDrawerOpen(false)}
                    >
                        <PeopleBar
                            users={users}
                            role={meetingUser.role}
                            voiceModel={"Sofia"}
                            isMicOn={isMicOn}
                            onToggleMic={toggleMic}
                        />
                    </DrawerWithHeader>
                </Box>
            </Box>

            {/* Mobile Bottom Control Bar */}
            <Box className={Style.mobileControlBar}>
                <RoomDevice
                    users={users}
                    isCameraOn={isCameraOn}
                    isMicOn={isMicOn}
                    isScreenSharing={isScreenSharing}
                    onToggleCamera={toggleCamera}
                    onToggleMic={toggleMic}
                    onToggleScreenShare={toggleScreenShare}
                    onPeopleDrawerToggle={() => setIsPeopleDrawerOpen(true)}
                />
                <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                    {meetingUser.role === 'host' &&
                        <Button
                            onClick={endMeeting}
                            color="warning"
                            size="small"
                            sx={{ fontSize: 12, px: 1.5 }}
                        >
                            End Meeting
                        </Button>
                    }
                    <Button
                        onClick={() => {
                            socket.disconnect();
                            window.location.assign('/');
                        }}
                        variant='contained'
                        color="error"
                        size="small"
                        sx={{
                            minWidth: '36px',
                            width: '36px',
                            height: '36px',
                            p: 1
                        }}
                    >
                        <CallMissedIcon sx={{ fontSize: 16 }} />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
