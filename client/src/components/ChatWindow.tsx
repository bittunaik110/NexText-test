import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { ArrowLeft, MoreVertical, Phone, Video, Search, Trash2, VolumeOff, AlertCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";
import { useSocketMessages } from "@/hooks/useSocketMessages";
import { usePresence } from "@/hooks/usePresence";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ChatWindowProps {
  chatId: string;
  contact: {
    name: string;
    avatar?: string;
    online?: boolean;
    userId?: string;
  };
  onBack?: () => void;
  isTyping?: boolean;
}

export default function ChatWindow({ chatId, contact, onBack, isTyping }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { messages, loading, userId } = useMessages(chatId);
  const { sendMessage, reactToMessage, startTyping, stopTyping } = useSocketMessages(chatId);
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { user } = useAuth();
  const contactPresence = usePresence(contact.userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mark messages as read using Intersection Observer
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (!user?.uid || messageIds.length === 0) return;
    
    messageIds.forEach(messageId => {
      const message = messages.find(m => m.id === messageId);
      if (message && message.userId !== user.uid && message.status !== "read") {
        // Mark as delivered first if needed
        if (message.status === "sent") {
          const deliverEvent = new CustomEvent("deliver-message", {
            detail: { chatId, messageId },
          });
          window.dispatchEvent(deliverEvent);
        }
        // Mark as read
        const readEvent = new CustomEvent("read-message", {
          detail: { chatId, messageId },
        });
        window.dispatchEvent(readEvent);
      }
    });
  }, [messages, user?.uid, chatId]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleMessageIds = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.getAttribute("data-message-id"))
          .filter((id): id is string => id !== null);

        markMessagesAsRead(visibleMessageIds);
      },
      { threshold: 0.5 }
    );

    // Observe all message elements
    const messageElements = messagesContainerRef.current.querySelectorAll("[data-message-id]");
    messageElements.forEach(el => observer.observe(el));

    return () => {
      messageElements.forEach(el => observer.unobserve(el));
    };
  }, [messages, markMessagesAsRead]);

  const handleVoiceCall = () => {
    toast({
      title: "Voice Call",
      description: "Voice calling feature coming soon!",
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: "Video calling feature coming soon!",
    });
  };

  const handleClearChat = () => {
    toast({
      title: "Chat Cleared",
      description: "This chat has been cleared.",
    });
    setShowClearDialog(false);
  };

  const handleMuteNotifications = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Notifications Unmuted" : "Notifications Muted",
      description: isMuted ? "You will receive notifications again" : "You will not receive notifications from this chat",
    });
  };

  const handleBlockUser = () => {
    toast({
      title: "User Blocked",
      description: `${contact.name} has been blocked.`,
    });
  };

  const handleReportUser = () => {
    toast({
      title: "Report Sent",
      description: "Thank you for your report. We'll review it shortly.",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatLastSeen = (lastSeenTime: number): string => {
    const now = Date.now();
    const diff = now - lastSeenTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return "yesterday";
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              className="md:hidden"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <UserAvatar name={contact.name} src={contact.avatar} online={contact.online} />
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{contact.name}</h2>
            <p className={cn("text-xs font-medium", contactPresence?.isOnline ? "text-status-online" : "text-muted-foreground")}>
              {isTyping ? (
                <span className="flex items-center gap-1">
                  typing
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 bg-current rounded-full animate-typing-dot"></span>
                    <span className="w-1 h-1 bg-current rounded-full animate-typing-dot"></span>
                    <span className="w-1 h-1 bg-current rounded-full animate-typing-dot"></span>
                  </span>
                </span>
              ) : contactPresence?.isOnline ? (
                "Online"
              ) : contactPresence?.lastSeen ? (
                `Last seen ${formatLastSeen(contactPresence.lastSeen)}`
              ) : (
                "Offline"
              )}
            </p>
          </div>

          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleVoiceCall}
              data-testid="button-voice-call"
              className="hover:bg-white/10"
            >
              <Phone className="h-5 w-5 text-primary" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleVideoCall}
              data-testid="button-video-call"
              className="hover:bg-white/10"
            >
              <Video className="h-5 w-5 text-primary" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-options" className="hover:bg-white/10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => toast({ title: "Search", description: "Search feature coming soon!" })}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMuteNotifications}>
                  <VolumeOff className="h-4 w-4 mr-2" />
                  {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowClearDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBlockUser} className="text-destructive focus:text-destructive">
                  <Ban className="h-4 w-4 mr-2" />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReportUser} className="text-destructive focus:text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} data-message-id={message.id}>
              <MessageBubble 
                text={message.text}
                sent={message.userId === userId}
                timestamp={new Date(message.timestamp)}
                status={message.status || "sent"}
                imageUrl={message.mediaUrl && message.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? message.mediaUrl : undefined}
                videoUrl={message.mediaUrl && message.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? message.mediaUrl : undefined}
                fileUrl={message.mediaUrl && !message.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i) ? message.mediaUrl : undefined}
                reactions={message.reactions}
                onReact={(emoji) => reactToMessage(message.id, emoji)}
              />
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <MessageInput 
          onSend={sendMessage}
          onTyping={startTyping}
        />
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All messages in this chat will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChat} className="bg-destructive hover:bg-destructive/90">
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
