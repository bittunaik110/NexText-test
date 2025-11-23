import { cn } from "@/lib/utils";
import { Check, CheckCheck, Smile, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  text: string;
  sent: boolean;
  timestamp: Date;
  status?: "pending" | "sent" | "delivered" | "read";
  imageUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  reactions?: Record<string, string>;
  onReact?: (emoji: string) => void;
  onLongPress?: () => void;
}

const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

export default function MessageBubble({ 
  text, 
  sent, 
  timestamp, 
  status = "sent", 
  imageUrl,
  videoUrl,
  fileUrl,
  fileName,
  reactions = {},
  onReact,
  onLongPress
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  const reactionCounts = Object.entries(
    Object.values(reactions).reduce((acc, emoji) => {
      acc[emoji] = (acc[emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

  return (
    <div className={cn("flex w-full mb-3 animate-message-send group", sent ? "justify-end" : "justify-start")}>
      <div className={cn("relative max-w-[85%] sm:max-w-[75%] min-w-[100px]")}>
        <div 
          className={cn(
            "px-4 py-2.5 rounded-3xl relative backdrop-blur-xl transition-all duration-200",
            sent 
              ? "bg-gradient-to-br from-primary via-purple-500 to-accent text-white shadow-lg hover:shadow-xl" 
              : "bg-white/10 border border-white/20 text-foreground hover:bg-white/15"
          )}
          onContextMenu={(e) => {
            e.preventDefault();
            onLongPress?.();
          }}
        >
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Shared" 
              className="rounded-2xl mb-2 max-w-full h-auto max-h-64 object-cover" 
              data-testid="message-image"
            />
          )}
          {videoUrl && (
            <video 
              src={videoUrl} 
              controls 
              className="rounded-2xl mb-2 max-w-full h-auto max-h-64" 
              data-testid="message-video"
            />
          )}
          {fileUrl && fileName && (
            <a 
              href={fileUrl} 
              download={fileName}
              className="flex items-center gap-2 p-2 bg-white/10 rounded-lg mb-2 hover:bg-white/20 transition-colors"
              data-testid="message-file"
            >
              <span className="text-sm truncate font-medium">{fileName}</span>
            </a>
          )}
          {text && (
            <p className="text-[15px] break-words leading-6 font-normal whitespace-pre-wrap pr-16 pb-1">
              {text}
            </p>
          )}
          <div className={cn(
            "flex items-center justify-end gap-1.5 text-[11px] font-medium absolute bottom-2 right-3",
            sent ? "text-white/80" : "text-muted-foreground"
          )}>
            <span>{format(timestamp, "HH:mm")}</span>
            {sent && (
              <span className="flex items-center" data-testid={`message-status-${status}`}>
                {status === "pending" && <Clock className="h-3.5 w-3.5 text-white/60" />}
                {status === "sent" && <Check className="h-3.5 w-3.5 text-white/70" />}
                {status === "delivered" && <CheckCheck className="h-3.5 w-3.5 text-white/70" />}
                {status === "read" && <CheckCheck className="h-3.5 w-3.5 text-blue-400" />}
              </span>
            )}
          </div>

          {reactionCounts.length > 0 && (
            <div className="absolute -bottom-3 right-2 flex gap-1 bg-background border border-border rounded-full px-2 py-1 shadow-sm" data-testid="message-reactions">
              {reactionCounts.map(([emoji, count]) => (
                <span key={emoji} className="text-xs flex items-center">
                  {emoji} {count > 1 && <span className="ml-0.5 text-muted-foreground">{count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {onReact && (
          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full"
              onClick={() => setShowReactions(!showReactions)}
              data-testid="button-react"
            >
              <Smile className="h-4 w-4" />
            </Button>
            {showReactions && (
              <div className="absolute top-0 right-full mr-2 flex gap-1 bg-card border border-border rounded-full px-2 py-1 shadow-lg" data-testid="reaction-picker">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(emoji);
                      setShowReactions(false);
                    }}
                    className="hover:scale-125 transition-transform text-lg"
                    data-testid={`reaction-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
