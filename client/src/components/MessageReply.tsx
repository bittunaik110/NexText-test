
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageReplyProps {
  replyingTo: {
    id: string;
    text: string;
    senderName: string;
  } | null;
  onCancel: () => void;
}

export default function MessageReply({ replyingTo, onCancel }: MessageReplyProps) {
  if (!replyingTo) return null;

  return (
    <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-primary">{replyingTo.senderName}</p>
        <p className="text-sm text-muted-foreground truncate">{replyingTo.text}</p>
      </div>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-muted rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
