
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Shield, Smartphone, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function SecurityPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    twoFactor: false,
    loginAlerts: true,
    endToEndEncryption: true,
  });

  const devices = [
    { id: 1, name: "iPhone 14 Pro", location: "New York, USA", lastActive: "Active now" },
    { id: 2, name: "MacBook Pro", location: "New York, USA", lastActive: "2 hours ago" },
  ];

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
          <h1 className="text-xl font-semibold">Security</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Security Features</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, twoFactor: checked });
                toast({
                  title: checked ? "2FA Enabled" : "2FA Disabled",
                  description: checked ? "Two-factor authentication is now active" : "Two-factor authentication is now disabled",
                });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Login Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified of new logins</p>
            </div>
            <Switch
              checked={settings.loginAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, loginAlerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">End-to-End Encryption</p>
                <p className="text-sm text-muted-foreground">Your messages are encrypted</p>
              </div>
            </div>
            <Switch
              checked={settings.endToEndEncryption}
              disabled
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Password Management</h3>
          <Button className="w-full" onClick={() => toast({ title: "Change Password", description: "Password change feature coming soon" })}>
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Active Devices</h3>
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">{device.location}</p>
                  <p className="text-xs text-muted-foreground">{device.lastActive}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost">Remove</Button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
