import { Avatar, Box, IconButton, MicrophoneOffSmallIcon, MicrophoneSmallIcon, Typography } from "convertupleads-theme"
import { MeetingRole } from "../state/features/liveInterview/liveInterview.interface";
import { IMeetingParticipant } from "../room.interface";

interface IProps {
    users: IMeetingParticipant[];
    role: MeetingRole;
    voiceModel: string;
    isMicOn: boolean;
    onToggleMic: () => void;
}

const PeopleBar = ({ voiceModel, role, isMicOn, users, onToggleMic }: IProps) => {
    console.log('voiceModel #', voiceModel);
    return (
        <Box sx={{ width: 260, borderLeft: 1, borderColor: "divider", display: "flex", flexDirection: "column" }}>
            {/* <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ fontWeight: 600 }}>People ({[myUserId, ...Array.from(new Set(users))].length} / 4)</Box>
            </Box> */}

            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25, overflowY: "auto" }}>
                {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Avatar size="medium" sx={{ bgcolor: `info.main` }} />
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ fontSize: 14, fontWeight: 600 }}>
                            {voiceModel} <Typography variant="caption" fontWeight={700} color={"GrayText"}>(AI)</Typography>
                        </Box>
                        <Box sx={{ fontSize: 12, color: "text.secondary" }}>Joined</Box>
                    </Box>
                    <IconButton size="small" sx={{ cursor: 'not-allowed' }}>
                        <MicrophoneSmallIcon />
                    </IconButton>
                </Box> */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Avatar size="medium" sx={{ bgcolor: `info.main` }} />
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ fontSize: 14, fontWeight: 600 }}>You <Typography variant="caption" fontWeight={700} color={"GrayText"} textTransform={'capitalize'}>({role})</Typography></Box>
                        <Box sx={{ fontSize: 12, color: "text.secondary" }}>Joined</Box>
                    </Box>
                    {isMicOn ?
                        (
                            <IconButton size="small" onClick={onToggleMic}>
                                <MicrophoneSmallIcon />
                            </IconButton>
                        ) : (
                            <IconButton size="small" onClick={onToggleMic}>
                                <MicrophoneOffSmallIcon />
                            </IconButton>
                        )
                    }
                </Box>
                {[...Array.from(new Set(users))].map((user) => (
                    <Box key={user.userId} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Avatar size="medium" sx={{ bgcolor: `info.main` }} />
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ fontSize: 14, fontWeight: 600 }}>{user.userName} <Typography variant="caption" fontWeight={700} color={"GrayText"} textTransform={'capitalize'}>({user.userRole})</Typography></Box>
                            <Box sx={{ fontSize: 12, color: "text.secondary" }}>Joined</Box>
                        </Box>
                        {user.isMuted ? (
                            <IconButton size="small" sx={{ cursor: 'not-allowed' }}>
                                <MicrophoneOffSmallIcon />
                            </IconButton>
                        ) : (
                            <IconButton size="small" sx={{ cursor: 'not-allowed' }}>
                                <MicrophoneSmallIcon />
                            </IconButton>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default PeopleBar
