import { useState, useCallback, useEffect, useRef } from "react";
import { database, storage } from "@/lib/firebase";
import { ref, set, update, get, query, orderByChild, limitToLast, onValue, off } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "./useSocket";
import { saveCall, updateCallStatus } from "@/lib/firebaseCallOps";
import type Peer from "peerjs";
import type { CallData as FirebaseCallData } from "@/lib/firebaseCallOps";

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
    if (!socket || !user?.uid) {
      console.log(`[CALL DEBUG] Cannot set up listener - socket: ${!!socket}, uid: ${user?.uid}`);
      return;
    }

    console.log(`[CALL DEBUG] ✓ Setting up callInitiated listener for user: ${user.uid}`);
    console.log(`[CALL DEBUG] Socket ID: ${socket.id}, Connected: ${socket.connected}`);

    const handleCallInitiated = (callData: CallData) => {
      console.log(`[CALL DEBUG] ✓✓ RECEIVED callInitiated event!`);
      console.log(`[CALL DEBUG] callData:`, JSON.stringify(callData));
      console.log(`[CALL DEBUG] Current user uid: ${user.uid}`);
      console.log(`[CALL DEBUG] Call recipient: ${callData.recipient}`);
      console.log(`[CALL DEBUG] Match: ${callData.recipient === user.uid}`);
      
      // Only show incoming call if this user is the recipient
      if (callData.recipient === user.uid) {
        console.log(`[CALL DEBUG] ✓✓✓ Call is for me! Showing notification with data:`, callData);
        setIncomingCall(callData);
      } else {
        console.log(`[CALL DEBUG] ✗ Call is not for me (${callData.recipient} !== ${user.uid})`);
      }
    };

    const handleCallEnded = () => {
      console.log("Call ended by other user");
      endCall();
    };

    const handleCallAnswered = (data: { callId: string; chatId: string }) => {
      console.log("[handleCallAnswered] 🎯 Initiator received callAnswered event from recipient", data);
      
      // Match the call by callId
      if (activeCall?.callId === data.callId) {
        console.log("[handleCallAnswered] ✓ Call ID matches - proceeding with WebRTC connection");
        
        // CRITICAL: NOW the initiator should call the recipient's PeerJS
        if (peerRef.current && mediaStreamRef.current && activeCall?.recipient) {
          console.log("[handleCallAnswered] 📞 Initiator: Sending peer call to recipient:", activeCall.recipient);
          try {
            const peerCall = peerRef.current.call(activeCall.recipient, mediaStreamRef.current);
            callConnectionRef.current = peerCall;
            console.log("[handleCallAnswered] ✓ Peer call sent, waiting for remote stream...");
            
            peerCall.on("stream", (remoteStream: MediaStream) => {
              console.log("[handleCallAnswered] 📡 Initiator: RECEIVED remote stream from recipient!");
              
              // Update call status to connected when stream arrives
              setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
              
              // Play remote audio
              const audioElement = new Audio();
              audioElement.srcObject = remoteStream;
              audioElement.autoplay = true;
              audioElement.play().catch(err => console.error("[handleCallAnswered] Audio play error:", err));
              console.log("[handleCallAnswered] ✓ Remote audio playing");
            });
            
            peerCall.on("error", (err: any) => {
              console.error("[handleCallAnswered] ✗ Peer call error:", err);
            });
            
            peerCall.on("close", () => {
              console.log("[handleCallAnswered] 🔌 Peer connection closed");
            });
          } catch (error) {
            console.error("[handleCallAnswered] ✗ Error initiating peer call:", error);
          }
        } else {
          console.error("[handleCallAnswered] ✗ Missing requirements for peer call:", {
            hasPeer: !!peerRef.current,
            hasStream: !!mediaStreamRef.current,
            recipientId: activeCall?.recipient
          });
        }
        
        // Persist to Firebase
        updateCallStatus(data.callId, "ongoing", { startTime: Date.now() }).catch(err => 
          console.error("[handleCallAnswered] Error updating call status to ongoing:", err)
        );
      } else {
        console.warn("[handleCallAnswered] ✗ Call ID mismatch:", { 
          expectedId: activeCall?.callId, 
          receivedId: data.callId 
        });
      }
    };

    socket.on("callInitiated", handleCallInitiated);
    socket.on("callEnded", handleCallEnded);
    socket.on("callAnswered", handleCallAnswered);

    console.log(`[CALL DEBUG] Listeners registered. Waiting for incoming calls...`);

    return () => {
      socket.off("callInitiated", handleCallInitiated);
      socket.off("callEnded", handleCallEnded);
      socket.off("callAnswered", handleCallAnswered);
    };
  }, [socket, user?.uid]);

  const initiateCall = useCallback(
    async (
      chatId: string,
      recipientId: string,
      recipientName: string,
      initiatorName: string,
      callType: "audio" | "video" = "audio"
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
        callType,
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
        callType: callType,
        createdAt: Date.now(),
      };

      try {
        console.log("[CALL INIT] Creating call with data:", callData);
        console.log("[CALL INIT] Recipient field value:", callData.recipient);
        
        // ✅ SET ACTIVE CALL IMMEDIATELY BEFORE ANY ASYNC OPERATIONS
        console.log("[CALL INIT] 🎬 SETTING activeCall state IMMEDIATELY:", callData);
        setActiveCall(callData);
        
        const callRef = ref(database, `calls/${chatId}/${callId}`);
        await set(callRef, callData);
        console.log("[CALL INIT] Firebase call saved successfully");

        // Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        console.log("Got local audio stream for initiator");

        // Start recording
        startRecording(stream);

        // Listen for incoming peer call (when recipient answers)
        peerRef.current.on("call", (incomingPeerCall: any) => {
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
        console.log("[CALL INIT] Updated status to ringing");
        setActiveCall(prev => prev ? { ...prev, status: "ringing" } : callData);
        console.log("[CALL INIT] ✅ activeCall state updated to ringing");
        
        // Persist call to Firebase using new utility
        try {
          const firebaseCallData: FirebaseCallData = {
            callId,
            callType,
            chatId,
            initiator: {
              odId: user.uid,
              username: initiatorName,
              avatar: user.photoURL || undefined,
            },
            recipient: {
              odId: recipientId,
              username: recipientName,
              avatar: undefined,
            },
            status: "initiating",
            createdAt: Date.now(),
          };
          await saveCall(firebaseCallData);
        } catch (error) {
          console.error("Error saving call to Firebase:", error);
        }

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
      console.log("[answerCall] 🎬 START - Recipient answering call", { callData, user: user?.uid, socket: !!socket, peer: !!peerRef.current });
      
      if (!user) {
        console.error("[answerCall] ✗ No user found");
        return;
      }
      if (!socket) {
        console.error("[answerCall] ✗ No socket connection");
        return;
      }
      if (!peerRef.current) {
        console.error("[answerCall] ✗ Peer not initialized");
        return;
      }

      try {
        console.log("[answerCall] ✓ All prerequisites met - Starting answer process");
        const callRef = ref(database, `calls/${callData.chatId}/${callData.callId}`);

        // ✅ FIX #1: Update UI state IMMEDIATELY so CallingModal shows (BEFORE media request)
        console.log("[answerCall] 📱 Setting activeCall state immediately");
        setIncomingCall(null);
        setActiveCall({ ...callData, status: "ringing" });

        // Request microphone (this can fail silently, so log carefully)
        console.log("[answerCall] 🎤 Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        console.log("[answerCall] ✓ Got local audio stream:", stream.getTracks().length, "tracks");

        // Start recording
        console.log("[answerCall] 🎙️ Starting recording...");
        startRecording(stream);
        console.log("[answerCall] ✓ Recording started");

        // Update Firebase status to connected
        console.log("[answerCall] 🔥 Updating Firebase call status to connected");
        await update(callRef, { status: "connected" });

        // Set up PeerJS listener for INCOMING peer call from initiator
        console.log("[answerCall] 👂 Setting up peer call listener");
        peerRef.current.on("call", (incomingPeerCall: any) => {
          console.log("[answerCall] 📞 RECEIVED incoming peer call from:", incomingPeerCall.peer);
          
          // Answer with our stream
          console.log("[answerCall] 🎙️ Answering peer call with local stream");
          incomingPeerCall.answer(stream);
          callConnectionRef.current = incomingPeerCall;

          // Listen for their stream
          incomingPeerCall.on("stream", (remoteStream: MediaStream) => {
            console.log("[answerCall] 📡 RECEIVED remote stream from initiator!");
            
            // Update to connected state when we get the remote stream
            setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
            
            // Play remote audio
            const audioElement = new Audio();
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.play().catch(err => console.error("[answerCall] Audio play error:", err));
            console.log("[answerCall] ✓ Remote audio playing");
          });

          incomingPeerCall.on("close", () => {
            console.log("[answerCall] 🔌 Peer call closed by initiator");
          });

          incomingPeerCall.on("error", (err: any) => {
            console.error("[answerCall] ✗ Peer call error:", err);
          });
        });

        // Persist to Firebase - update to ongoing status
        console.log("[answerCall] 💾 Updating Firebase call status to ongoing");
        try {
          await updateCallStatus(callData.callId, "ongoing", { startTime: Date.now() });
          console.log("[answerCall] ✓ Firebase call status updated to ongoing");
        } catch (error) {
          console.error("[answerCall] ✗ Error updating call status:", error);
        }

        // Emit socket event to tell initiator that we answered
        console.log("[answerCall] 📡 Emitting callAnswered event to initiator");
        socket.emit("callAnswered", { 
          callId: callData.callId, 
          chatId: callData.chatId 
        });
        console.log("[answerCall] ✅ Call answered successfully! Waiting for initiator's peer call...");
      } catch (error) {
        console.error("[answerCall] ✗✗✗ CRITICAL ERROR answering call:", error);
        console.error("[answerCall] Error details:", {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack
        });
        // Still keep the activeCall visible even if there's an error
        setIncomingCall(null);
        setActiveCall(callData);
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
        
        // Persist to Firebase
        try {
          await updateCallStatus(callData.callId, "declined");
        } catch (error) {
          console.error("Error updating declined call status to Firebase:", error);
        }
        
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

        // Persist to Firebase
        try {
          const endData: any = { endTime: Date.now(), duration };
          if (recordingData) {
            endData.callRecordURL = recordingData.url;
          }
          await updateCallStatus(activeCall.callId, "ended", endData);
        } catch (error) {
          console.error("Error updating end call status to Firebase:", error);
        }

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
