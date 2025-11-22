import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PinInput from "./PinInput";
import { UserPlus, Loader2 } from "lucide-react";
import { usersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: () => void;
}

export default function ConnectModal({ open, onOpenChange, onConnect }: ConnectModalProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 6-character PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { usersApi, chatsApi } = await import("@/lib/api");
      const response = await usersApi.addContactByPin(pin);
      
      // Create a chat with the contact - this is the key step!
      await chatsApi.create(response.contact.id);
      
      toast({
        title: "Contact Added",
        description: `${response.contact.displayName} has been added to your contacts`,
      });
      
      setPin("");
      onOpenChange(false);
      onConnect?.();
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast({
        title: "Failed to Add Contact",
        description: error.message || "User not found or already added",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setPin("");
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            onClick={() => handleOpenChange(false)}
            className="flex-1"
            disabled={isLoading}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={pin.length !== 6 || isLoading}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            data-testid="button-connect"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
