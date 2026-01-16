import { AddIcon, Box, Button, LoginIcon, ModalWithHeader, TextField, Typography } from "convertupleads-theme";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setMeetingUserRole } from "../state/features/liveInterview/liveInterview.slice";
import { AppDispatch } from "../state/store";
import { random6DigitCode } from "../utils/core.utils";
import JoinRoomModal from "./JoinRoomModal";
import Style from './home.module.css';

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

    // if (window.innerWidth < 768) {
    //     return <WarningMobileValidation />;
    // }

    return (
        <Box className={Style.pageWrapper}>
            {/* Header */}
            {/* <Box component="header" className={Style.header}>
                <Box className={Style.headerLogo}>
                    <img src="/discushy_logo_banner.png" alt="Discushy" className={Style.headerLogoIcon} />
                </Box>
            </Box> */}

            {/* Main Content */}
            <Box component="main" className={Style.mainContent}>
                {/* Left Section */}
                <Box component="section" className={Style.leftSection}>
                    <Box className={Style.brandLogo}>
                        <img src="/discushy_logo_banner.png" alt="Discushy" className={Style.brandLogoIcon} />
                        {/* <Box className={Style.brandTextWrapper}>
                            <Typography variant="h3" fontWeight={700} color="text.primary">Discushy</Typography>

                        </Box> */}
                    </Box>

                    <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                        Start or join a <Typography component="span" variant="h5" fontWeight={600} color="primary.main">discussion room</Typography>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        Free for everyone. Create a secure space and invite others with a single click.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={createRoom}
                        size="large"
                        sx={{ px: 3.5, py: 1.5 }}
                    >
                        Create New Room
                    </Button>
                </Box>

                {/* Right Section - Join Card */}
                <Box component="section" className={Style.rightSection}>
                    <Box className={Style.joinCard}>
                        <Box className={Style.joinCardHeader}>
                            <LoginIcon />
                            <Typography variant="h6" fontWeight={600}>
                                Join a Room
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Enter Room ID</Typography>
                        <TextField
                            fullWidth
                            placeholder="e.g. A1B2C3"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            autoComplete="off"
                            sx={{ mb: 2 }}
                        />

                        <Box className={Style.actionRow}>
                            <Button variant="tonal" onClick={joinRoom}>Join Room</Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box component="footer" className={Style.footer}>
                <Typography variant="body2" color="text.secondary">
                    Developed By <a href="https://beetcoder.com" target="_blank" rel="noopener noreferrer">BeetCoder</a>
                </Typography>
            </Box>

            <ModalWithHeader
                title='Join Room'
                open={openJoinModal}
                onClose={handleCloseModal}
            >
                <JoinRoomModal roomId={roomId} onClose={handleCloseModal} />
            </ModalWithHeader>
        </Box >
    );
}
