import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";

interface ChatListItemProps {
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  online?: boolean;
  active?: boolean;
  onClick?: () => void;
  lastSeen?: number;
}

const formatLastSeen = (lastSeenTime?: number): string => {
  if (!lastSeenTime) return "";
  const now = Date.now();
  const diff = now - lastSeenTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 0) return `today at ${format(new Date(lastSeenTime), "h:mm a")}`;
  if (days === 1) return `yesterday`;
  return format(new Date(lastSeenTime), "MMM d");
};

export default function ChatListItem({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  online,
  active,
  onClick,
  lastSeen,
}: ChatListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover-elevate",
        "hover:bg-white/5 active:bg-white/10",
        active ? "bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30" : "border border-transparent"
      )}
      data-testid={`chat-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <UserAvatar name={name} src={avatar} online={online} size="md" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-600 text-foreground truncate">{name}</h3>
          <span className={cn("text-xs shrink-0 font-medium", online ? "text-status-online" : "text-muted-foreground")}>
            {online ? "Online" : lastSeen ? formatLastSeen(lastSeen) : ""}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate line-clamp-1">{lastMessage || "No messages yet"}</p>
      </div>

      {unreadCount > 0 && (
        <Badge 
          className="bg-gradient-to-r from-primary via-accent to-primary shrink-0 min-w-[24px] h-6 flex items-center justify-center px-2 animate-pulse-badge font-semibold text-xs"
          data-testid={`unread-badge-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {unreadCount}
        </Badge>
      )}
    </div>
  );
}
