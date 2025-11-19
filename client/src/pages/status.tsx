
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Plus } from "lucide-react";
import { useLocation } from "wouter";

interface Status {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  viewed: boolean;
}

export default function StatusPage() {
  const [, setLocation] = useLocation();
  const now = new Date();
  
  const [myStatus] = useState({
    hasStatus: false,
    lastUpdated: null as Date | null,
  });

  const [statuses] = useState<Status[]>([
    {
      id: "1",
      user: { name: "Sarah Chen" },
      timestamp: new Date(now.getTime() - 3600000),
      viewed: false,
    },
    {
      id: "2",
      user: { name: "Mike Wilson" },
      timestamp: new Date(now.getTime() - 7200000),
      viewed: false,
    },
    {
      id: "3",
      user: { name: "Emily Rodriguez" },
      timestamp: new Date(now.getTime() - 86400000),
      viewed: true,
    },
  ]);

  const unviewedStatuses = statuses.filter(s => !s.viewed);
  const viewedStatuses = statuses.filter(s => s.viewed);

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
          <h1 className="text-xl font-semibold">Status</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* My Status */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserAvatar name="You" size="lg" />
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-gradient-to-r from-primary to-accent"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">My Status</h3>
              <p className="text-sm text-muted-foreground">
                {myStatus.hasStatus ? "Tap to view" : "Tap to add status update"}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        {unviewedStatuses.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Recent updates</p>
            </div>
            {unviewedStatuses.map((status) => (
              <div
                key={status.id}
                className="flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent p-[2px]">
                    <div className="h-full w-full rounded-full bg-background" />
                  </div>
                  <UserAvatar name={status.user.name} src={status.user.avatar} size="lg" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{status.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor((now.getTime() - status.timestamp.getTime()) / 3600000)} hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Viewed Updates */}
        {viewedStatuses.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Viewed updates</p>
            </div>
            {viewedStatuses.map((status) => (
              <div
                key={status.id}
                className="flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors opacity-60"
              >
                <UserAvatar name={status.user.name} src={status.user.avatar} size="lg" />
                <div className="flex-1">
                  <h3 className="font-semibold">{status.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor((now.getTime() - status.timestamp.getTime()) / 86400000)} days ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
