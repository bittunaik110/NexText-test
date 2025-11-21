
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Camera, Save, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/uploadFile";
import { usersApi } from "@/lib/api";
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

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    phoneNumber: "",
    pin: "",
  });

  // READ: Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await usersApi.getProfile();
        if (response.user) {
          setProfile({
            displayName: response.user.displayName || "",
            bio: response.user.bio || "",
            avatarUrl: response.user.photoURL || "",
            phoneNumber: response.user.phoneNumber || "",
            pin: response.user.pin || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Using default values.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  // UPDATE: Upload and update avatar
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
      
      await usersApi.updateProfile({ photoURL: url });
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // UPDATE: Save profile changes to backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await usersApi.updateProfile({
        displayName: profile.displayName,
        bio: profile.bio,
        photoURL: profile.avatarUrl,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // DELETE: Remove profile picture
  const handleDeleteAvatar = async () => {
    try {
      await usersApi.updateProfile({ photoURL: "" });
      setProfile({ ...profile, avatarUrl: "" });
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to remove avatar",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <Button onClick={handleSave} disabled={isSaving} data-testid="button-save">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
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
                <>
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
                  {profile.avatarUrl && (
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="absolute top-0 right-0 h-8 w-8 rounded-full bg-destructive flex items-center justify-center shadow-lg"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold">{profile.displayName || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {profile.pin && (
                <p className="text-sm text-muted-foreground mt-1">PIN: {profile.pin}</p>
              )}
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
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user?.uid.substring(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span>{new Date(user?.metadata.creationTime || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAvatar} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
