import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Mic, MicOff } from "lucide-react";
import { CallData } from "@/hooks/useCall";

interface CallingModalProps {
  isOpen: boolean;
  call: CallData | null;
  duration: number;
  onEndCall: () => void;
}

export function CallingModal({
  isOpen,
  call,
  duration,
  onEndCall,
}: CallingModalProps) {
  const [isMuted, setIsMuted] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md border-0 p-0 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-primary/10 to-accent/10">
          <UserAvatar
            name={call?.recipientName || "Contact"}
            size="lg"
            className="w-24 h-24 mb-6"
          />
          
          <h2 className="text-2xl font-semibold mb-2">{call?.recipientName}</h2>
          <p className="text-muted-foreground mb-8 font-mono">
            {formatDuration(duration)}
          </p>

          <div className="flex gap-4 mb-4">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-full hover:bg-muted"
              onClick={() => setIsMuted(!isMuted)}
              data-testid="button-toggle-mute"
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>

          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
            onClick={onEndCall}
            data-testid="button-end-call"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
