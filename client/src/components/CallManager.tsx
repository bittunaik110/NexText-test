import { useState, useEffect } from "react";
import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
import { CallingModal } from "./CallingModal";
import { CallNotificationModal } from "./CallNotificationModal";
import { CallEndedNotificationModal } from "./CallEndedNotificationModal";
import { useSocket } from "@/hooks/useSocket";

export function CallManager() {
  const {
    activeCall,
    incomingCall,
    setIncomingCall,
    callDuration,
    answerCall,
    declineCall,
    endCall,
  } = useCallWithWebRTC();
  const { socket } = useSocket();
  const [showCallEndedModal, setShowCallEndedModal] = useState(false);
  const [endedCallerName, setEndedCallerName] = useState("");

  // Listen for call ended event from other user
  useEffect(() => {
    if (!socket) return;

    socket.on("callEnded", () => {
      console.log("Received call ended notification from other user");
      const contactName = activeCall?.recipientName || incomingCall?.initiatorName || "Contact";
      setEndedCallerName(contactName);
      setShowCallEndedModal(true);
    });

    return () => {
      socket.off("callEnded");
    };
  }, [socket, activeCall?.recipientName, incomingCall?.initiatorName]);

  return (
    <>
      <CallingModal
        isOpen={!!activeCall}
        call={activeCall}
        duration={callDuration}
        onEndCall={endCall}
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
