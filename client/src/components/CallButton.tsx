import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
import { useAuth } from "@/contexts/AuthContext";

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
  const { initiateCall } = useCallWithWebRTC();
  const { user } = useAuth();
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
      // Get current user's display name (you may want to get this from user profile)
      const initiatorName = user?.displayName || user?.email?.split('@')[0] || "User";

      console.log("CallButton: Initiating call with params:", {
        chatId,
        recipientId: contactId,
        recipientName: contactName,
        initiatorName: initiatorName
      });

      await initiateCall(chatId, contactId, contactName, initiatorName);
      toast({
        title: "Calling",
        description: `Calling ${contactName}...`,
      });
    } catch (error) {
      console.error("Error initiating call:", error);
      toast({
        title: "Error",
        description: "Failed to initiate call",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isOnline ? "Call" : "User is offline"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}