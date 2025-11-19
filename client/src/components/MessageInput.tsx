
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile, X, Image as ImageIcon, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker from "./EmojiPicker";
import QuickActions from "./QuickActions";

interface MessageInputProps {
  onSend: (message: string, file?: File) => void;
  onTyping?: () => void;
  className?: string;
}

export default function MessageInput({ onSend, onTyping, className }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      onSend(message.trim(), selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={cn("", className)}>
      {showQuickActions && (
        <QuickActions onActionSelect={(action) => {
          console.log("Quick action selected:", action);
          setShowQuickActions(false);
        }} />
      )}
      
      <div className="rounded-xl bg-card/60 backdrop-blur-xl border border-white/10 p-3">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="shrink-0"
            onClick={() => setShowQuickActions(!showQuickActions)}
            data-testid="button-quick-actions"
          >
            <Grid3x3 className="h-5 w-5" />
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,application/pdf"
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
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

          <div className="relative">
            <Button 
              size="icon" 
              variant="ghost" 
              className="shrink-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              data-testid="button-emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-50">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
              </div>
            )}
          </div>

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() && !selectedFile}
            className="shrink-0 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            data-testid="button-send"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
