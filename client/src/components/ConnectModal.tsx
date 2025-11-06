import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PinInput from "./PinInput";
import { UserPlus } from "lucide-react";

interface ConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (pin: string) => void;
}

export default function ConnectModal({ open, onOpenChange, onConnect }: ConnectModalProps) {
  const [pin, setPin] = useState("");

  const handleConnect = () => {
    if (pin.length === 6) {
      onConnect(pin);
      setPin("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Connect with Friend
          </DialogTitle>
          <DialogDescription>
            Enter the 6-character PIN code shared by your friend
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <PinInput value={pin} onChange={setPin} />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={pin.length !== 6}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            data-testid="button-connect"
          >
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
