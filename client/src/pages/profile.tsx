import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/uploadFile";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: user?.displayName || "",
    bio: "Love connecting with people! 🚀",
    avatarUrl: user?.photoURL || "",
    phoneNumber: "",
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setProfile({ ...profile, avatarUrl: url });
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    setIsEditing(false);
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
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
          {isEditing && (
            <Button onClick={handleSave} data-testid="button-save">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <UserAvatar 
                name={profile.displayName || "User"} 
                src={profile.avatarUrl} 
                size="xl"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                    data-testid="input-avatar"
                  />
                </label>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold">{profile.displayName || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Display Name</label>
            <Input
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your name"
              data-testid="input-display-name"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={3}
              data-testid="input-bio"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Phone Number</label>
            <Input
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              disabled={!isEditing}
              placeholder="+1 (555) 123-4567"
              data-testid="input-phone"
            />
          </div>

          {!isEditing ? (
            <Button 
              className="w-full" 
              onClick={() => setIsEditing(true)}
              data-testid="button-edit"
            >
              Edit Profile
            </Button>
          ) : (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setIsEditing(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Account Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span>{new Date(user?.metadata.creationTime || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
