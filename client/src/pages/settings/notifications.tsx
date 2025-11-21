
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    masterSwitch: true,
    pushNotifications: true,
    inApp: true,
    email: false,
    sound: true,
    vibration: true,
    messagePreview: true,
  });

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved",
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
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
            </div>
            <Switch
              checked={settings.masterSwitch}
              onCheckedChange={() => handleToggle("masterSwitch")}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Notification Types</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
              disabled={!settings.masterSwitch}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">In-App Notifications</p>
              <p className="text-sm text-muted-foreground">Show notifications while using the app</p>
            </div>
            <Switch
              checked={settings.inApp}
              onCheckedChange={() => handleToggle("inApp")}
              disabled={!settings.masterSwitch}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Get updates via email</p>
            </div>
            <Switch
              checked={settings.email}
              onCheckedChange={() => handleToggle("email")}
              disabled={!settings.masterSwitch}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Notification Behavior</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound</p>
              <p className="text-sm text-muted-foreground">Play sound for notifications</p>
            </div>
            <Switch
              checked={settings.sound}
              onCheckedChange={() => handleToggle("sound")}
              disabled={!settings.masterSwitch}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Vibration</p>
              <p className="text-sm text-muted-foreground">Vibrate on new messages</p>
            </div>
            <Switch
              checked={settings.vibration}
              onCheckedChange={() => handleToggle("vibration")}
              disabled={!settings.masterSwitch}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Message Preview</p>
              <p className="text-sm text-muted-foreground">Show message content in notifications</p>
            </div>
            <Switch
              checked={settings.messagePreview}
              onCheckedChange={() => handleToggle("messagePreview")}
              disabled={!settings.masterSwitch}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
