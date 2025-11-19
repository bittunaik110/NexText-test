
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Bell, Lock, Palette, HelpCircle, Info, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
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

  const settingsSections = [
    {
      title: "Account",
      icon: User,
      items: [
        { label: "Profile", onClick: () => setLocation("/profile") },
        { label: "Privacy", onClick: () => console.log("Privacy") },
        { label: "Security", onClick: () => console.log("Security") },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { 
          label: "Push Notifications", 
          toggle: true, 
          value: notifications,
          onChange: setNotifications 
        },
        { label: "Message Tone", onClick: () => console.log("Message Tone") },
        { label: "Notification Settings", onClick: () => console.log("Notification Settings") },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Lock,
      items: [
        { 
          label: "Read Receipts", 
          toggle: true, 
          value: readReceipts,
          onChange: setReadReceipts 
        },
        { 
          label: "Typing Indicator", 
          toggle: true, 
          value: typingIndicator,
          onChange: setTypingIndicator 
        },
        { label: "Blocked Contacts", onClick: () => console.log("Blocked") },
      ],
    },
    {
      title: "Appearance",
      icon: Palette,
      items: [
        { label: "Theme", onClick: () => console.log("Theme") },
        { label: "Chat Wallpaper", onClick: () => console.log("Wallpaper") },
      ],
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      items: [
        { label: "Help Center", onClick: () => console.log("Help") },
        { label: "Contact Us", onClick: () => console.log("Contact") },
        { label: "Terms & Privacy Policy", onClick: () => console.log("Terms") },
      ],
    },
    {
      title: "About",
      icon: Info,
      items: [
        { label: "App Version", value: "1.0.0" },
      ],
    },
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
        {settingsSections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="px-4 py-2 bg-muted/30 flex items-center gap-2">
              <section.icon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">{section.title}</h2>
            </div>
            <div>
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={!item.toggle ? item.onClick : undefined}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.toggle ? (
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.onChange}
                    />
                  ) : item.value ? (
                    <span className="text-muted-foreground">{item.value}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="px-4 py-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
