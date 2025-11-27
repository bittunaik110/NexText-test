import { useState, useEffect } from "react";
import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
import { CallNotificationModal } from "./CallNotificationModal";
import { CallEndedNotificationModal } from "./CallEndedNotificationModal";
import { CallingModal } from "./CallingModal";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/contexts/AuthContext";

export function CallManager() {
  console.log("[CallManager] 🔧 COMPONENT MOUNTED/RENDERED");
  
  const {
    activeCall,
    incomingCall,
    setIncomingCall,
    callDuration,
    isMuted,
    setIsMuted,
    isSpeakerOn,
    setIsSpeakerOn,
    answerCall,
    declineCall,
    endCall,
  } = useCallWithWebRTC();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [showCallEndedModal, setShowCallEndedModal] = useState(false);
  const [endedCallerName, setEndedCallerName] = useState("");

  // Debug: Log activeCall state changes
  useEffect(() => {
    console.log("[CallManager] 📞 activeCall state changed:", {
      isOpen: !!activeCall,
      callId: activeCall?.callId,
      status: activeCall?.status,
      initiator: activeCall?.initiator,
      recipient: activeCall?.recipient,
      shouldShowModal: !!activeCall,
    });
  }, [activeCall]);

  // Listen for call ended event from other user
  useEffect(() => {
    if (!socket) return;

    const handleCallEnded = () => {
      console.log("CallManager: Received call ended notification from other user");
      const contactName = activeCall?.recipientName || incomingCall?.initiatorName || "Contact";
      setEndedCallerName(contactName);
      setShowCallEndedModal(true);
      
      // Clean up the ended call
      if (activeCall) {
        setIncomingCall(null);
      }
    };

    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, activeCall, incomingCall]);

  const isInitiator = activeCall?.initiator === user?.uid;

  return (
    <>
      <CallingModal
        isOpen={!!activeCall}
        call={activeCall}
        duration={callDuration}
        onEndCall={endCall}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        isSpeakerOn={isSpeakerOn}
        onSpeakerToggle={() => setIsSpeakerOn(!isSpeakerOn)}
        isInitiator={isInitiator}
      />
      <CallNotificationModal
        isOpen={!!incomingCall}
        call={incomingCall}
        onAnswer={() => incomingCall && answerCall(incomingCall)}
        onDecline={() => incomingCall && declineCall(incomingCall)}
      />
      <CallEndedNotificationModal
        isOpen={showCallEndedModal}
        callerName={endedCallerName}
        onClose={() => setShowCallEndedModal(false)}
      />
    </>
  );
}
