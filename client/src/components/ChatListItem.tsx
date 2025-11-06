import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ChatListItemProps {
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  online?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export default function ChatListItem({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  online,
  active,
  onClick,
}: ChatListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover-elevate",
        active && "bg-primary/10"
      )}
      data-testid={`chat-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <UserAvatar name={name} src={avatar} online={online} size="md" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      </div>

      {unreadCount > 0 && (
        <Badge 
          className="bg-gradient-to-r from-primary to-accent shrink-0 min-w-[20px] h-5 flex items-center justify-center px-2"
          data-testid={`unread-badge-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {unreadCount}
        </Badge>
      )}
    </div>
  );
}
