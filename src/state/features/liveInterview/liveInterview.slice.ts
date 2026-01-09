import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MeetingRole } from "./liveInterview.interface";

const initialState = {
    meetingUser: {
        name: '',
        role: 'member' as MeetingRole,
    }
};

const meetingSlice = createSlice({
    name: 'meeting',
    initialState: initialState,
    reducers: {
        setMeetingUserName: (state, action: PayloadAction<string>) => {
            state.meetingUser.name = action.payload;
        },
        setMeetingUserRole: (state, action: PayloadAction<MeetingRole>) => {
            state.meetingUser.role = action.payload;
        }
    }
})

export const {
    setMeetingUserName,
    setMeetingUserRole
} = meetingSlice.actions;

export default meetingSlice.reducer;