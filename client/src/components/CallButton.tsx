import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useCall } from "@/hooks/useCall";
import { useToast } from "@/hooks/use-toast";

interface CallButtonProps {
  contactId: string;
  contactName: string;
  chatId: string;
  currentUserName: string;
  isOnline?: boolean;
}

export function CallButton({
  contactId,
  contactName,
  chatId,
  currentUserName,
  isOnline,
}: CallButtonProps) {
  const { initiateCall } = useCall();
  const { toast } = useToast();

  const handleCallClick = async () => {
    if (!isOnline) {
      toast({
        title: "User Offline",
        description: `${contactName} is currently offline`,
        variant: "destructive",
      });
      return;
    }

    try {
      await initiateCall(chatId, contactId, contactName, currentUserName);
      toast({
        title: "Calling",
        description: `Calling ${contactName}...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate call",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleCallClick}
      disabled={!isOnline}
      title={isOnline ? "Call" : "User is offline"}
      data-testid="button-call-contact"
    >
      <Phone className="h-5 w-5" />
    </Button>
  );
}
