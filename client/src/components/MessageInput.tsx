import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  className?: string;
}

export default function MessageInput({ onSend, onTyping, className }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("rounded-xl bg-card/60 backdrop-blur-xl border border-white/10 p-3", className)}>
      <div className="flex items-end gap-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="shrink-0"
          onClick={() => console.log('Emoji picker clicked')}
          data-testid="button-emoji"
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="shrink-0"
          onClick={() => console.log('Attach file clicked')}
          data-testid="button-attach"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping?.();
          }}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="resize-none border-0 focus-visible:ring-0 bg-transparent min-h-[40px] max-h-[120px]"
          rows={1}
          data-testid="input-message"
        />

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim()}
          className="shrink-0 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          data-testid="button-send"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
