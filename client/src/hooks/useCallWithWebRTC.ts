import { useState, useCallback, useEffect, useRef } from "react";
import { database, storage } from "@/lib/firebase";
import { ref, set, update, get, query, orderByChild, limitToLast, onValue, off } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "./useSocket";
import type Peer from "peerjs";

export interface CallData {
  callId: string;
  chatId: string;
  initiator: string;
  recipient: string;
  initiatorName: string;
  recipientName: string;
  startTime: number;
  endTime?: number;
  duration: number;
  status: "initiated" | "ringing" | "connected" | "completed" | "missed" | "declined";
  callType: "audio" | "video";
  recording?: {
    url: string;
    duration: number;
    savedAt: number;
  };
  createdAt: number;
}

export function useCallWithWebRTC() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<any>(null);
  const callConnectionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize PeerJS
  useEffect(() => {
    if (!user?.uid) return;

    const initPeer = async () => {
      const PeerModule = await import("peerjs");
      const peer = new PeerModule.default(user.uid, {
        host: "peerjs-server.com",
        port: 443,
        secure: true,
      });

      peer.on("open", () => {
        console.log("PeerJS connected with ID:", peer.id);
      });

      peer.on("call", (call) => {
        console.log("Incoming call from:", call.peer);
        // Call will be answered through the modal
      });

      peerRef.current = peer;
    };

    initPeer();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [user?.uid]);

  // Listen for incoming calls via Socket.IO
  useEffect(() => {
    if (!socket) return;

    socket.on("callInitiated", (callData: CallData) => {
      console.log("Received call notification:", callData);
      setIncomingCall(callData);
    });

    socket.on("callEnded", () => {
      console.log("Call ended by other user");
      endCall();
    });

    return () => {
      socket.off("callInitiated");
      socket.off("callEnded");
    };
  }, [socket]);

  const initiateCall = useCallback(
    async (
      chatId: string,
      recipientId: string,
      recipientName: string,
      contactName: string
    ) => {
      if (!user || !socket) return;

      const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const callData: CallData = {
        callId,
        chatId,
        initiator: user.uid,
        recipient: recipientId,
        initiatorName: contactName,
        recipientName,
        startTime: Date.now(),
        duration: 0,
        status: "initiated",
        callType: "audio",
        createdAt: Date.now(),
      };

      try {
        const callRef = ref(database, `calls/${chatId}/${callId}`);
        await set(callRef, callData);
        setActiveCall(callData);

        // Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Start recording
        startRecording(stream);

        // Update status to ringing
        await update(callRef, { status: "ringing" });

        // Notify recipient via Socket.IO
        socket.emit("callInitiated", { ...callData, status: "ringing" });

        console.log("Call initiated:", callId);
        return callId;
      } catch (error) {
        console.error("Error initiating call:", error);
      }
    },
    [user, socket]
  );

  const answerCall = useCallback(
    async (callData: CallData) => {
      if (!user || !socket || !peerRef.current) return;

      try {
        const callRef = ref(database, `calls/${callData.chatId}/${callData.callId}`);

        // Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Start recording
        startRecording(stream);

        // Answer PeerJS call if exists
        const call = peerRef.current.call(callData.initiator, stream);
        call.on("stream", (remoteStream: MediaStream) => {
          console.log("Received remote stream");
          // Here you would pipe the audio to an <audio> element
        });

        // Update status to connected
        await update(callRef, { status: "connected" });

        setIncomingCall(null);
        setActiveCall({ ...callData, status: "connected" });

        console.log("Call answered");
      } catch (error) {
        console.error("Error answering call:", error);
      }
    },
    [user, socket]
  );

  const declineCall = useCallback(
    async (callData: CallData) => {
      try {
        const callRef = ref(database, `calls/${callData.chatId}/${callData.callId}`);
        await update(callRef, { status: "declined", endTime: Date.now() });
        setIncomingCall(null);
        console.log("Call declined");
      } catch (error) {
        console.error("Error declining call:", error);
      }
    },
    []
  );

  const startRecording = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    return new Promise<{ url: string; duration: number } | null>((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(recordedChunksRef.current, {
            type: "audio/webm",
          });
          const fileName = `recording-${Date.now()}.webm`;
          const fileRef = storageRef(storage, `call-recordings/${fileName}`);
          await uploadBytes(fileRef, audioBlob);
          const url = await getDownloadURL(fileRef);

          const duration = callDuration;
          resolve({ url, duration });
        } catch (error) {
          console.error("Error uploading recording:", error);
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  };

  const endCall = useCallback(
    async () => {
      if (!activeCall || !socket) return;

      try {
        // Stop recording and get URL
        const recordingData = await stopRecording();

        // Stop media stream
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        // Update call in database
        const callRef = ref(database, `calls/${activeCall.chatId}/${activeCall.callId}`);
        const duration = Math.floor((Date.now() - activeCall.startTime) / 1000);
        const updateData: any = {
          status: "completed",
          endTime: Date.now(),
          duration,
        };

        if (recordingData) {
          updateData.recording = {
            url: recordingData.url,
            duration: recordingData.duration,
            savedAt: Date.now(),
          };
        }

        await update(callRef, updateData);

        // Notify other user
        socket.emit("callEnded", { callId: activeCall.callId });

        setActiveCall(null);
        setCallDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);

        console.log("Call ended");
      } catch (error) {
        console.error("Error ending call:", error);
      }
    },
    [activeCall, socket, callDuration]
  );

  // Start call timer
  useEffect(() => {
    if (activeCall && activeCall.status === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [activeCall]);

  const switchCallType = useCallback((newType: "audio" | "video") => {
    setCallType(newType);
    if (newType === "video") {
      setIsVideoEnabled(true);
    } else {
      setIsVideoEnabled(false);
    }
  }, []);

  return {
    activeCall,
    incomingCall,
    setIncomingCall,
    callDuration,
    callType,
    switchCallType,
    isMuted,
    setIsMuted,
    isVideoEnabled,
    setIsVideoEnabled,
    isSpeakerOn,
    setIsSpeakerOn,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    mediaStream: mediaStreamRef.current,
  };
}
