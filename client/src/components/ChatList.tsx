import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatListItem from "./ChatListItem";
import { Search, UserPlus, User, MoreVertical, Video, Phone } from "lucide-react";
import { useState } from "react";
import UserAvatar from "./UserAvatar"; // Assuming UserAvatar is in the same directory
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter"; // Assuming wouter is used for routing

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  online?: boolean;
}

// Dummy data for chat list
const dummyChats: Chat[] = [
  {
    id: "1",
    name: "Alice",
    lastMessage: "Hey, how are you?",
    timestamp: new Date(),
    online: true,
  },
  {
    id: "2",
    name: "Bob",
    lastMessage: "See you later!",
    timestamp: new Date(),
    unreadCount: 2,
  },
  {
    id: "3",
    name: "Charlie",
    lastMessage: "Meeting at 3 PM",
    timestamp: new Date(),
  },
];

interface ChatListProps {
  chats: Chat[];
  activeChat?: string;
  onSelectChat: (id: string) => void;
  onConnect: () => void;
  onProfile: () => void;
}

// Placeholder component for the main app view
function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen">{children}</div>;
}

// Placeholder component for the Chat screen
function ChatScreen({ chatId }: { chatId: string }) {
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<"video" | "voice" | null>(null);

  const handleVideoCall = () => {
    setCallType("video");
    setIsCalling(true);
  };

  const handleVoiceCall = () => {
    setCallType("voice");
    setIsCalling(true);
  };

  const handleHangup = () => {
    setIsCalling(false);
    setCallType(null);
  };

  // Fetch chat details based on chatId for display
  const chat = dummyChats.find((c) => c.id === chatId) || {
    id: chatId,
    name: "Unknown",
    avatar: "",
    lastMessage: "",
    timestamp: new Date(),
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <UserAvatar name={chat.name} src={chat.avatar} size="large" />
          <div>
            <h2 className="font-semibold text-lg">{chat.name}</h2>
            <p className="text-sm text-muted-foreground">
              {chat.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={handleVoiceCall}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleVideoCall}>
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => alert("View Profile")}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Mute Conversation")}>
                Mute
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Archive Conversation")}>
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Message area */}
        <p className="text-center text-muted-foreground py-10">
          This is the start of your conversation with {chat.name}.
        </p>
        {/* Placeholder for messages */}
      </div>

      <div className="p-4 border-t border-border bg-card/60 backdrop-blur-xl">
        <Input placeholder="Type a message..." className="bg-card/60 border-white/10" />
      </div>

      {/* Call Modal/Screen */}
      {isCalling && callType === "voice" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-card p-6 rounded-lg text-center">
            <UserAvatar name={chat.name} src={chat.avatar} size="xlarge" />
            <h3 className="text-xl font-semibold mt-4">{chat.name}</h3>
            <p className="text-muted-foreground mb-6">Calling...</p>
            <Button variant="destructive" size="lg" onClick={handleHangup}>
              <Phone className="h-5 w-5 mr-2" /> Hang Up
            </Button>
          </div>
        </div>
      )}

      {isCalling && callType === "video" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="flex-1 w-full relative">
            {/* Placeholder for video feed */}
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <p className="text-white text-lg">Video Feed Area</p>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-4">
              <Button variant="destructive" size="lg" onClick={handleHangup}>
                <Phone className="h-5 w-5 mr-2" /> Hang Up
              </Button>
            </div>
          </div>
          <div className="p-4 bg-black/50 w-full flex justify-center">
            <UserAvatar name={chat.name} src={chat.avatar} size="large" />
          </div>
        </div>
      )}
    </div>
  );
}

// Placeholder component for the Status screen
function StatusScreen() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Status Updates</p>
    </div>
  );
}

// Placeholder component for the Calls screen
function CallsScreen({ onVideoCall, onVoiceCall }: { onVideoCall: () => void; onVoiceCall: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background">
      <h2 className="text-2xl font-bold mb-6">Calls</h2>
      <div className="flex gap-4">
        <Button size="lg" onClick={onVoiceCall} className="flex flex-col items-center p-6">
          <Phone className="h-8 w-8 mb-2" />
          Voice Call
        </Button>
        <Button size="lg" onClick={onVideoCall} className="flex flex-col items-center p-6">
          <Video className="h-8 w-8 mb-2" />
          Video Call
        </Button>
      </div>
    </div>
  );
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
  const [currentScreen, setCurrentScreen] = useState<"chats" | "status" | "calls">("chats");
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<"video" | "voice" | null>(null);

  const handleVideoCall = () => {
    setCallType("video");
    setIsCalling(true);
  };

  const handleVoiceCall = () => {
    setCallType("voice");
    setIsCalling(true);
  };

  const handleHangup = () => {
    setIsCalling(false);
    setCallType(null);
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSettingsClick = () => {
    setLocation("/settings"); // Navigate to settings page
  };

  return (
    <AppLayout>
      <div className="w-[360px] flex flex-col h-screen border-r border-border bg-card/30 backdrop-blur-xl">
        <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onProfile} className="flex items-center gap-2 hover:opacity-80">
              <UserAvatar name="You" size="default" />
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
          {currentScreen === "chats" && (
            <>
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    {...chat}
                    active={activeChat === chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      setCurrentScreen("chats"); // Stay on chats screen but select chat
                    }}
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
            </>
          )}
          {currentScreen === "status" && <StatusScreen />}
          {currentScreen === "calls" && <CallsScreen onVideoCall={handleVideoCall} onVoiceCall={handleVoiceCall} />}
        </div>

        <div className="flex justify-around p-2 border-t border-border bg-card/60 backdrop-blur-xl">
          <Button
            variant={currentScreen === "chats" ? "default" : "ghost"}
            size="icon"
            onClick={() => setCurrentScreen("chats")}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant={currentScreen === "status" ? "default" : "ghost"}
            size="icon"
            onClick={() => setCurrentScreen("status")}
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant={currentScreen === "calls" ? "default" : "ghost"}
            size="icon"
            onClick={() => setCurrentScreen("calls")}
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {activeChat ? (
        <ChatScreen chatId={activeChat} />
      ) : currentScreen === "chats" ? (
        <div className="flex-1 flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Select a chat to start messaging.</p>
        </div>
      ) : currentScreen === "status" ? (
        <StatusScreen />
      ) : currentScreen === "calls" ? (
        <CallsScreen onVideoCall={handleVideoCall} onVoiceCall={handleVoiceCall} />
      ) : null}

      {/* Call UI overlays */}
      {isCalling && callType === "voice" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-card p-6 rounded-lg text-center">
            <UserAvatar name="Calling..." size="xlarge" />
            <h3 className="text-xl font-semibold mt-4">Calling...</h3>
            <p className="text-muted-foreground mb-6">to {activeChat ? dummyChats.find(c => c.id === activeChat)?.name : 'Unknown'}</p>
            <Button variant="destructive" size="lg" onClick={handleHangup}>
              <Phone className="h-5 w-5 mr-2" /> Hang Up
            </Button>
          </div>
        </div>
      )}

      {isCalling && callType === "video" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <p className="text-white text-lg">Video Feed Area</p>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-4">
              <Button variant="destructive" size="lg" onClick={handleHangup}>
                <Phone className="h-5 w-5 mr-2" /> Hang Up
              </Button>
            </div>
          </div>
          <div className="p-4 bg-black/50 w-full flex justify-center">
            <UserAvatar name={activeChat ? dummyChats.find(c => c.id === activeChat)?.name : 'Unknown'} src={activeChat ? dummyChats.find(c => c.id === activeChat)?.avatar : ''} size="large" />
          </div>
        </div>
      )}
    </AppLayout>
  );
}