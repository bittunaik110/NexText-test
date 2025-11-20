import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";
import { useSocketMessages } from "@/hooks/useSocketMessages";

interface ChatWindowProps {
  chatId: string;
  contact: {
    name: string;
    avatar?: string;
    online?: boolean;
  };
  onBack?: () => void;
  isTyping?: boolean;
}

export default function ChatWindow({ chatId, contact, onBack, isTyping }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, userId } = useMessages(chatId);
  const { sendMessage, reactToMessage, startTyping, stopTyping } = useSocketMessages(chatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
            <p className="text-xs text-muted-foreground">
              {contact.online ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => console.log('Voice call initiated')}
              data-testid="button-voice-call"
            >
              <Phone className="h-5 w-5 text-primary" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => console.log('Video call initiated')}
              data-testid="button-video-call"
            >
              <Video className="h-5 w-5 text-primary" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble 
              key={message.id}
              text={message.text}
              sent={message.userId === userId}
              timestamp={new Date(message.timestamp)}
              status={message.status}
              imageUrl={message.mediaUrl && message.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? message.mediaUrl : undefined}
              videoUrl={message.mediaUrl && message.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? message.mediaUrl : undefined}
              fileUrl={message.mediaUrl && !message.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i) ? message.mediaUrl : undefined}
              reactions={message.reactions}
              onReact={(emoji) => reactToMessage(message.id, emoji)}
            />
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
    </div>
  );
}
