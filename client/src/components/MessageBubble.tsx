import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  text: string;
  sent: boolean;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  imageUrl?: string;
}

export default function MessageBubble({ text, sent, timestamp, status = "sent", imageUrl }: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full mb-3 animate-slide-up", sent ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] px-4 py-3 rounded-3xl", sent ? "bg-gradient-to-br from-primary to-primary/80" : "bg-card/60 backdrop-blur-xl border border-white/10")}>
        {imageUrl && (
          <img src={imageUrl} alt="Shared" className="rounded-2xl mb-2 max-w-full h-auto" />
        )}
        <p className={cn("text-[15px] break-words", sent ? "text-primary-foreground" : "text-foreground")}>{text}</p>
        <div className={cn("flex items-center justify-end gap-1 mt-1", sent ? "text-primary-foreground/70" : "text-muted-foreground")}>
          <span className="text-xs">{format(timestamp, "HH:mm")}</span>
          {sent && (
            <span className="ml-1">
              {status === "sent" && <Check className="h-3 w-3" />}
              {status === "delivered" && <CheckCheck className="h-3 w-3 text-secondary" />}
              {status === "read" && <CheckCheck className="h-3 w-3 text-primary-foreground" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
