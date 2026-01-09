import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { socket } from "../socket";
import { IMeetingParticipant } from "../room.interface";
import { useSelector } from "react-redux";
import { selectMeetingState } from "../state/features/liveInterview/liveInterview.selector";
import useVoiceAudioAnalyzer from "./useVoiceAudioAnalyzer";
import { IMeetingConversationBody } from "../state/features/liveInterview/liveInterview.interface";
import { peerConfiguration } from "../peer-server.config";

type VideoMap = {
    [key: string]: HTMLVideoElement | null;
};

type PeerMap = {
    [key: string]: any;
};

export default function useWebRTC(roomId: string) {
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const peersRef = useRef<PeerMap>({});
    const userVideosRef = useRef<VideoMap>({});
    const streamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const urlRef = useRef<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const sofiaGainNodeRef = useRef<GainNode | null>(null);
    const mixedStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sofiaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const { meetingUser } = useSelector(selectMeetingState);
    const [users, setUsers] = useState<IMeetingParticipant[]>([]);
    const [userId, setUserId] = useState<string>('');
    const isCameraOnRef = useRef<boolean>(true);
    const isMicOnRef = useRef<boolean>(true);
    const isScreenSharingRef = useRef<boolean>(false);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const screenPeersRef = useRef<PeerMap>({});
    const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
    const [screenShareUser, setScreenShareUser] = useState<string | null>(null);
    const {
        isMeSpeaking,
        speakingUsers,
        createAudioAnalyser,
        startSpeakingDetection,
        removeAnalyser,
        cleanup: cleanupSpeakingDetection
    } = useVoiceAudioAnalyzer();

    const initAudioMixer = (micStream: MediaStream): MediaStream => {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const destination = audioContext.createMediaStreamDestination();

        const micSource = audioContext.createMediaStreamSource(micStream);
        const micGain = audioContext.createGain();
        micGain.gain.value = 1.0;
        micSource.connect(micGain);
        micGain.connect(destination);

        const sofiaGain = audioContext.createGain();
        sofiaGain.gain.value = 1.0;
        sofiaGain.connect(destination);
        sofiaGainNodeRef.current = sofiaGain;

        const videoTrack = micStream.getVideoTracks()[0];
        const mixedAudioTrack = destination.stream.getAudioTracks()[0];

        const mixedStream = new MediaStream();
        if (videoTrack) mixedStream.addTrack(videoTrack);
        if (mixedAudioTrack) mixedStream.addTrack(mixedAudioTrack);

        mixedStreamRef.current = mixedStream;
        return mixedStream;
    };

    const connectSofiaAudioToMixer = (audioElement: HTMLAudioElement) => {
        if (!audioContextRef.current || !sofiaGainNodeRef.current) {
            console.warn("Audio context not initialized");
            return;
        }

        try {
            const audioContext = audioContextRef.current;

            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            if (!sofiaSourceRef.current) {
                const sofiaSource = audioContext.createMediaElementSource(audioElement);
                sofiaSourceRef.current = sofiaSource;

                sofiaSource.connect(sofiaGainNodeRef.current);
                sofiaSource.connect(audioContext.destination);
            }
        } catch (error) {
            console.error("Error connecting Sofia audio to mixer:", error);
        }
    };

    const handleSpeakSofia = async (body: IMeetingConversationBody) => {
        const controller = new AbortController();
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL + 'company/live/interview/conversation/ai',
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    signal: controller.signal,
                }
            );
            let audio = audioRef.current;
            if (!audio) {
                audio = document.getElementById("sofia-audio") as HTMLAudioElement | null;
                if (!audio) throw new Error("No <audio id='sofia-audio'> element found.");
                audioRef.current = audio;
            }

            const mediaSource = new MediaSource();
            mediaSourceRef.current = mediaSource;
            const objectUrl = URL.createObjectURL(mediaSource);
            urlRef.current = objectUrl;
            audio.src = objectUrl;

            connectSofiaAudioToMixer(audio);

            const onAudioEnded = () => {
                audio!.removeEventListener("ended", onAudioEnded);
            };

            audio.addEventListener("ended", onAudioEnded);
            mediaSource.addEventListener("sourceopen", async () => {
                const mimeType = "audio/mpeg";
                const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

                const reader = response.body!.getReader();
                let playbackStarted = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    await new Promise<void>((resolve, reject) => {
                        const onUpdate = () => {
                            sourceBuffer.removeEventListener("updateend", onUpdate);
                            resolve();
                        };
                        const onError = (ev: any) => {
                            sourceBuffer.removeEventListener("error", onError);
                            reject(ev);
                        };
                        sourceBuffer.addEventListener("updateend", onUpdate, { once: true });
                        sourceBuffer.addEventListener("error", onError, { once: true });
                        sourceBuffer.appendBuffer(value);
                    });

                    if (!playbackStarted) {
                        playbackStarted = true;
                        audio!.play().catch((e) =>
                            console.warn("audio.play() error (likely autoplay block):", e)
                        );
                    }
                }

                if (mediaSource.readyState === "open") {
                    mediaSource.endOfStream();
                }
            });

            abortRef.current!.signal.addEventListener("abort", () => {
                if (audio && !audio.paused) {
                    audio.pause();
                }
            });

        } catch (e) {
            console.error("Error playing Sofia audio:", e);
        }
    };

    const endMeeting = () => {
        console.log('meeting-ended');
        socket.emit("end-meeting", roomId);
        leaveMeeting();
    };

    const leaveMeeting = () => {
        socket.disconnect();
        window.location.assign('/');
    };

    const toggleCamera = async () => {
        if (streamRef.current) {
            const videoTracks = streamRef.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            isCameraOnRef.current = !isCameraOnRef.current;
        }
        socket.emit('toggle-camera', roomId, {
            userId: userId,
            isCameraOff: !isCameraOnRef.current
        });
    };

    const toggleMic = () => {
        if (streamRef.current) {
            const audioTracks = streamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            isMicOnRef.current = !isMicOnRef.current;
        }
        socket.emit('toggle-mic', roomId, {
            userId: userId,
            isMuted: !isMicOnRef.current
        });
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharingRef.current) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });

                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                setScreenShareStream(screenStream);
                setScreenShareUser(userId);

                if (screenVideoRef.current) {
                    screenVideoRef.current.srcObject = screenStream;
                }

                isScreenSharingRef.current = true;

                socket.emit('screen-share-started', roomId, { userId });

                users.forEach((user) => {
                    if (peerRef.current && screenStream) {
                        const screenCall = peerRef.current.call(user.userId, screenStream, {
                            metadata: { type: 'screen-share', sharerId: userId }
                        });
                        if (screenCall) {
                            screenPeersRef.current[user.userId] = screenCall;
                        }
                    }
                });

                screenTrack.onended = () => {
                    stopScreenShare();
                };
            } else {
                stopScreenShare();
            }
        } catch (error) {
            console.error("Error toggling screen share:", error);
        }
    };

    const stopScreenShare = () => {
        if (!isScreenSharingRef.current) return;

        screenStreamRef.current?.getTracks().forEach(track => track.stop());

        Object.values(screenPeersRef.current).forEach((call: any) => {
            call.close();
        });
        screenPeersRef.current = {};

        socket.emit('screen-share-stopped', roomId, { userId });

        setScreenShareStream(null);
        setScreenShareUser(null);

        if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
        }

        isScreenSharingRef.current = false;
        screenStreamRef.current = null;
    };

    const addRemoteStream = (user: IMeetingParticipant, stream: MediaStream) => {
        if (userVideosRef.current[user.userId]) return;

        createAudioAnalyser(stream, user.userId, false);

        const video = document.createElement("video");
        const placeholderVideo = document.getElementById('placeholder-video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.style.borderRadius = "12px";
        video.style.backgroundColor = "#1f1f1f";
        video.style.transform = "scaleX(-1)";

        userVideosRef.current[user.userId] = video;

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.position = "relative";
        wrapper.style.border = "2px solid black";
        wrapper.style.borderRadius = "12px";
        wrapper.style.transition = "border-color 0.2s ease-in-out";
        wrapper.style.overflow = "hidden";
        wrapper.style.backgroundColor = "#1f1f1f";
        wrapper.className = "liveInterviewSession_fullHeight__OmPZ6 MuiBox-root css-0 user-video-" + user.userId;
        wrapper.setAttribute("data-user-id", user.userId);

        // Avatar overlay for when camera is off
        const avatarOverlay = document.createElement("div");
        avatarOverlay.className = "avatar-overlay";
        avatarOverlay.style.position = "absolute";
        avatarOverlay.style.top = "0";
        avatarOverlay.style.left = "0";
        avatarOverlay.style.width = "100%";
        avatarOverlay.style.height = "100%";
        avatarOverlay.style.display = user.isCameraOff ? "flex" : "none";
        avatarOverlay.style.justifyContent = "center";
        avatarOverlay.style.alignItems = "center";
        avatarOverlay.style.backgroundColor = "#1f1f1f";
        avatarOverlay.style.borderRadius = "12px";

        const avatarCircle = document.createElement("div");
        avatarCircle.style.width = "86px";
        avatarCircle.style.height = "86px";
        avatarCircle.style.borderRadius = "50%";
        avatarCircle.style.backgroundColor = "#1976d2";
        avatarCircle.style.display = "flex";
        avatarCircle.style.justifyContent = "center";
        avatarCircle.style.alignItems = "center";
        avatarCircle.style.fontSize = "36px";
        avatarCircle.style.fontWeight = "500";
        avatarCircle.style.color = "white";
        avatarCircle.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
        avatarCircle.textContent = (user.userName || "U").charAt(0).toUpperCase();
        avatarOverlay.appendChild(avatarCircle);

        const userLabel = document.createElement("div");
        userLabel.style.position = "absolute";
        userLabel.style.bottom = "12px";
        userLabel.style.left = "12px";
        userLabel.style.padding = "4px 12px";
        userLabel.style.borderRadius = "4px";
        userLabel.style.backgroundColor = "rgba(0,0,0,0.6)";
        userLabel.style.color = "white";
        userLabel.style.fontSize = "14px";
        userLabel.style.fontWeight = "500";
        userLabel.style.display = "flex";
        userLabel.style.alignItems = "center";
        userLabel.style.gap = "6px";
        userLabel.innerHTML = user.userName;

        if (user.isCameraOff) {
            video.style.display = "none";
        }

        wrapper.appendChild(video);
        wrapper.appendChild(avatarOverlay);
        wrapper.appendChild(userLabel);

        const container = document.getElementById("video-grid");
        container?.appendChild(wrapper);
        if (placeholderVideo) {
            placeholderVideo.innerHTML = user.userName;
        }
    };

    const callUser = (user: IMeetingParticipant, stream: MediaStream) => {
        try {
            if (!peerRef.current || !stream) return;

            const call = peerRef.current.call(user.userId, stream);
            if (!call) {
                console.error("Failed to create call to user:", user.userId);
                return;
            }

            call.on("stream", (remoteStream) => {
                addRemoteStream(user, remoteStream);
            });

            call.on("close", () => {
                if (userVideosRef.current[user.userId]) {
                    userVideosRef.current[user.userId]?.remove();
                    delete userVideosRef.current[user.userId];
                }
            });

            peersRef.current[user.userId] = call;
        } catch (error) {
            console.error("Error calling user:", error);
            alert("Error connecting to room. Please try again later.");
            leaveMeeting();
        }
    };

    useEffect(() => {
        if (!roomId) return;

        const start = async () => {
            const myUserIdRef = 10000 + Math.floor(Math.random() * 900000);
            const myUserId = myUserIdRef.toString();
            const meetingUserName = meetingUser?.name || "Guest - " + myUserId;
            setUserId(myUserId);
            let userStream: MediaStream;
            try {
                userStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            } catch {
                leaveMeeting();
                return;
            }

            streamRef.current = userStream;

            const mixedStream = initAudioMixer(userStream);
            const localAnalyser = createAudioAnalyser(userStream, myUserId, true);
            startSpeakingDetection(localAnalyser);

            if (myVideoRef.current) {
                myVideoRef.current.srcObject = userStream;
            }

            const peer = new Peer(myUserId, peerConfiguration);
            peerRef.current = peer;

            peer.on("open", (userId) => {
                socket.emit("join-room", roomId, {
                    userId,
                    userName: meetingUserName,
                    userRole: meetingUser?.role || 'member',
                    isMuted: false
                });
            });

            peer.on("call", (call) => {
                if (call.metadata?.type === 'screen-share') {
                    const incomingSharerUserId = call.metadata.sharerId;
                    call.answer();
                    call.on("stream", (remoteScreenStream) => {
                        setScreenShareStream(remoteScreenStream);
                        setScreenShareUser(incomingSharerUserId);
                    });
                    call.on("close", () => {
                        setScreenShareUser((currentSharerUserId) => {
                            if (currentSharerUserId === incomingSharerUserId) {
                                setScreenShareStream(null);
                                return null;
                            }
                            return currentSharerUserId;
                        });
                    });
                } else {
                    call.answer(mixedStream);
                    peersRef.current[call.peer] = call;
                }
            });

            socket.on("all-users", (existingUsers: IMeetingParticipant[]) => {
                setUsers(existingUsers);
                existingUsers.forEach((user) => {
                    callUser(user, mixedStream);
                });
            });

            socket.on("mic-toggled", (user: IMeetingParticipant) => {
                setUsers((prevUsers) =>
                    prevUsers.map((u) => (u.userId === user.userId ? { ...u, isMuted: user.isMuted } : u))
                );
            });

            socket.on("camera-toggled", (user: IMeetingParticipant) => {
                setUsers((prevUsers) =>
                    prevUsers.map((u) => (u.userId === user.userId ? { ...u, isCameraOff: user.isCameraOff } : u))
                );
                // Update the video wrapper to show/hide avatar
                const videoWrapper = document.querySelector(".user-video-" + user.userId);
                if (videoWrapper) {
                    const video = videoWrapper.querySelector("video");
                    const avatarOverlay = videoWrapper.querySelector(".avatar-overlay") as HTMLElement;
                    if (video && avatarOverlay) {
                        video.style.display = user.isCameraOff ? "none" : "block";
                        avatarOverlay.style.display = user.isCameraOff ? "flex" : "none";
                    }
                }
            });

            socket.on("user-connected", (user: IMeetingParticipant) => {
                setUsers((prev) => [...prev, user]);
                callUser(user, mixedStream);
            });

            socket.on("user-disconnected", (user: IMeetingParticipant) => {
                setUsers((prev) => prev.filter((u) => user.userId !== u.userId));
                if (peersRef.current[user.userId]) {
                    peersRef.current[user.userId].close();
                    delete peersRef.current[user.userId];
                }

                removeAnalyser(user.userId);

                if (userVideosRef.current[user.userId]) {
                    userVideosRef.current[user.userId]?.remove();
                    delete userVideosRef.current[user.userId];
                }

                const userVideoWrapper = document.querySelector(".user-video-" + user.userId);
                if (userVideoWrapper) {
                    userVideoWrapper.remove();
                }
            });

            socket.on("meeting-ended", () => {
                console.log('meeting-ended');
                leaveMeeting();
            });

            socket.on("screen-share-stopped", () => {
                setScreenShareStream(null);
                setScreenShareUser(null);
            });

            socket.on("force-stop-screen-share", (data: { odlSharerUserId: string }) => {
                if (data.odlSharerUserId === myUserId && isScreenSharingRef.current) {
                    screenStreamRef.current?.getTracks().forEach(track => track.stop());

                    Object.values(screenPeersRef.current).forEach((call: any) => {
                        call.close();
                    });
                    screenPeersRef.current = {};

                    isScreenSharingRef.current = false;
                    screenStreamRef.current = null;

                    setScreenShareStream(null);
                    setScreenShareUser(null);
                }
            });

            socket.on("new-user-needs-screen", (data: { odlSharerUserId: string, newUserId: string }) => {
                if (data.odlSharerUserId === myUserId && screenStreamRef.current && peerRef.current) {
                    const screenCall = peerRef.current.call(data.newUserId, screenStreamRef.current, {
                        metadata: { type: 'screen-share', sharerId: myUserId }
                    });
                    if (screenCall) {
                        screenPeersRef.current[data.newUserId] = screenCall;
                    }
                }
            });

            socket.on("current-screen-share", (data: { odlSharerUserId: string }) => {
                setScreenShareUser(data.odlSharerUserId);
            });
        };

        try {
            start();
        } catch (error) {
            console.error("Error starting the room:", error);
            alert("Can not access the room right now. Please try again later.");
            leaveMeeting();
        }

        return () => {
            socket.off("all-users");
            socket.off("user-connected");
            socket.off("user-disconnected");
            socket.off("screen-share-stopped");
            socket.off("force-stop-screen-share");
            socket.off("new-user-needs-screen");
            socket.off("current-screen-share");
            socket.off("camera-toggled");
            peerRef.current?.destroy();
            audioContextRef.current?.close();
            cleanupSpeakingDetection();
        };
    }, [roomId]);

    return {
        myVideoRef,
        screenVideoRef,
        users,
        userId,
        endMeeting,
        leaveMeeting,
        handleSpeakSofia,
        toggleCamera,
        toggleMic,
        toggleScreenShare,
        isCameraOn: isCameraOnRef.current,
        isMicOn: isMicOnRef.current,
        isScreenSharing: isScreenSharingRef.current,
        screenShareStream,
        screenShareUser,
        isMeSpeaking,
        speakingUsers
    };
}