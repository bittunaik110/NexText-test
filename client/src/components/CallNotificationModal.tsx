import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Phone, Mic, Volume2 } from "lucide-react";
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
      <DialogContent className="max-w-md border-0 p-0 overflow-hidden rounded-3xl">
        {/* Time display */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 pt-6 z-10">
          <span className="text-white text-sm font-semibold">{currentTime}</span>
        </div>

        {/* Dark gradient background with blur effect */}
        <div className="flex flex-col items-center justify-center min-h-screen relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Background blur overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-red-500/20 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-6">
            {/* Avatar */}
            <UserAvatar
              name={call?.initiatorName || "Contact"}
              src=""
              size="xl"
              className="w-28 h-28 mb-8 ring-4 ring-white/20"
            />

            {/* Caller info */}
            <h2 className="text-3xl font-bold text-white mb-2">{call?.initiatorName}</h2>
            <p className="text-gray-300 text-base mb-16">Contacting...</p>

            {/* Action buttons */}
            <div className="flex gap-8 items-center justify-center mb-12">
              {/* Mute button */}
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16 rounded-full bg-gray-600/60 hover:bg-gray-700/60 text-white transition-all"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="button-mute-call"
              >
                {isMuted ? (
                  <Mic className="h-7 w-7" />
                ) : (
                  <Volume2 className="h-7 w-7" />
                )}
              </Button>

              {/* Hand up / Decline button */}
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16 rounded-full bg-gray-600/60 hover:bg-gray-700/60 text-white transition-all"
                onClick={onDecline}
                data-testid="button-handup-call"
              >
                <PhoneOff className="h-7 w-7" />
              </Button>

              {/* Answer button - Green */}
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all"
                onClick={onAnswer}
                data-testid="button-answer-call"
              >
                <Phone className="h-7 w-7" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
