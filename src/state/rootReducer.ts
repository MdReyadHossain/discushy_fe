import { combineReducers } from '@reduxjs/toolkit';
import apiSlice from './apiSlice';
import meetingSlice from './features/liveInterview/liveInterview.slice';

const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    meeting: meetingSlice,
});

export default rootReducer;
