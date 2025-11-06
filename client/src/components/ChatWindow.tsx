import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sent: boolean;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

interface ChatWindowProps {
  contact: {
    name: string;
    avatar?: string;
    online?: boolean;
  };
  messages: Message[];
  onBack?: () => void;
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
}

export default function ChatWindow({ contact, messages, onBack, onSendMessage, isTyping }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

          <Button size="icon" variant="ghost" data-testid="button-options">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <MessageInput 
          onSend={onSendMessage}
          onTyping={() => console.log('User typing')}
        />
      </div>
    </div>
  );
}
