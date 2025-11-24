import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker from "./EmojiPicker";
import AttachmentMenu from "./AttachmentMenu";
import { Message } from "@/hooks/useMessages";

interface MessageInputProps {
  onSend: (text: string, mediaUrl?: string, gifUrl?: string, replyTo?: string, voiceUrl?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  className?: string;
  replyTo?: Message | null;
  onClearReply?: () => void;
}

export default function MessageInput({ onSend, onTyping, className, replyTo, onClearReply }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState(40);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (message.trim()) {
        localStorage.setItem("messageDraft", message);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [message]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("messageDraft");
    if (draft) {
      setMessage(draft);
    }
  }, []);

  // Handle typing indicator
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

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

      onSend(message.trim(), fileUrl, gifUrl, replyTo?.id);
      setMessage("");
      setSelectedFile(null);
      setSelectedGif(null);
      setShowEmojiPicker(false);
      setIsTyping(false);
      onTyping?.(false);
      localStorage.removeItem("messageDraft");
      onClearReply?.();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/zip'].includes(file.type)) {
      setSelectedFile(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = message.substring(0, start) + emoji + message.substring(end);
      setMessage(text);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setMessage(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
      setTextareaHeight(newHeight);
    }
  }, [message]);

  return (
    <div className={cn("relative", className)}>
      {selectedFile && (
        <div className="mb-3 flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 mx-4">
          <span className="text-sm flex-1 truncate font-medium text-foreground">{selectedFile.name}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={() => setSelectedFile(null)}
            data-testid="button-remove-file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      )}

      {replyTo && (
        <div className="flex items-center gap-2 p-3 mx-4 rounded-lg border-l-4 border-primary bg-primary/5 mb-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-primary">Replying to</div>
            <div className="text-sm text-foreground truncate">
              {replyTo.text?.substring(0, 50) || "Message"}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={onClearReply}
            data-testid="button-clear-reply"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-full px-3 py-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*"
            data-testid="input-file"
          />
          <input
            type="file"
            ref={docInputRef}
            className="hidden"
            onChange={handleDocumentSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            data-testid="input-document"
          />

          <AttachmentMenu
            onGallerySelect={() => fileInputRef.current?.click()}
            onDocumentSelect={() => docInputRef.current?.click()}
            onCameraSelect={() => console.log("Camera not yet implemented")}
            onVoiceSelect={() => console.log("Voice not yet implemented")}
            onAudioSelect={() => console.log("Audio not yet implemented")}
            onContactSelect={() => console.log("Contact not yet implemented")}
            onLocationSelect={() => console.log("Location not yet implemented")}
          />

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message"
            className="flex-1 resize-none border-0 focus-visible:ring-0 bg-transparent text-base leading-6 font-normal text-foreground p-0 m-0"
            style={{ height: `${textareaHeight}px`, minHeight: '24px', maxHeight: '120px' }}
            data-testid="input-message"
          />

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 text-primary hover:bg-primary/10 rounded-full h-8 w-8"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              data-testid="button-emoji"
              title="Emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() && !selectedFile && !selectedGif}
              className="shrink-0 rounded-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white h-8 w-8"
              data-testid="button-send"
              title={message.trim() ? "Send message" : "Hold to record voice"}
            >
              {message.trim() ? <Send className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-16 -right-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-200">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        )}
      </div>
    </div>
  );
}
