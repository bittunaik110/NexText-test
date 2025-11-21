
import { useState } from "react";
import { Plus, Search, Settings, Menu, LogOut } from "lucide-react";
import ChatListItem from "./ChatListItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "./UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChatListProps {
  chats: Array<{
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
    online: boolean;
  }>;
  activeChat?: string;
  onSelectChat: (chatId: string) => void;
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex h-full flex-col border-r border-border bg-card/60 backdrop-blur-xl">
        <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chats
            </h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid="button-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={onProfile}>
                    <UserAvatar 
                      name={user?.displayName || user?.email || "User"} 
                      src={user?.photoURL || undefined}
                      size="sm"
                      className="mr-2"
                    />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowLogoutDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
              data-testid="input-search-chats"
            />
          </div>

          <Button
            onClick={onConnect}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            data-testid="button-new-chat"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No chats found" : "No chats yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Start a conversation by connecting with someone"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={onConnect}
                  variant="outline"
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Now
                </Button>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                {...chat}
                isActive={activeChat === chat.id}
                onClick={() => onSelectChat(chat.id)}
              />
            ))
          )}
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your chats.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
