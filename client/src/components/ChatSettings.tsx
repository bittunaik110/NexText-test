
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Shield, Users, BarChart3 } from "lucide-react";

interface ChatSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  isGroup?: boolean;
}

export default function ChatSettings({ open, onOpenChange, chatId, isGroup }: ChatSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="notifications">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            {isGroup && (
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mute-chat">Mute notifications</Label>
              <Switch id="mute-chat" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-previews">Show message previews</Label>
              <Switch id="show-previews" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Notification sound</Label>
              <Switch id="sound" defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="encryption">End-to-end encryption</Label>
              <Switch id="encryption" defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="read-receipts">Read receipts</Label>
              <Switch id="read-receipts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="typing">Typing indicators</Label>
              <Switch id="typing" defaultChecked />
            </div>
          </TabsContent>

          {isGroup && (
            <TabsContent value="members" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-only">Only admins can send messages</Label>
                <Switch id="admin-only" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="invite">Members can invite others</Label>
                <Switch id="invite" defaultChecked />
              </div>
              <Button className="w-full">Manage Members</Button>
            </TabsContent>
          )}

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground">Media Shared</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2m</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
