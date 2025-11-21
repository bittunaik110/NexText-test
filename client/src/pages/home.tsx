import { useState } from "react";
import { useLocation } from "wouter";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import ProfileView from "@/components/ProfileView";
import ConnectModal from "@/components/ConnectModal";
import ThemeToggle from "@/components/ThemeToggle";
import { MessageCircle, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/useChats";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [view, setView] = useState<"chats" | "profile">("chats");
  const [selectedChat, setSelectedChat] = useState<string | undefined>();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { chats, loading } = useChats();
  const { user } = useAuth();

  const mockUser = {
    name: user?.displayName || "User",
    email: user?.email || "",
    pin: "XYZ789",
    bio: user?.email ? "Love connecting with people through NexText! 🚀" : "",
  };

  const selectedChatData = chats.find((c) => c.id === selectedChat);

  const handleConnect = async (pin: string) => {
    try {
      const { usersApi, chatsApi } = await import("@/lib/api");
      const foundUser = await usersApi.findByPin(pin);
      if (foundUser && foundUser.uid) {
        await chatsApi.create(foundUser.uid);
      }
    } catch (error) {
      console.error("Error connecting with PIN:", error);
    }
  };

  const displayChats = chats.map(chat => {
    const otherParticipant = chat.participants.find(p => p !== user?.uid) || chat.participants[0];
    return {
      id: chat.id,
      name: chat.participantNames?.[otherParticipant] || "Unknown",
      avatar: chat.participantPhotos?.[otherParticipant],
      lastMessage: chat.lastMessage,
      timestamp: new Date(chat.lastMessageTime),
      unreadCount: chat.unreadCount[user?.uid || ""] || 0,
      online: false,
    };
  });

  if (view === "profile") {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <ProfileView
          user={mockUser}
          onLogout={() => console.log("Logout")}
          onUpdate={(data) => console.log("Update profile:", data)}
        />
        <button
          onClick={() => setView("chats")}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-opacity"
          data-testid="button-back-to-chats"
        >
          Back to Chats
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className={`${selectedChat ? "hidden md:block" : "block"} w-full md:w-96 shrink-0`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChatList
              chats={displayChats}
              activeChat={selectedChat}
              onSelectChat={setSelectedChat}
              onConnect={() => setConnectModalOpen(true)}
              onProfile={() => setView("profile")}
            />
          )}
        </div>

        {selectedChat && selectedChatData ? (
          <div className="flex-1">
            <div className="relative h-full">
              <div className="absolute top-4 right-4 z-10 md:block hidden">
                <ThemeToggle />
              </div>
              <ChatWindow
                chatId={selectedChat}
                contact={{
                  name: displayChats.find(c => c.id === selectedChat)?.name || "Unknown",
                  online: false,
                }}
                onBack={() => setSelectedChat(undefined)}
                isTyping={false}
              />
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-background/50">
            <div className="text-center max-w-md px-6">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to NexText</h2>
              <p className="text-muted-foreground mb-6">
                Select a chat from the sidebar to start messaging, or connect with someone new using their PIN code
              </p>
              <div className="absolute top-4 right-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}

        <ConnectModal
          open={connectModalOpen}
          onOpenChange={setConnectModalOpen}
          onConnect={handleConnect}
        />
      </div>

      {/* Persistent Bottom Navigation - Always visible */}
      <div className="md:hidden sticky bottom-0 border-t border-border bg-card/60 backdrop-blur-xl z-50">
        <div className="flex items-center justify-around p-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => {
              setSelectedChat(undefined);
              setLocation("/");
            }}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Chats</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setLocation("/status")}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Status</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setLocation("/calls")}
          >
            <Phone className="h-5 w-5" />
            <span className="text-xs">Calls</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
