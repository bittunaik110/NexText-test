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

      peer.on("call", (incomingPeerCall: any) => {
        console.log("Incoming call from:", incomingPeerCall.peer);
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
    if (!socket || !user?.uid) return;

    console.log(`[CALL DEBUG] Setting up callInitiated listener for user: ${user.uid}`);

    socket.on("callInitiated", (callData: CallData) => {
      console.log(`[CALL DEBUG] Received callInitiated event`);
      console.log(`[CALL DEBUG] callData:`, JSON.stringify(callData));
      console.log(`[CALL DEBUG] Current user uid: ${user.uid}`);
      console.log(`[CALL DEBUG] Call recipient: ${callData.recipient}`);
      console.log(`[CALL DEBUG] Match: ${callData.recipient === user.uid}`);
      
      // Only show incoming call if this user is the recipient
      if (callData.recipient === user.uid) {
        console.log(`[CALL DEBUG] ✓ Call is for me, showing notification`);
        setIncomingCall(callData);
      } else {
        console.log(`[CALL DEBUG] ✗ Call is not for me (${callData.recipient} !== ${user.uid})`);
      }
    });

    socket.on("callEnded", () => {
      console.log("Call ended by other user");
      endCall();
    });

    socket.on("callAnswered", (data: { callId: string; chatId: string }) => {
      console.log("Call was answered:", data);
      // Update call status when recipient answers
      if (activeCall?.callId === data.callId) {
        setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
      }
    });

    return () => {
      socket.off("callInitiated");
      socket.off("callEnded");
      socket.off("callAnswered");
    };
  }, [socket, user?.uid, activeCall?.callId]);

  const initiateCall = useCallback(
    async (
      chatId: string,
      recipientId: string,
      recipientName: string,
      initiatorName: string
    ) => {
      if (!user || !socket || !peerRef.current) {
        console.error("Cannot initiate call: missing requirements", {
          hasUser: !!user,
          hasSocket: !!socket,
          hasPeer: !!peerRef.current
        });
        return;
      }

      const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log("[CALL INIT] Parameters received:", {
        chatId,
        recipientId,
        recipientName,
        initiatorName,
        currentUserId: user.uid
      });

      if (!recipientId) {
        console.error("[CALL INIT] ERROR: recipientId is empty!");
        throw new Error("Recipient ID is required to initiate a call");
      }

      const callData: CallData = {
        callId,
        chatId,
        initiator: user.uid,
        recipient: recipientId,
        initiatorName: initiatorName,
        recipientName: recipientName,
        startTime: Date.now(),
        duration: 0,
        status: "initiated",
        callType: "audio",
        createdAt: Date.now(),
      };

      try {
        console.log("[CALL INIT] Creating call with data:", callData);
        console.log("[CALL INIT] Recipient field value:", callData.recipient);
        const callRef = ref(database, `calls/${chatId}/${callId}`);
        await set(callRef, callData);
        setActiveCall(callData);

        // Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        console.log("Got local audio stream for initiator");

        // Start recording
        startRecording(stream);

        // Listen for incoming peer call (when recipient answers)
        peerRef.current.on("call", (incomingPeerCall) => {
          console.log("Received peer call from recipient");
          
          // Answer with our stream
          incomingPeerCall.answer(stream);
          callConnectionRef.current = incomingPeerCall;

          // Listen for their stream
          incomingPeerCall.on("stream", (remoteStream: MediaStream) => {
            console.log("Received remote audio stream from recipient");
            
            // Play remote audio
            const audioElement = new Audio();
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.play().catch(err => console.error("Audio play error:", err));

            // Update call status to connected
            update(callRef, { status: "connected" }).then(() => {
              setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
            });
          });

          incomingPeerCall.on("close", () => {
            console.log("Peer call closed by recipient");
          });

          incomingPeerCall.on("error", (err: any) => {
            console.error("Peer call error:", err);
          });
        });

        // Update status to ringing
        await update(callRef, { status: "ringing" });

        // Make sure we're in the chat room
        socket.emit("join-chat", chatId);

        // Notify recipient via Socket.IO
        const notificationData = { ...callData, status: "ringing" };
        console.log("[CALL DEBUG] About to emit callInitiated");
        console.log("[CALL DEBUG] notificationData:", JSON.stringify(notificationData));
        console.log("[CALL DEBUG] Recipient in notification:", notificationData.recipient);
        console.log("[CALL DEBUG] Socket connected:", socket.connected);
        console.log("[CALL DEBUG] Chat room:", chatId);
        
        if (!notificationData.recipient) {
          console.error("[CALL DEBUG] CRITICAL: Recipient is empty in notification data!");
          throw new Error("Cannot send call notification without recipient ID");
        }
        
        socket.emit("callInitiated", notificationData);
        console.log("[CALL DEBUG] Emitted callInitiated event to room:", chatId);

        console.log("Call initiated successfully:", callId);
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
        console.log("Answering call from:", callData.initiator);
        const callRef = ref(database, `calls/${callData.chatId}/${callData.callId}`);

        // Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        console.log("Got local audio stream");

        // Start recording
        startRecording(stream);

        // Call the initiator with our stream
        const peerCall = peerRef.current.call(callData.initiator, stream);
        callConnectionRef.current = peerCall;
        
        console.log("Calling peer:", callData.initiator);

        // Listen for remote stream
        peerCall.on("stream", (remoteStream: MediaStream) => {
          console.log("Received remote audio stream");
          
          // Play remote audio
          const audioElement = new Audio();
          audioElement.srcObject = remoteStream;
          audioElement.autoplay = true;
          audioElement.play().catch(err => console.error("Audio play error:", err));
        });

        peerCall.on("close", () => {
          console.log("Peer call closed");
        });

        peerCall.on("error", (err: any) => {
          console.error("Peer call error:", err);
        });

        // Update status to connected
        await update(callRef, { status: "connected" });

        // Emit call answered event
        socket.emit("callAnswered", { 
          callId: callData.callId, 
          chatId: callData.chatId 
        });

        setIncomingCall(null);
        setActiveCall({ ...callData, status: "connected" });

        console.log("Call answered successfully");
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
