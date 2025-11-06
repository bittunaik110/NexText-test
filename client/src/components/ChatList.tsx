import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatListItem from "./ChatListItem";
import { Search, UserPlus, User } from "lucide-react";
import { useState } from "react";

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

export default function ChatList({ chats, activeChat, onSelectChat, onConnect, onProfile }: ChatListProps) {
  const [search, setSearch] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background border-r border-border">
      <div className="p-4 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NexText
          </h1>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={onConnect}
              data-testid="button-connect"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onProfile}
              data-testid="button-profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              {search ? "No chats found" : "No chats yet"}
            </p>
            {!search && (
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
