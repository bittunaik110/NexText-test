
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff, MessageCircle, User } from "lucide-react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/lib/firebase";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { AudioPlayer } from "@/components/AudioPlayer";

interface Call {
  id: string;
  callId: string;
  initiator: string;
  recipient: string;
  initiatorName: string;
  recipientName: string;
  user: {
    name: string;
    avatar?: string;
  };
  type: "audio" | "video";
  direction: "incoming" | "outgoing" | "missed" | "declined";
  timestamp: Date;
  duration: number;
  status: string;
  recording?: {
    url: string;
    duration: number;
    savedAt: number;
  };
  chatId: string;
}

export default function CallsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [calls, setCalls] = useState<Call[]>([]);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [voiceCallOpen, setVoiceCallOpen] = useState(false);

  // Load calls from Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const callsRef = ref(database, "calls");
    const q = query(callsRef, limitToLast(50));

    const unsubscribe = onValue(q, (snapshot) => {
      const allCalls: Call[] = [];

      snapshot.forEach((chatSnapshot) => {
        chatSnapshot.forEach((callSnapshot) => {
          const callData = callSnapshot.val();
          const isInitiator = callData.initiator === user.uid;

          // Determine direction
          let direction: "incoming" | "outgoing" | "missed" | "declined" = "incoming";
          if (isInitiator) {
            direction = "outgoing";
          } else if (callData.status === "missed") {
            direction = "missed";
          } else if (callData.status === "declined") {
            direction = "declined";
          }

          allCalls.push({
            id: callData.callId,
            callId: callData.callId,
            initiator: callData.initiator,
            recipient: callData.recipient,
            initiatorName: callData.initiatorName,
            recipientName: callData.recipientName,
            user: {
              name: isInitiator ? callData.recipientName : callData.initiatorName,
            },
            type: "audio",
            direction,
            timestamp: new Date(callData.startTime),
            duration: callData.duration || 0,
            status: callData.status,
            recording: callData.recording,
            chatId: chatSnapshot.key,
          });
        });
      });

      // Sort by timestamp descending
      allCalls.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      setCalls(allCalls);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "just now";
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        {calls.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No calls yet</p>
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/50"
              data-testid={`call-item-${call.id}`}
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
                  {call.duration > 0 && (
                    <>
                      <span>·</span>
                      <span>{formatDuration(call.duration)}</span>
                    </>
                  )}
                </div>
                {call.recording && (
                  <div className="mt-2">
                    <AudioPlayer url={call.recording.url} title={`Call with ${call.user.name}`} />
                  </div>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                data-testid={`button-call-type-${call.id}`}
              >
                {call.type === "video" ? (
                  <Video className="h-5 w-5 text-primary" />
                ) : (
                  <Phone className="h-5 w-5 text-primary" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg"
          onClick={() => setVideoCallOpen(true)}
        >
          <Video className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg"
          onClick={() => setVoiceCallOpen(true)}
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>

      {/* Video Call Modal */}
      <Dialog open={videoCallOpen} onOpenChange={setVideoCallOpen}>
        <DialogContent className="max-w-2xl h-[600px] p-0 overflow-hidden border-0">
          <div className="flex flex-col items-center justify-center h-full bg-black relative">
            {/* Video placeholder area */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <UserAvatar name="Contact" size="lg" className="mx-auto mb-4 w-24 h-24" />
                <h2 className="text-2xl font-semibold mb-2 text-white">Video Call</h2>
                <p className="text-gray-400 mb-8">Calling...</p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
                onClick={() => setVideoCallOpen(false)}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Call Modal */}
      <Dialog open={voiceCallOpen} onOpenChange={setVoiceCallOpen}>
        <DialogContent className="max-w-md border-0">
          <div className="flex flex-col items-center justify-center py-8">
            <UserAvatar name="Contact" size="lg" className="w-24 h-24 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Voice Call</h2>
            <p className="text-muted-foreground mb-8">Calling...</p>
            
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
              onClick={() => setVoiceCallOpen(false)}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Persistent Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/60 backdrop-blur-xl z-50">
        <div className="flex items-center justify-around p-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setLocation("/")}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Chats</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setLocation("/status")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Status</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
          >
            <Phone className="h-5 w-5" />
            <span className="text-xs">Calls</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
