export interface IMeetingSlugParams {
    jobPostId: string;
    candidateId: string;
}

export interface IMeetingConversationBody extends IMeetingSlugParams {
    people: { name: string; role: MeetingRole }[];
    sender: string;
    conversationText: string;
}

export interface IMeeting {
    name: string;
    role: MeetingRole;
}

export type MeetingRole = 'host' | 'member' | '';