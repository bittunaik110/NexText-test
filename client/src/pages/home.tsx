import { useState, useEffect } from "react";
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

  // Fetch user data from backend - will be loaded dynamically
  const [userProfile, setUserProfile] = useState({
    name: user?.displayName || "User",
    email: user?.email || "",
    pin: "",
    bio: "",
  });

  // Fetch user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { usersApi } = await import("@/lib/api");
        const response = await usersApi.getProfile();
        if (response.user) {
          setUserProfile({
            name: response.user.displayName || user?.displayName || "User",
            email: user?.email || "",
            pin: response.user.pin || "",
            bio: response.user.bio || "",
          });
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error);

        // Graceful handling for missing profile - try to create it
        if (error.message?.includes("404") || error.message?.includes("not found")) {
          try {
            const { usersApi } = await import("@/lib/api");
            await usersApi.createProfile({
              displayName: user?.email?.split("@")[0] || "User",
              bio: "",
            });
            // Retry loading after creation
            const response = await usersApi.getProfile();
            if (response.user) {
              setUserProfile({
                name: response.user.displayName || user?.displayName || "User",
                email: user?.email || "",
                pin: response.user.pin || "",
                bio: response.user.bio || "",
              });
            }
          } catch (createError) {
            console.error("Error creating missing profile:", createError);
          }
        }
      }
    };
    if (user) {
      loadProfile();
    }
  }, [user]);

  const selectedChatData = chats.find((c) => c.id === selectedChat);

  // Refresh chats after successful connection
  const handleConnectSuccess = () => {
    console.log("Connection successful, chats should refresh automatically via useChats listener");
  };

  // Maps chat data for display in the ChatList component
  const displayChats = chats.map(chat => {
    // Determine the other participant in the chat
    const otherParticipant = chat.participants.find(p => p !== user?.uid) || chat.participants[0];
    return {
      id: chat.id,
      name: chat.participantNames?.[otherParticipant] || "Unknown", // Display name or fallback
      avatar: chat.participantPhotos?.[otherParticipant], // Display avatar or fallback
      lastMessage: chat.lastMessage,
      timestamp: new Date(chat.lastMessageTime), // Format timestamp for display
      unreadCount: chat.unreadCount[user?.uid || ""] || 0, // Count unread messages for the current user
      online: false, // Placeholder for online status
    };
  });

  // Renders the profile view
  if (view === "profile") {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <ProfileView
          user={userProfile}
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

  // Renders the main chat view
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Pane */}
        <div className={`${selectedChat ? "hidden md:block" : "block"} w-full md:w-96 shrink-0`}>
          {loading ? (
            // Loading indicator while fetching chats
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            // Display the list of chats
            <ChatList
              chats={displayChats}
              activeChat={selectedChat}
              onSelectChat={setSelectedChat}
              onConnect={() => setConnectModalOpen(true)}
              onProfile={() => setView("profile")}
            />
          )}
        </div>

        {/* Chat Window Pane */}
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
                  online: false, // Placeholder for online status
                }}
                onBack={() => setSelectedChat(undefined)} // Close chat window
                isTyping={false} // Placeholder for typing indicator
              />
            </div>
          </div>
        ) : (
          // Placeholder for when no chat is selected
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

        {/* Connect Modal */}
        <ConnectModal
          open={connectModalOpen}
          onOpenChange={setConnectModalOpen}
          onConnect={() => {
            // Refresh the page or chat list after adding contact
            window.location.reload();
          }}
        />
      </div>

      {/* Persistent Bottom Navigation - Always visible on small screens */}
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