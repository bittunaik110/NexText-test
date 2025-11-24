import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Phone } from "lucide-react";
import { CallData } from "@/hooks/useCall";

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
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md border-0 p-0 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <UserAvatar
            name={call?.initiatorName || "Contact"}
            size="lg"
            className="w-24 h-24 mb-6"
          />
          
          <h2 className="text-2xl font-semibold mb-2">{call?.initiatorName}</h2>
          <p className="text-muted-foreground mb-8">is calling...</p>

          <div className="flex gap-4">
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
              onClick={onAnswer}
              data-testid="button-answer-call"
            >
              <Phone className="h-6 w-6" />
            </Button>
            
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
              onClick={onDecline}
              data-testid="button-decline-call"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
