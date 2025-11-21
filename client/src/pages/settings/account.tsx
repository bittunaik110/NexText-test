
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [accountInfo, setAccountInfo] = useState({
    email: user?.email || "",
    phoneNumber: "",
    username: user?.displayName || "",
  });

  const handleSave = async () => {
    toast({
      title: "Account updated",
      description: "Your account information has been updated successfully",
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    toast({
      title: "Password change",
      description: "Password change feature will be implemented",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation("/settings")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Account</h1>
          </div>
          {isEditing && (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Account Information</h3>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <Input
              value={accountInfo.email}
              onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })}
              disabled={!isEditing}
              type="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            <Input
              value={accountInfo.username}
              onChange={(e) => setAccountInfo({ ...accountInfo, username: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Phone Number</label>
            <Input
              value={accountInfo.phoneNumber}
              onChange={(e) => setAccountInfo({ ...accountInfo, phoneNumber: e.target.value })}
              disabled={!isEditing}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {!isEditing ? (
            <Button className="w-full" onClick={() => setIsEditing(true)}>
              Edit Account Info
            </Button>
          ) : (
            <Button className="w-full" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Security</h3>
          <Button className="w-full" onClick={handleChangePassword}>
            Change Password
          </Button>
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Account Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user?.uid.substring(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span>{new Date(user?.metadata.creationTime || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sign In</span>
              <span>{new Date(user?.metadata.lastSignInTime || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
