import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatListItem from "./ChatListItem";
import { Search, UserPlus, MoreVertical } from "lucide-react";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  online?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  activeChat?: string;
  onSelectChat: (id: string) => void;
  onConnect: () => void;
  onProfile: () => void;
}

export default function ChatList({
  chats,
  activeChat,
  onSelectChat,
  onConnect,
  onProfile,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSettingsClick = () => {
    setLocation("/settings");
  };

  return (
    <div className="w-full md:w-96 flex flex-col h-full border-r border-border bg-card/30 backdrop-blur-xl">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onProfile} className="flex items-center gap-2 hover:opacity-80">
            <UserAvatar name={user?.displayName || "You"} src={user?.photoURL || undefined} size="default" />
            <h1 className="text-xl font-semibold">NexText</h1>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSettingsClick}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/60 backdrop-blur-xl border-white/10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              {...chat}
              active={activeChat === chat.id}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No chats found" : "No chats yet"}
            </p>
            {!searchQuery && (
              <Button
                onClick={onConnect}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Connect with Someone
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}