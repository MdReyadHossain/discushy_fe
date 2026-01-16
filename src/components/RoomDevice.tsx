import { AudienceIcon, Button, ButtonGroup, MicrophoneOffSmallIcon, MicrophoneSmallIcon, Tooltip, VideoIcon, VideoOffIcon, Box } from "convertupleads-theme";
import AirplayIcon from '@mui/icons-material/Airplay';
import { useRef } from "react";
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
};

const RoomDevice = ({
    users,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    onToggleCamera,
    onToggleMic,
    onToggleScreenShare,
    onPeopleDrawerToggle
}: RoomDeviceProps) => {
    const anchorRef = useRef<HTMLDivElement | null>(null);

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
                        p: 1
                    }}
                >
                    <AirplayIcon />
                </Button>
            </Tooltip>

            <ButtonGroup
                variant="outlined"
                color={isCameraOn ? 'primary' : 'error'}
                ref={anchorRef}
                aria-label="split button"
                sx={{ '& .MuiButtonGroup-grouped': { minWidth: '36px' } }}
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
            </ButtonGroup>
            <ButtonGroup
                variant="outlined"
                color={isMicOn ? 'primary' : 'error'}
                ref={anchorRef}
                aria-label="split button"
                sx={{ '& .MuiButtonGroup-grouped': { minWidth: '36px' } }}
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
            </ButtonGroup>
        </Box>
    )
}

export default RoomDevice
