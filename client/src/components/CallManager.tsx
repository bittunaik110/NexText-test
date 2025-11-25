import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
import { CallingModal } from "./CallingModal";
import { CallNotificationModal } from "./CallNotificationModal";

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
    </>
  );
}
