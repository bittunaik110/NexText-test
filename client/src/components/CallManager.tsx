import { useState, useEffect } from "react";
import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
import { CallNotificationModal } from "./CallNotificationModal";
import { CallEndedNotificationModal } from "./CallEndedNotificationModal";
import { FloatingCallWindow } from "./FloatingCallWindow";
import { useSocket } from "@/hooks/useSocket";

export function CallManager() {
  const {
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
      <FloatingCallWindow
        isOpen={!!activeCall}
        call={activeCall}
        duration={callDuration}
        onEndCall={endCall}
        callType={callType}
        onSwitchCallType={switchCallType}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        isVideoEnabled={isVideoEnabled}
        onVideoToggle={() => setIsVideoEnabled(!isVideoEnabled)}
        isSpeakerOn={isSpeakerOn}
        onSpeakerToggle={() => setIsSpeakerOn(!isSpeakerOn)}
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
