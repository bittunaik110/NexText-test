import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";

interface ReplyIndicatorProps {
  message: Message | null;
  onClear: () => void;
  isSender: boolean;
}

export default function ReplyIndicator({ message, onClear, isSender }: ReplyIndicatorProps) {
  if (!message) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-lg border-l-4 border-primary bg-primary/5",
      isSender ? "mr-2" : ""
    )}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-primary">Replying to</div>
        <div className="text-sm text-foreground truncate">
          {message.text?.substring(0, 50) || "Message"}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        onClick={onClear}
        data-testid="button-clear-reply"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
