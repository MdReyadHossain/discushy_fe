import { io } from "socket.io-client";

// const URL = "http://localhost:3100"; // Local development server URL
const URL = "https://ai-interview-3o-be.onrender.com"; // Production server URL

export const socket = io(URL);
