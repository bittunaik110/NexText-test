
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    readReceipts: true,
    typingIndicator: true,
    lastSeen: true,
    profilePhoto: "everyone",
    status: "contacts",
  });

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
    toast({
      title: "Privacy updated",
      description: "Your privacy settings have been updated",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/settings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Privacy</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Communication Privacy</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Read Receipts</p>
              <p className="text-sm text-muted-foreground">Let others see when you've read their messages</p>
            </div>
            <Switch
              checked={settings.readReceipts}
              onCheckedChange={() => handleToggle("readReceipts")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Typing Indicator</p>
              <p className="text-sm text-muted-foreground">Show when you're typing a message</p>
            </div>
            <Switch
              checked={settings.typingIndicator}
              onCheckedChange={() => handleToggle("typingIndicator")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Last Seen</p>
              <p className="text-sm text-muted-foreground">Share your last active time</p>
            </div>
            <Switch
              checked={settings.lastSeen}
              onCheckedChange={() => handleToggle("lastSeen")}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Profile Privacy</h3>
          
          <div>
            <p className="font-medium mb-2">Who can see my profile photo</p>
            <div className="space-y-2">
              {["Everyone", "Contacts", "Nobody"].map((option) => (
                <div
                  key={option}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSettings({ ...settings, profilePhoto: option.toLowerCase() })}
                >
                  <span>{option}</span>
                  <div className={`h-4 w-4 rounded-full border-2 ${settings.profilePhoto === option.toLowerCase() ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Who can see my status</p>
            <div className="space-y-2">
              {["Everyone", "Contacts", "Nobody"].map((option) => (
                <div
                  key={option}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSettings({ ...settings, status: option.toLowerCase() })}
                >
                  <span>{option}</span>
                  <div className={`h-4 w-4 rounded-full border-2 ${settings.status === option.toLowerCase() ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
