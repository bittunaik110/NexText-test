
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { CallData } from "@/hooks/useCallWithWebRTC";

interface CallingModalProps {
  isOpen: boolean;
  call: CallData | null;
  duration: number;
  onEndCall: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isSpeakerOn: boolean;
  onSpeakerToggle: () => void;
  isInitiator?: boolean;
}

export function CallingModal({
  isOpen,
  call,
  duration,
  onEndCall,
  isMuted,
  onMuteToggle,
  isSpeakerOn,
  onSpeakerToggle,
  isInitiator = false,
}: CallingModalProps) {
  const [status, setStatus] = useState<string>("Contacting...");

  useEffect(() => {
    if (!call) return;

    if (call.status === "ringing") {
      setStatus("Ringing...");
    } else if (call.status === "connected") {
      setStatus("Connected");
    } else {
      setStatus("Contacting...");
    }
  }, [call?.status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen || !call) return null;

  const contactName = isInitiator ? call.recipientName : call.initiatorName;

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="max-w-full h-screen p-0 border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center justify-between h-full py-16 px-8">
          {/* Top section - Avatar and name */}
          <div className="flex flex-col items-center gap-6 flex-1 justify-center">
            <UserAvatar
              name={contactName}
              size="lg"
              className="w-32 h-32 ring-4 ring-white/20"
            />
            
            <div className="text-center">
              <h2 className="text-4xl font-semibold text-white mb-2">
                {contactName}
              </h2>
              <p className="text-xl text-gray-300">
                {call.status === "connected" ? formatDuration(duration) : status}
              </p>
            </div>
          </div>

          {/* Bottom section - Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* Speaker button */}
            <Button
              size="icon"
              className={`h-16 w-16 rounded-full ${
                isSpeakerOn
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={onSpeakerToggle}
            >
              {isSpeakerOn ? (
                <Volume2 className="h-7 w-7 text-white" />
              ) : (
                <VolumeX className="h-7 w-7 text-white" />
              )}
            </Button>

            {/* Mute button */}
            <Button
              size="icon"
              className={`h-16 w-16 rounded-full ${
                isMuted
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={onMuteToggle}
            >
              {isMuted ? (
                <MicOff className="h-7 w-7 text-white" />
              ) : (
                <Mic className="h-7 w-7 text-white" />
              )}
            </Button>

            {/* End call button */}
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
              onClick={onEndCall}
              data-testid="button-end-call"
            >
              <PhoneOff className="h-7 w-7 text-white" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
