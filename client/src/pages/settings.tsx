import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Bell, Lock, Shield, HelpCircle, ChevronRight, LogOut, Palette, Mail, FileText, MessageCircle, Users, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();


  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);


  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      setLocation("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const settingsItems = [
    {
      title: "Account Settings",
      items: [
        { icon: User, label: "Profile", onClick: () => setLocation("/profile") },
        { icon: User, label: "Account", onClick: () => console.log("Account") },
        { icon: User, label: "Contacts", onClick: () => setLocation("/contacts") },
      ]
    },
    {
      title: "Privacy & Security",
      items: [
        { icon: Lock, label: "Privacy", onClick: () => console.log("Privacy") },
        { icon: Shield, label: "Security", onClick: () => console.log("Security") },
        { icon: Shield, label: "Read Receipts", onClick: () => console.log("Read Receipts") },
        { icon: Shield, label: "Typing Indicator", onClick: () => console.log("Typing Indicator") },
        { icon: Shield, label: "Blocked Contacts", onClick: () => console.log("Blocked") },
      ]
    },
    {
      title: "Notifications",
      items: [
        { icon: Bell, label: "Notifications", onClick: () => console.log("Notifications") },
        { icon: Bell, label: "Push Notifications", onClick: () => console.log("Push Notifications") },
        { icon: Bell, label: "Message Tone", onClick: () => console.log("Message Tone") },
        { icon: Bell, label: "Notification Settings", onClick: () => console.log("Notification Settings") },
      ]
    },
    {
      title: "Appearance",
      items: [
        { icon: Palette, label: "Theme", onClick: () => console.log("Theme") },
        { icon: Palette, label: "Wallpaper", onClick: () => console.log("Wallpaper") },
      ]
    },
    {
      title: "Help & Support",
      items: [
        { icon: HelpCircle, label: "Help Center", onClick: () => console.log("Help Center") },
        { icon: Mail, label: "Contact Us", onClick: () => console.log("Contact") },
        { icon: FileText, label: "Terms & Privacy Policy", onClick: () => console.log("Terms") },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {settingsItems.map((section, index) => (
            <div key={index}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">{section.title}</h2>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    onClick={item.onClick}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/60 backdrop-blur-xl z-50">
        <div className="flex items-center justify-around p-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setLocation("/")}
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