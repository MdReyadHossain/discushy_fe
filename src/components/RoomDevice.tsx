import { AudienceIcon, Button, ButtonGroup, MicrophoneOffSmallIcon, MicrophoneSmallIcon, Tooltip, VideoIcon, VideoOffIcon } from "convertupleads-theme";
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
        <>
            <Tooltip title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
                <Button
                    variant={!isScreenSharing ? 'outlined' : 'tonal'}
                    color={!isScreenSharing ? 'primary' : 'error'}
                    onClick={onToggleScreenShare}
                    sx={{ width: '20px', height: '36px' }}
                >
                    <AirplayIcon />
                </Button>
            </Tooltip>

            <Tooltip title={`People (${users.length + 2})`}>
                <Button
                    variant={'outlined'}
                    color={'primary'}
                    onClick={onPeopleDrawerToggle}
                    sx={{ width: '20px', height: '36px' }}
                >
                    <AudienceIcon />
                </Button>
            </Tooltip>

            <ButtonGroup
                variant="outlined"
                color={isCameraOn ? 'primary' : 'error'}
                ref={anchorRef}
                aria-label="split button"
            >
                <Button
                    variant={isCameraOn ? 'outlined' : 'tonal'}
                    onClick={onToggleCamera}
                    sx={{ width: '20px', height: '36px' }}
                >
                    {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
                </Button>
                {/* <Button
                    size="small"
                    // aria-controls={open ? "split-button-menu" : undefined}
                    // aria-expanded={open ? "true" : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                // onClick={handleToggle}
                >
                    <ChevronDownIcon />
                </Button> */}
            </ButtonGroup>
            <ButtonGroup
                variant="outlined"
                color={isMicOn ? 'primary' : 'error'}
                ref={anchorRef}
                aria-label="split button"
            >
                <Button
                    variant={isMicOn ? 'outlined' : 'tonal'}
                    onClick={onToggleMic}
                    sx={{ width: '20px', height: '36px' }}
                >
                    {isMicOn ? <MicrophoneSmallIcon /> : <MicrophoneOffSmallIcon />}
                </Button>
                {/* <Button
                    size="small"
                    // aria-controls={open ? "split-button-menu" : undefined}
                    // aria-expanded={open ? "true" : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                // onClick={handleToggle}
                >
                    <ChevronDownIcon />
                </Button> */}
            </ButtonGroup>
        </>
    )
}

export default RoomDevice
