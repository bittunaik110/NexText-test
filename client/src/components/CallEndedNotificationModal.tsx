import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PhoneOff } from "lucide-react";

interface CallEndedNotificationModalProps {
  isOpen: boolean;
  callerName?: string;
  onClose: () => void;
}

export function CallEndedNotificationModal({
  isOpen,
  callerName = "Contact",
  onClose,
}: CallEndedNotificationModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 p-0 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-red-500/10 to-orange-500/10">
          <div className="mb-4 p-3 bg-red-100 rounded-full">
            <PhoneOff className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">Call Ended</h2>
          <p className="text-muted-foreground text-center">
            Your call with {callerName} has ended
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
