export interface IMeetingParticipant {
    userId: string;
    userName: string;
    userRole: string;
    isMuted: boolean;
    isCameraOff?: boolean;
}