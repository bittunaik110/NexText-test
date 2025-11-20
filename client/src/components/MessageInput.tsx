
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile, X, Image as ImageIcon } from "lucide-react";
import { SiGiphy } from "react-icons/si";
import { cn } from "@/lib/utils";
import EmojiPicker from "./EmojiPicker";
import GifPicker from "./GifPicker";

interface MessageInputProps {
  onSend: (message: string, file?: File, gifUrl?: string) => void;
  onTyping?: () => void;
  className?: string;
}

export default function MessageInput({ onSend, onTyping, className }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim() && !selectedFile && !selectedGif) return;

    let fileUrl: string | undefined;
    let gifUrl: string | undefined;

    try {
      if (selectedFile) {
        const { uploadFile } = await import("@/lib/uploadFile");
        fileUrl = await uploadFile(selectedFile);
      }

      if (selectedGif) {
        gifUrl = selectedGif;
      }

      onSend(message.trim(), fileUrl, gifUrl);
      setMessage("");
      setSelectedFile(null);
      setSelectedGif(null);
      setShowGifPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);
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
  };

  return (
    <div className={cn("relative", className)}>
      {showGifPicker && (
        <GifPicker
          onGifSelect={(gifUrl) => {
            setSelectedGif(gifUrl);
            setShowGifPicker(false);
          }}
          onClose={() => setShowGifPicker(false)}
        />
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

        {selectedGif && (
          <div className="mb-2 relative">
            <img src={selectedGif} alt="Selected GIF" className="rounded-lg max-h-32 w-auto" />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1 h-6 w-6 bg-background/80"
              onClick={() => setSelectedGif(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
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

          <Button 
            size="icon" 
            variant="ghost" 
            className="shrink-0"
            onClick={() => setShowGifPicker(!showGifPicker)}
            data-testid="button-gif"
          >
            <SiGiphy className="h-5 w-5" />
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

          <EmojiPicker onSelect={handleEmojiSelect} />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() && !selectedFile && !selectedGif}
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
