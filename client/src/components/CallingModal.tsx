import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { CallData } from "@/hooks/useCallWithWebRTC";
import { format } from "date-fns";

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
  const currentTime = format(new Date(), "HH:mm");

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

  if (!isOpen || !call) {
    console.log("[CallingModal] Not rendering: isOpen=", isOpen, "call=", call);
    return null;
  }

  console.log("[CallingModal] RENDERING FULL SCREEN PORTAL for call:", call?.recipientName);
  const contactName = isInitiator ? call.recipientName : call.initiatorName;

  const modalContent = (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/95">
      {/* Dark gradient background with blur effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background blur overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-slate-700/20 to-orange-500/30 blur-3xl" />
        </div>
      </div>

      {/* Content - Full Screen */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6">
        {/* Top - Time Display */}
        <div className="absolute top-8 left-0 right-0 flex justify-center">
          <span className="text-white text-lg font-semibold">{currentTime}</span>
        </div>

        {/* Center - Avatar & Caller Info */}
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          {/* Avatar */}
          <UserAvatar
            name={contactName}
            src=""
            size="xl"
            className="w-36 h-36 mb-4 ring-4 ring-white/30 shadow-2xl"
          />

          {/* Caller info */}
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-2">{contactName}</h2>
            <p className="text-xl text-gray-300">
              {call.status === "connected" ? formatDuration(duration) : status}
            </p>
          </div>
        </div>

        {/* Bottom - Action Buttons */}
        <div className="absolute bottom-20 left-0 right-0 flex gap-8 items-center justify-center">
          {/* Speaker button */}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-gray-700/80 hover:bg-gray-600/80 text-white transition-all duration-200 shadow-lg flex items-center justify-center"
            onClick={onSpeakerToggle}
            data-testid="button-speaker-call"
          >
            {isSpeakerOn ? (
              <Volume2 className="h-9 w-9" />
            ) : (
              <VolumeX className="h-9 w-9" />
            )}
          </Button>

          {/* Mute button */}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-gray-700/80 hover:bg-gray-600/80 text-white transition-all duration-200 shadow-lg flex items-center justify-center"
            onClick={onMuteToggle}
            data-testid="button-mute-call"
          >
            {isMuted ? (
              <MicOff className="h-9 w-9" />
            ) : (
              <Mic className="h-9 w-9" />
            )}
          </Button>

          {/* End call button - RED */}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            onClick={onEndCall}
            data-testid="button-end-call"
          >
            <PhoneOff className="h-9 w-9" />
          </Button>
        </div>

        {/* iPhone Home Indicator */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div className="w-32 h-1.5 bg-white/60 rounded-full" />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
