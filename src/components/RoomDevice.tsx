import AirplayIcon from '@mui/icons-material/Airplay';
import { AudienceIcon, Box, Button, ButtonGroup, ChevronDownIcon, ClickAwayListener, Grow, MenuItem, MenuList, MicrophoneOffSmallIcon, MicrophoneSmallIcon, Paper, Popper, Tooltip, Typography, VideoIcon, VideoOffIcon } from "convertupleads-theme";
import { useEffect, useRef, useState } from "react";
import { IMeetingParticipant } from "../room.interface";

type RoomDeviceProps = {
    users: IMeetingParticipant[];
    isCameraOn: boolean;
    isMicOn: boolean;
    isScreenSharing: boolean;
    onToggleCamera: () => void;
    onToggleMic: () => void;
    onToggleScreenShare: () => void;
    onPeopleDrawerToggle?: () => void;
    selectedCameraId?: string;
    selectedMicId?: string;
    onCameraChange?: (deviceId: string) => void;
    onMicChange?: (deviceId: string) => void;
};

const RoomDevice = ({
    users,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    onToggleCamera,
    onToggleMic,
    onToggleScreenShare,
    onPeopleDrawerToggle,
    selectedCameraId: controlledCameraId,
    selectedMicId: controlledMicId,
    onCameraChange,
    onMicChange
}: RoomDeviceProps) => {
    const anchorCameraRef = useRef<HTMLDivElement | null>(null);
    const anchorMicRef = useRef<HTMLDivElement | null>(null);
    const [openCamera, setOpenCamera] = useState<boolean>(false);
    const [openMic, setOpenMic] = useState<boolean>(false);

    const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
    const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
    const [internalCameraId, setInternalCameraId] = useState<string>('');
    const [internalMicId, setInternalMicId] = useState<string>('');

    // Use controlled value if provided, otherwise use internal state
    const selectedCameraId = controlledCameraId ?? internalCameraId;
    const selectedMicId = controlledMicId ?? internalMicId;

    useEffect(() => {
        const getDevices = async () => {
            try {
                // Request permission first to get device labels
                await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                const audioDevices = devices.filter(device => device.kind === 'audioinput');

                setCameraDevices(videoDevices);
                setMicDevices(audioDevices);

                // Set default selected devices only if not controlled
                if (videoDevices.length > 0 && !controlledCameraId && !internalCameraId) {
                    setInternalCameraId(videoDevices[0].deviceId);
                }
                if (audioDevices.length > 0 && !controlledMicId && !internalMicId) {
                    setInternalMicId(audioDevices[0].deviceId);
                }
            } catch (error) {
                console.error('Error enumerating devices:', error);
            }
        };

        getDevices();

        // Listen for device changes
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', getDevices);
        };
    }, []);

    const handleMicOptionToggle = () => setOpenMic((prev) => !prev);

    const handleCameraOptionToggle = () => setOpenCamera((prev) => !prev);

    const handleCameraOptionClose = (event: globalThis.MouseEvent | TouchEvent) => {
        if (anchorCameraRef.current && anchorCameraRef.current.contains(event.target as Node)) {
            return;
        }
        setOpenCamera(false);
    };

    const handleMicOptionClose = (event: globalThis.MouseEvent | TouchEvent) => {
        if (anchorMicRef.current && anchorMicRef.current.contains(event.target as Node)) {
            return;
        }
        setOpenMic(false);
    };

    const handleCameraDeviceSelect = (deviceId: string) => {
        // Update internal state if not controlled
        if (controlledCameraId === undefined) {
            setInternalCameraId(deviceId);
        }
        setOpenCamera(false);
        onCameraChange?.(deviceId);
    };

    const handleMicDeviceSelect = (deviceId: string) => {
        if (controlledMicId === undefined) {
            setInternalMicId(deviceId);
        }
        setOpenMic(false);
        onMicChange?.(deviceId);
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'nowrap'
        }}>
            <Tooltip title={`People (${users.length + 1})`}>
                <Button
                    variant={'outlined'}
                    color={'primary'}
                    onClick={onPeopleDrawerToggle}
                    sx={{
                        minWidth: '36px',
                        width: '36px',
                        height: '36px',
                        p: 1
                    }}
                >
                    <AudienceIcon />
                </Button>
            </Tooltip>

            <Tooltip title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
                <Button
                    variant={!isScreenSharing ? 'outlined' : 'tonal'}
                    color={!isScreenSharing ? 'primary' : 'error'}
                    onClick={onToggleScreenShare}
                    sx={{
                        minWidth: '36px',
                        width: '36px',
                        height: '36px',
                        p: 1,
                        display: { xs: 'none', md: 'inline-flex' }
                    }}
                >
                    <AirplayIcon />
                </Button>
            </Tooltip>

            <Button
                variant={isCameraOn ? 'outlined' : 'tonal'}
                onClick={onToggleCamera}
                color={isCameraOn ? 'primary' : 'error'}
                sx={{
                    minWidth: '36px',
                    width: '36px',
                    height: '36px',
                    p: 1,
                    display: { xs: 'inline-flex', md: 'none' }
                }}
            >
                {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
            </Button>

            <Button
                variant={isMicOn ? 'outlined' : 'tonal'}
                onClick={onToggleMic}
                color={isMicOn ? 'primary' : 'error'}
                sx={{
                    minWidth: '36px',
                    width: '36px',
                    height: '36px',
                    p: 1,
                    display: { xs: 'inline-flex', md: 'none' }
                }}
            >
                {isMicOn ? <MicrophoneSmallIcon /> : <MicrophoneOffSmallIcon />}
            </Button>

            <ButtonGroup
                variant="outlined"
                color={isCameraOn ? 'primary' : 'error'}
                ref={anchorCameraRef}
                aria-label="split button"
                sx={{ display: { xs: 'none', md: 'inline-flex' }, '& .MuiButtonGroup-grouped': { minWidth: '36px' } }}
            >
                <Button
                    variant={isCameraOn ? 'outlined' : 'tonal'}
                    onClick={onToggleCamera}
                    sx={{
                        minWidth: '36px',
                        width: '36px',
                        height: '36px',
                        p: 1
                    }}
                >
                    {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
                </Button>
                <Button
                    size="small"
                    aria-controls={openCamera ? "split-button-menu" : undefined}
                    aria-expanded={openCamera ? "true" : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleCameraOptionToggle}
                    sx={{ minWidth: 10, width: 25 }}
                >
                    <ChevronDownIcon />
                </Button>
            </ButtonGroup>
            <ButtonGroup
                variant="outlined"
                color={isMicOn ? 'primary' : 'error'}
                ref={anchorMicRef}
                aria-label="split button"
                sx={{ display: { xs: 'none', md: 'inline-flex' }, '& .MuiButtonGroup-grouped': { minWidth: '36px' } }}
            >
                <Button
                    variant={isMicOn ? 'outlined' : 'tonal'}
                    onClick={onToggleMic}
                    sx={{
                        minWidth: '36px',
                        width: '36px',
                        height: '36px',
                        p: 1
                    }}
                >
                    {isMicOn ? <MicrophoneSmallIcon /> : <MicrophoneOffSmallIcon />}
                </Button>
                <Button
                    size="small"
                    aria-controls={openMic ? "split-button-menu" : undefined}
                    aria-expanded={openMic ? "true" : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleMicOptionToggle}
                    sx={{ minWidth: 10, width: 25 }}
                >
                    <ChevronDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{
                    zIndex: 1,
                }}
                open={openMic}
                anchorEl={anchorMicRef.current}
                role={undefined}
                transition
                disablePortal
                placement={"bottom-end"}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === "bottom-end" ? "right top" : "right bottom",
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleMicOptionClose}>
                                <MenuList id="mic-menu" autoFocusItem>
                                    {micDevices.length === 0 ? (
                                        <MenuItem disabled>
                                            <Typography variant="body2" color="text.secondary">
                                                No microphones found
                                            </Typography>
                                        </MenuItem>
                                    ) : (
                                        micDevices.map((device) => (
                                            <MenuItem
                                                key={device.deviceId}
                                                selected={device.deviceId === selectedMicId}
                                                onClick={() => handleMicDeviceSelect(device.deviceId)}
                                            >
                                                {device.label || `Microphone ${micDevices.indexOf(device) + 1}`}
                                            </MenuItem>
                                        ))
                                    )}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            <Popper
                sx={{
                    zIndex: 1,
                }}
                open={openCamera}
                anchorEl={anchorCameraRef.current}
                role={undefined}
                transition
                disablePortal
                placement={"bottom-end"}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === "bottom-end" ? "right top" : "right bottom",
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleCameraOptionClose}>
                                <MenuList id="camera-menu" autoFocusItem>
                                    {cameraDevices.length === 0 ? (
                                        <MenuItem disabled>
                                            <Typography variant="body2" color="text.secondary">
                                                No cameras found
                                            </Typography>
                                        </MenuItem>
                                    ) : (
                                        cameraDevices.map((device) => (
                                            <MenuItem
                                                key={device.deviceId}
                                                selected={device.deviceId === selectedCameraId}
                                                onClick={() => handleCameraDeviceSelect(device.deviceId)}
                                            >
                                                {device.label || `Camera ${cameraDevices.indexOf(device) + 1}`}
                                            </MenuItem>
                                        ))
                                    )}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    )
}

export default RoomDevice
