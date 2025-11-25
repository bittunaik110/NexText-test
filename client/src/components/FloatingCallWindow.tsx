import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Minimize2, Maximize2, X, Phone } from "lucide-react";
import { CallData } from "@/hooks/useCallWithWebRTC";

interface FloatingCallWindowProps {
  isOpen: boolean;
  call: CallData | null;
  duration: number;
  onEndCall: () => void;
  callType: "audio" | "video";
  onSwitchCallType: (type: "audio" | "video") => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isVideoEnabled: boolean;
  onVideoToggle: () => void;
  isSpeakerOn: boolean;
  onSpeakerToggle: () => void;
}

export function FloatingCallWindow({
  isOpen,
  call,
  duration,
  onEndCall,
  callType,
  onSwitchCallType,
  isMuted,
  onMuteToggle,
  isVideoEnabled,
  onVideoToggle,
  isSpeakerOn,
  onSpeakerToggle,
}: FloatingCallWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    setIsDragging(true);
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        const newWidth = Math.max(250, e.clientX - rect.left);
        const newHeight = Math.max(350, e.clientY - rect.top);
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  if (!isOpen || !call) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed z-50 flex flex-col rounded-2xl shadow-2xl bg-gradient-to-br from-primary/95 to-accent/95 backdrop-blur border border-white/20 transition-all duration-300 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${isMinimized ? "opacity-60 hover:opacity-100" : "opacity-100"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? "200px" : `${size.width}px`,
        height: isMinimized ? "60px" : `${size.height}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing bg-white/10 rounded-t-2xl border-b border-white/10"
        onMouseDown={handleMouseDown}
        data-no-drag
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <UserAvatar name={call.recipientName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{call.recipientName}</p>
            <p className="text-xs text-white/70 font-mono">{formatDuration(duration)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2" data-no-drag>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onEndCall}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Avatar */}
          <div className="mb-4">
            <UserAvatar
              name={call.recipientName}
              size="lg"
              className="w-20 h-20"
            />
          </div>

          {/* Call Info */}
          <h2 className="text-lg font-semibold text-white mb-1 text-center">{call.recipientName}</h2>
          <p className="text-sm text-white/70 mb-6">{callType === "video" ? "Video Call" : "Voice Call"}</p>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4 w-full px-2">
            {/* Mute Button */}
            <Button
              size="icon"
              variant="ghost"
              className={`h-12 w-12 rounded-full ${
                isMuted
                  ? "bg-red-500/80 hover:bg-red-600 text-white"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
              onClick={onMuteToggle}
              data-testid="button-toggle-mute"
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Video Button */}
            <Button
              size="icon"
              variant="ghost"
              className={`h-12 w-12 rounded-full ${
                isVideoEnabled
                  ? "bg-white/20 hover:bg-white/30 text-white"
                  : "bg-red-500/80 hover:bg-red-600 text-white"
              }`}
              onClick={onVideoToggle}
              data-testid="button-toggle-video"
            >
              {isVideoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            {/* Speaker Button */}
            <Button
              size="icon"
              variant="ghost"
              className={`h-12 w-12 rounded-full ${
                isSpeakerOn
                  ? "bg-white/20 hover:bg-white/30 text-white"
                  : "bg-orange-500/80 hover:bg-orange-600 text-white"
              }`}
              onClick={onSpeakerToggle}
              data-testid="button-toggle-speaker"
            >
              {isSpeakerOn ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Switch Call Type Button */}
          <Button
            variant="outline"
            size="sm"
            className="mb-4 w-full text-white border-white/30 hover:bg-white/10"
            onClick={() => onSwitchCallType(callType === "audio" ? "video" : "audio")}
            data-testid="button-switch-call-type"
          >
            {callType === "audio" ? (
              <>
                <Video className="h-4 w-4 mr-2" />
                Switch to Video
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Switch to Voice
              </>
            )}
          </Button>

          {/* End Call Button */}
          <Button
            size="lg"
            className="w-full h-12 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold"
            onClick={onEndCall}
            data-testid="button-end-call"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            End Call
          </Button>
        </div>
      )}

      {/* Resize Handle */}
      {!isMinimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-white/30 cursor-se-resize rounded-bl-2xl hover:bg-white/50 transition-colors"
          onMouseDown={handleResizeStart}
          data-no-drag
        />
      )}
    </div>
  );
}
