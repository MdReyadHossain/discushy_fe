import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Avatar, Box, IconButton } from "convertupleads-theme";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useWebRTC from "../hooks/useWebRTC";
import RoomHeader from "./RoomHeader";
import Style from './room.module.css';
import { useSelector } from 'react-redux';
import { selectMeetingState } from '../state/features/liveInterview/liveInterview.selector';
import PeopleBar from './PeopleBar';
import { isEmpty } from '../utils/core.utils';

export interface User {
    userId: string;
    userName: string;
}

export default function Room() {
    const myUserIdRef = useRef<number>(10000 + Math.floor(Math.random() * 900000));
    const myUserId = myUserIdRef.current;
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

    useEffect(() => {
        if (isEmpty(meetingUser.name)) window.location.assign('/');
        if (screenVideoRef.current && screenShareStream) {
            screenVideoRef.current.srcObject = screenShareStream;
        }
    }, [screenShareStream]);
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default" }}>
            {/* Top Bar */}
            <RoomHeader
                roomId={roomId || ''}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                isScreenSharing={isScreenSharing}
                onEndMeeting={endMeeting}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
                onToggleScreenShare={toggleScreenShare}
            />

            {/* Content Area */}
            <Box sx={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "column" }}>
                {/* Screen Share Display */}
                {screenShareStream && (
                    <Box sx={{
                        width: '100%',
                        height: isSharedScreenFull ? '100%' : '75%',
                        bgcolor: '#1f1f1f',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        borderBottom: '2px solid #333'
                    }}>
                        <video
                            ref={screenVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                backgroundColor: '#1f1f1f'
                            }}
                        />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 500
                        }}>
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

                <Box sx={{ display: (isSharedScreenFull && screenShareStream) ? "none" : "flex", flex: 1, overflow: "hidden" }}>
                    {/* Video Grid Stage */}
                    <Box className={Style.videoContainer}>
                        <Box
                            id="video-grid"
                            className={Style.videoGrid}
                            sx={{
                                gridTemplateColumns: screenShareStream ? "repeat(4, 1fr)" :
                                    users.length > 0 ? "repeat(2, 1fr)" : "repeat(1, 1fr)",
                                gridAutoRows: "1fr"
                            }}
                        >
                            {/* My Video */}
                            <Box
                                className={Style.myVideoBox}
                                sx={{
                                    border: isMeSpeaking ? '2px solid #2196F3' : '2px solid black',
                                    transition: 'border-color 0.2s ease-in-out',
                                }}
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
                                            width: "86px",
                                            height: "86px",
                                            fontSize: 36,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}>
                                            {(meetingUser.name || 'You').charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Box>
                                )}
                                <Box className={Style.myVideoLabel}>
                                    You
                                </Box>
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

                    {/* Sidebar */}
                    <PeopleBar
                        users={users}
                        role={meetingUser.role}
                        voiceModel={"Sofia"}
                        isMicOn={isMicOn}
                        myUserId={myUserId}
                        onToggleMic={toggleMic}
                    />
                </Box>
            </Box>
        </Box>
    );
}
