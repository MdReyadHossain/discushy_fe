import { AddIcon, Box, Button, Divider, FormLabel, ModalWithHeader, TextField, Typography } from "convertupleads-theme";
import { useState } from "react";
import JoinRoomModal from "./JoinRoomModal";
import { toast } from "react-toastify";
import { random6DigitCode } from "../utils/core.utils";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../state/store";
import { setMeetingUserRole } from "../state/features/liveInterview/liveInterview.slice";

export default function Home() {
    const dispatch = useDispatch<AppDispatch>();
    const [roomId, setRoomId] = useState("");
    const [openJoinModal, setOpenJoinModal] = useState<boolean>(false);

    const createRoom = () => {
        dispatch(setMeetingUserRole('host'));
        setOpenJoinModal(true);
        setRoomId(random6DigitCode());
    };

    const joinRoom = () => {
        if (!roomId) {
            toast.error('Please enter a room ID.');
            return;
        }
        dispatch(setMeetingUserRole('member'));
        setOpenJoinModal(true);
        setRoomId(roomId);
    };

    const handleCloseModal = () => {
        setOpenJoinModal(false);
        setRoomId("");
    }

    return (
        <>
            <Box sx={{
                padding: 4,
                height: "80vh",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
            }}>
                <Box>
                    <img src={'/discushy_logo_banner.png'} alt="Logo" width={200} height={0} style={{ height: 'auto' }} />
                    <Typography variant="body1" sx={{my: 1}}>Start or join a discussion room</Typography>
                    <Button onClick={createRoom} startIcon={<AddIcon />}>Create New Room</Button>
                </Box>

                <Box sx={{ marginTop: 4, border: '1px solid #ccc', borderRadius: 2, padding: 2 }}>
                    <FormLabel>Join a Room</FormLabel>
                    <br />
                    <TextField
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        autoComplete="off"
                    />
                    <br />
                    <br />
                    <Button variant="tonal" onClick={joinRoom}>Join Room</Button>
                </Box>

            </Box>
            <Box sx={{ position: 'absolute', bottom: 16, width: '100%', textAlign: 'center' }}>
                <Divider />
                <p>Developed By <a href="https://beetcoder.com" target="_blank">BeetCoder</a></p>
            </Box>

            <ModalWithHeader
                title='Join Room'
                open={openJoinModal}
                onClose={handleCloseModal}
            >
                <JoinRoomModal roomId={roomId} onClose={handleCloseModal} />
            </ModalWithHeader>
        </>
    );
}
