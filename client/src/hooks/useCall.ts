import { useState, useCallback, useEffect, useRef } from "react";
import { database, storage } from "@/lib/firebase";
import { ref, set, update, get } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";

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

export function useCall() {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const initiateCall = useCallback(
    async (
      chatId: string,
      recipientId: string,
      recipientName: string,
      contactName: string
    ) => {
      if (!user) return;

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
        
        // Update status to ringing
        await update(callRef, { status: "ringing" });
        
        console.log("Call initiated:", callId);
        return callId;
      } catch (error) {
        console.error("Error initiating call:", error);
      }
    },
    [user]
  );

  const answerCall = useCallback(
    async (callData: CallData) => {
      if (!user) return;

      try {
        const callRef = ref(database, `calls/${callData.chatId}/${callData.callId}`);
        await update(callRef, { status: "connected" });
        
        // Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        setIncomingCall(null);
        setActiveCall({ ...callData, status: "connected" });
        
        console.log("Call answered");
      } catch (error) {
        console.error("Error answering call:", error);
      }
    },
    [user]
  );

  const declineCall = useCallback(async (callData: CallData) => {
    try {
      const callRef = ref(database, `calls/${callData.chatId}/${callData.callId}`);
      await update(callRef, { status: "declined", endTime: Date.now() });
      setIncomingCall(null);
      console.log("Call declined");
    } catch (error) {
      console.error("Error declining call:", error);
    }
  }, []);

  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      const callRef = ref(database, `calls/${activeCall.chatId}/${activeCall.callId}`);
      const duration = Math.floor((Date.now() - activeCall.startTime) / 1000);
      await update(callRef, {
        status: "completed",
        endTime: Date.now(),
        duration,
      });

      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      setActiveCall(null);
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);

      console.log("Call ended");
    } catch (error) {
      console.error("Error ending call:", error);
    }
  }, [activeCall]);

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

  // Listen for incoming calls
  useEffect(() => {
    if (!user?.uid) return;

    const listener = async () => {
      // This would be set up through Socket.IO or Firebase listeners in production
      console.log("Listening for incoming calls");
    };

    listener();
  }, [user?.uid]);

  return {
    activeCall,
    incomingCall,
    setIncomingCall,
    callDuration,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    mediaStream: mediaStreamRef.current,
  };
}
