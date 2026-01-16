import { Box, Button, CallMissedIcon, CopyIcon, Divider, IconButton, LoadingButton, ModalWithHeader, Stack, TextField, WarningModal } from "convertupleads-theme";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { socket } from "../socket";
import { selectMeetingState } from "../state/features/liveInterview/liveInterview.selector";
import { DEFAULT_INVITE_MESSAGE } from "../utils/core.utils";
import RoomDevice from "./RoomDevice";
import { IMeetingParticipant } from "../room.interface";

interface IProps {
    users: IMeetingParticipant[];
    roomId: string;
    isCameraOn: boolean;
    isMicOn: boolean;
    isScreenSharing: boolean;
    onEndMeeting: () => void;
    onToggleCamera: () => void;
    onToggleMic: () => void;
    onToggleScreenShare: () => void;
    onPeopleDrawerToggle?: () => void;
}

const RoomHeader = ({ users, roomId, isCameraOn, isMicOn, isScreenSharing, onEndMeeting, onToggleCamera, onToggleMic, onToggleScreenShare, onPeopleDrawerToggle }: IProps) => {
    const { meetingUser } = useSelector(selectMeetingState);
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    const [endMeetingModal, setEndMeetingModal] = useState<boolean>(false);
    const [inviteString, setInviteString] = useState<string>(DEFAULT_INVITE_MESSAGE(roomId));
    const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);

    const handleLeaveMeeting = () => {
        socket.disconnect();
        window.location.assign('/');
    };

    const handleCopyRoomUrl = () => {
        navigator.clipboard.writeText(roomId);
        toast.success("Room ID copied to clipboard");
    };

    const handleEndMeeting = () => {
        onEndMeeting();
        socket.disconnect();
        window.location.assign('/');
    };

    const onCopyInviteString = () => {
        navigator.clipboard.writeText(inviteString);
        toast.success("Invite message copied to clipboard");
        setInviteModalOpen(false);
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 2,
                borderBottom: 1,
                borderColor: "divider",
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                gap: { xs: 1, md: 0 }
            }}>
                <Stack direction={'row'} alignItems={'center'} gap={2}>
                    <img
                        src={'/discushy_Icon.png'}
                        alt="Logo"
                        style={{
                            height: 'auto',
                            width: 'auto',
                            maxHeight: '50px',
                            minHeight: '32px'
                        }}
                    />
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        <Box sx={{ fontWeight: 600, fontSize: 16 }}>Discushy</Box>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Box sx={{
                                color: "text.secondary",
                                fontSize: 13,
                                whiteSpace: 'nowrap'
                            }}>
                                Room: {roomId}
                            </Box>
                            <IconButton size="small" color="info" onClick={handleCopyRoomUrl}>
                                <CopyIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <Box sx={{ display: { xs: 'none', md: 'inline' } }}>
                                <Box sx={{ display: 'inline' }}>or </Box>
                                <Button
                                    variant="noPadding"
                                    color="info"
                                    onClick={() => setInviteModalOpen(true)}
                                    sx={{ fontSize: 14 }}
                                >
                                    Invite
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>

                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                }}>
                    <audio id="sofia-audio" style={{ display: 'none' }} controls autoPlay />
                    <Box sx={{
                        px: 2,
                        py: 0.75,
                        borderRadius: 1,
                        bgcolor: "action.hover",
                        fontSize: 14,
                        display: { xs: 'none', sm: 'block' }
                    }}>
                        {currentTime}
                    </Box>
                    <Box sx={{
                        px: 2,
                        py: 0.75,
                        borderRadius: 1,
                        bgcolor: "action.hover",
                        fontSize: 14,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {meetingUser.name}
                    </Box>
                    {/* Hide RoomDevice on mobile - it appears in bottom bar */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <RoomDevice
                            users={users}
                            isCameraOn={isCameraOn}
                            isMicOn={isMicOn}
                            isScreenSharing={isScreenSharing}
                            onToggleCamera={onToggleCamera}
                            onToggleMic={onToggleMic}
                            onToggleScreenShare={onToggleScreenShare}
                            onPeopleDrawerToggle={onPeopleDrawerToggle}
                        />
                    </Box>
                    {meetingUser.role == 'host' &&
                        <Button
                            onClick={() => setEndMeetingModal(true)}
                            color="warning"
                            sx={{
                                display: { xs: 'none', md: 'inline-flex' },
                                fontSize: 14,
                                px: 2
                            }}
                        >
                            End Meeting
                        </Button>
                    }
                    <Button
                        onClick={handleLeaveMeeting}
                        startIcon={<CallMissedIcon />}
                        color="error"
                        sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                            fontSize: 14,
                            px: 2
                        }}
                    >
                        Leave
                    </Button>
                </Box>
            </Box>

            <WarningModal
                open={endMeetingModal}
                onClose={() => setEndMeetingModal(false)}
                onConfirm={handleEndMeeting}
                buttonText="Yes, End"
                title="End Meeting"
                warningContent="Once you end the meeting, it won't be able to resume. Are you sure you want to end the meeting?"
            />

            <ModalWithHeader title="Invite People" open={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ fontWeight: 600 }}>
                        <TextField
                            placeholder={DEFAULT_INVITE_MESSAGE(roomId)}
                            multiline
                            minRows={4}
                            fullWidth
                            value={inviteString}
                            onChange={(e) => setInviteString(e.target.value)}
                        />
                    </Box>
                    <Divider light />
                    <Stack direction={'row'} justifyContent={'flex-end'} my={2} mx={{ xs: 1, sm: 2 }} spacing={1.3}>
                        <Button onClick={() => setInviteModalOpen(false)} variant="outlined" size="medium">
                            Close
                        </Button>
                        <LoadingButton
                            type='submit'
                            variant={'contained'}
                            size={'medium'}
                            onClick={onCopyInviteString}
                        >
                            Copy
                        </LoadingButton>
                    </Stack>
                </Box>
            </ModalWithHeader>
        </>
    )
}

export default RoomHeader
