import { Box, Button, CallMissedIcon, CopyIcon, Divider, IconButton, LoadingButton, ModalWithHeader, Stack, TextField, WarningModal } from "convertupleads-theme";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { socket } from "../socket";
import { selectMeetingState } from "../state/features/liveInterview/liveInterview.selector";
import { DEFAULT_INVITE_MESSAGE } from "../utils/core.utils";
import RoomDevice from "./RoomDevice";

interface IProps {
    roomId: string;
    isCameraOn: boolean;
    isMicOn: boolean;
    isScreenSharing: boolean;
    onEndMeeting: () => void;
    onToggleCamera: () => void;
    onToggleMic: () => void;
    onToggleScreenShare: () => void;
}


const RoomHeader = ({ roomId, isCameraOn, isMicOn, isScreenSharing, onEndMeeting, onToggleCamera, onToggleMic, onToggleScreenShare }: IProps) => {
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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction={'row'} alignItems={'center'} gap={2}>
                    <img src={'/discushy_Icon.png'} alt="Logo" width={50} height={0} style={{ height: 'auto' }} />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Box sx={{ fontWeight: 600 }}>Discushy</Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ color: "text.secondary", fontSize: 13 }}>Room ID: {roomId}</Box>
                            <IconButton size="small" color="info" onClick={handleCopyRoomUrl}><CopyIcon /></IconButton> or
                            <Button
                                variant="noPadding"
                                color="info"
                                onClick={() => setInviteModalOpen(true)}
                            >
                                Invite
                            </Button>
                        </Stack>
                    </Box>
                </Stack>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <audio id="sofia-audio" style={{ display: 'none' }} controls autoPlay />
                    {/* <Button variant="tonal" onClick={handleSpeakSofia}>Sofia</Button> */}
                    <Box sx={{ px: 2, py: 0.75, borderRadius: 1, bgcolor: "action.hover" }}>{currentTime}</Box>
                    <Box sx={{ px: 2, py: 0.75, borderRadius: 1, bgcolor: "action.hover" }}>{meetingUser.name}</Box>
                    <RoomDevice
                        isCameraOn={isCameraOn}
                        isMicOn={isMicOn}
                        isScreenSharing={isScreenSharing}
                        onToggleCamera={onToggleCamera}
                        onToggleMic={onToggleMic}
                        onToggleScreenShare={onToggleScreenShare}
                    />
                    {meetingUser.role == 'host' &&
                        <Button onClick={() => setEndMeetingModal(true)} color="warning">End Meeting</Button>
                    }
                    <Button onClick={handleLeaveMeeting} startIcon={<CallMissedIcon />} color="error">Leave</Button>
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
                <Box sx={{ p: 2 }}>
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
                    <Stack direction={'row'} justifyContent={'flex-end'} my={2} mx={2} spacing={1.3}>
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
