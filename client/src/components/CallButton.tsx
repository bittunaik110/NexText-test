import { Button } from "@/components/ui/button";
import { Phone, Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
import { useAuth } from "@/contexts/AuthContext";
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
  const { initiateCall } = useCallWithWebRTC();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleVoiceCall = async () => {
    await initiateCallHandler("audio");
  };

  const handleVideoCall = async () => {
    await initiateCallHandler("video");
  };

  const initiateCallHandler = async (callType: "audio" | "video") => {
    if (!isOnline) {
      toast({
        title: "User Offline",
        description: `${contactName} is currently offline`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user's display name
      const initiatorName = user?.displayName || user?.email?.split('@')[0] || "User";

      // Extract recipient ID from contactId or chatId if contactId is empty
      let recipientId = contactId;
      if (!recipientId && chatId) {
        // Chat ID format: userId1_userId2
        const parts = chatId.split('_');
        recipientId = parts[0] === user?.uid ? parts[1] : parts[0];
      }

      console.log("CallButton: Initiating call with params:", {
        chatId,
        recipientId: recipientId,
        recipientName: contactName,
        initiatorName: initiatorName,
        callType: callType,
        currentUserId: user?.uid
      });

      if (!recipientId) {
        throw new Error("Could not determine recipient ID");
      }

      await initiateCall(chatId, recipientId, contactName, initiatorName, callType);
      toast({
        title: callType === "video" ? "Video Calling" : "Calling",
        description: `${callType === "video" ? "Starting video call with" : "Calling"} ${contactName}...`,
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
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleVoiceCall}
              disabled={!isOnline}
              title={isOnline ? "Voice Call" : "User is offline"}
              data-testid="button-voice-call"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isOnline ? "Voice Call" : "User is offline"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleVideoCall}
              disabled={!isOnline}
              title={isOnline ? "Video Call" : "User is offline"}
              data-testid="button-video-call"
            >
              <Video className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isOnline ? "Video Call" : "User is offline"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}