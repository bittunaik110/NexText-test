import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Mic, Volume2, Phone } from "lucide-react";
import { CallData } from "@/hooks/useCallWithWebRTC";
import { useState } from "react";
import { format } from "date-fns";

interface CallNotificationModalProps {
  isOpen: boolean;
  call: CallData | null;
  onAnswer: () => void;
  onDecline: () => void;
}

export function CallNotificationModal({
  isOpen,
  call,
  onAnswer,
  onDecline,
}: CallNotificationModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const currentTime = format(new Date(), "HH:mm");

  if (!isOpen || !call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
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
            name={call?.initiatorName || "Contact"}
            src=""
            size="xl"
            className="w-36 h-36 mb-4 ring-4 ring-white/30 shadow-2xl"
          />

          {/* Caller info */}
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-2">{call?.initiatorName}</h2>
            <p className="text-xl text-gray-300">Contacting...</p>
          </div>
        </div>

        {/* Bottom - Action Buttons */}
        <div className="absolute bottom-20 left-0 right-0 flex gap-8 items-center justify-center">
          {/* Mute Button */}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-gray-700/80 hover:bg-gray-600/80 text-white transition-all duration-200 shadow-lg flex items-center justify-center"
            onClick={() => setIsMuted(!isMuted)}
            data-testid="button-mute-call"
          >
            {isMuted ? (
              <Mic className="h-9 w-9" />
            ) : (
              <Volume2 className="h-9 w-9" />
            )}
          </Button>

          {/* Decline/Hang Up Button - RED */}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            onClick={onDecline}
            data-testid="button-handup-call"
          >
            <PhoneOff className="h-9 w-9" />
          </Button>

          {/* Answer/Accept Button - GREEN */}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            onClick={onAnswer}
            data-testid="button-answer-call"
          >
            <Phone className="h-9 w-9" />
          </Button>
        </div>

        {/* iPhone Home Indicator */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div className="w-32 h-1.5 bg-white/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}
