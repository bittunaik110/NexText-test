import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "./GlassCard";
import UserAvatar from "./UserAvatar";
import { Copy, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileViewProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    pin: string;
    bio?: string;
  };
  onLogout: () => void;
  onUpdate: (data: { name: string; bio: string }) => void;
}

export default function ProfileView({ user, onLogout, onUpdate }: ProfileViewProps) {
  const { toast } = useToast();

  const copyPin = () => {
    navigator.clipboard.writeText(user.pin);
    toast({
      title: "PIN Copied!",
      description: "Your connection PIN has been copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="space-y-6 py-8">
        <div className="text-center">
          <UserAvatar name={user.name} src={user.avatar} size="xl" className="mx-auto mb-4" online />
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Connection PIN</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-xl bg-card/60 backdrop-blur-xl border border-white/10 text-center">
              {user.pin ? (
                <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {user.pin}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Loading PIN...</span>
              )}
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={copyPin}
              className="shrink-0"
              disabled={!user.pin}
              data-testid="button-copy-pin"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Share this PIN with friends to connect instantly
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                defaultValue={user.name}
                className="bg-card/60 backdrop-blur-xl border-white/10"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                defaultValue={user.bio}
                placeholder="Tell us about yourself..."
                className="bg-card/60 backdrop-blur-xl border-white/10 resize-none"
                rows={3}
                data-testid="input-bio"
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => onUpdate({ name: user.name, bio: user.bio || "" })}
              data-testid="button-save"
            >
              Save Changes
            </Button>
          </div>
        </GlassCard>

        <Button
          variant="destructive"
          className="w-full"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
