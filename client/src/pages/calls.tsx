
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { useLocation } from "wouter";

interface Call {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  type: "audio" | "video";
  direction: "incoming" | "outgoing" | "missed";
  timestamp: Date;
}

export default function CallsPage() {
  const [, setLocation] = useLocation();
  const now = new Date();

  const [calls] = useState<Call[]>([
    {
      id: "1",
      user: { name: "Sarah Chen" },
      type: "video",
      direction: "outgoing",
      timestamp: new Date(now.getTime() - 3600000),
    },
    {
      id: "2",
      user: { name: "Mike Wilson" },
      type: "audio",
      direction: "incoming",
      timestamp: new Date(now.getTime() - 7200000),
    },
    {
      id: "3",
      user: { name: "Emily Rodriguez" },
      type: "video",
      direction: "missed",
      timestamp: new Date(now.getTime() - 86400000),
    },
    {
      id: "4",
      user: { name: "David Lee" },
      type: "audio",
      direction: "outgoing",
      timestamp: new Date(now.getTime() - 172800000),
    },
  ]);

  const getCallIcon = (direction: string) => {
    switch (direction) {
      case "incoming":
        return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case "outgoing":
        return <PhoneOutgoing className="h-4 w-4 text-primary" />;
      case "missed":
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

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
          <h1 className="text-xl font-semibold">Calls</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/50"
          >
            <UserAvatar name={call.user.name} src={call.user.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${call.direction === 'missed' ? 'text-red-500' : ''}`}>
                {call.user.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {getCallIcon(call.direction)}
                <span className="capitalize">{call.direction}</span>
                <span>·</span>
                <span>{formatTimestamp(call.timestamp)}</span>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
            >
              {call.type === "video" ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <Phone className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg"
        >
          <Video className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
