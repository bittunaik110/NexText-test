import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import ContactNameDialog from "./ContactNameDialog";

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
  userId?: string;
  onSaveCustomName?: (customName: string) => void;
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
  userId,
  onSaveCustomName,
}: ChatListItemProps) {
  const [showNameDialog, setShowNameDialog] = useState(false);
  const longPressRef = useRef<{ timeout?: NodeJS.Timeout; start?: number }>({});

  const handleLongPress = () => {
    setShowNameDialog(true);
  };

  const handleMouseDown = () => {
    longPressRef.current.start = Date.now();
    longPressRef.current.timeout = setTimeout(() => {
      handleLongPress();
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressRef.current.timeout) {
      clearTimeout(longPressRef.current.timeout);
    }
  };

  return (
    <>
      <div
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={cn(
          "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 select-none",
          active ? "bg-gray-100 border border-gray-200" : "hover:bg-gray-50 border border-transparent"
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
        <div 
          className="shrink-0 min-w-[24px] h-6 flex items-center justify-center px-1.5 font-bold text-[11px] text-white rounded-full shadow-lg bg-red-500 hover:bg-red-600 transition-colors"
          data-testid={`unread-badge-${name.toLowerCase().replace(/\s+/g, '-')}`}
          title={`${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
      </div>

      {userId && (
        <ContactNameDialog
          open={showNameDialog}
          onOpenChange={setShowNameDialog}
          contactName={name}
          originalName={name}
          onSave={(customName) => {
            onSaveCustomName?.(customName);
          }}
        />
      )}
    </>
  );
}