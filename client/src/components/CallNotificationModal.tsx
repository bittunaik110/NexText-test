import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Mic, Volume2, Signal, Wifi, Battery } from "lucide-react";
import { CallData } from "@/hooks/useCall";
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

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm border-0 p-0 overflow-hidden rounded-3xl aspect-[9/16] h-screen max-h-screen">
        {/* iPhone-style Status Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 pt-4 z-20 bg-gradient-to-b from-black/40 to-transparent">
          <span className="text-white text-sm font-semibold">{currentTime}</span>
          <div className="flex gap-1 items-center">
            <Signal className="h-3.5 w-3.5 text-white" />
            <Wifi className="h-3.5 w-3.5 text-white" />
            <Battery className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Dark gradient background with blur effect */}
        <div className="flex flex-col h-full relative bg-gradient-to-b from-slate-950 via-slate-800 to-slate-900 overflow-hidden">
          {/* Background blur overlay - mimics blurred background */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-slate-700/20 to-orange-500/30 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-6">
            {/* Avatar */}
            <UserAvatar
              name={call?.initiatorName || "Contact"}
              src=""
              size="xl"
              className="w-32 h-32 mb-6 ring-4 ring-white/30 shadow-lg"
            />

            {/* Caller info */}
            <h2 className="text-4xl font-bold text-white mb-1">{call?.initiatorName}</h2>
            <p className="text-gray-300 text-base mb-20">Contacting...</p>

            {/* Action buttons */}
            <div className="flex gap-6 items-center justify-center mb-20">
              {/* Mute/Speaker button */}
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16 rounded-full bg-gray-700/80 hover:bg-gray-600/80 text-white transition-all duration-200 shadow-lg"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="button-mute-call"
              >
                {isMuted ? (
                  <Mic className="h-8 w-8" />
                ) : (
                  <Volume2 className="h-8 w-8" />
                )}
              </Button>

              {/* Microphone button */}
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16 rounded-full bg-gray-700/80 hover:bg-gray-600/80 text-white transition-all duration-200 shadow-lg"
                onClick={onAnswer}
                data-testid="button-answer-call"
              >
                <Mic className="h-8 w-8" />
              </Button>

              {/* Hand up / Decline button - RED */}
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={onDecline}
                data-testid="button-handup-call"
              >
                <PhoneOff className="h-8 w-8" />
              </Button>
            </div>
          </div>

          {/* iPhone Home Indicator */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3 z-20">
            <div className="w-32 h-1 bg-white/80 rounded-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
