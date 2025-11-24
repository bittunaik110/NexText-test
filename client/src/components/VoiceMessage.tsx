import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, X, RotateCcw, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoiceMessageProps {
  onSend: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceMessage({ onSend, onCancel }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Clean up old recordings from localStorage
  useEffect(() => {
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("voiceRecord_temp_")) {
        const timestamp = parseInt(key.replace("voiceRecord_temp_", ""));
        if (now - timestamp > oneHourMs) {
          localStorage.removeItem(key);
        }
      }
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Save to localStorage temporarily
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          localStorage.setItem(`voiceRecord_temp_${Date.now()}`, JSON.stringify({
            data: base64,
            duration: duration,
            timestamp: Date.now()
          }));
        };
        reader.readAsDataURL(blob);
        
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setRecordingProgress(0);
      
      const timer = setInterval(() => {
        setDuration((d) => {
          const newDuration = d + 1;
          if (newDuration >= 60) {
            stopRecording();
            return 60;
          }
          setRecordingProgress((newDuration / 60) * 100);
          return newDuration;
        });
      }, 1000);
      durationTimerRef.current = timer as unknown as NodeJS.Timeout;
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record voice messages.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
  };

  const handleReset = () => {
    setAudioUrl(null);
    setDuration(0);
    setRecordingProgress(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSend = () => {
    if (audioUrl) {
      onSend(audioUrl, duration);
      toast({
        title: "Voice message sent!",
        description: `Recording ${formatTime(duration)} uploaded successfully.`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary p-4 shadow-xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-2xl mx-auto">
        {!audioUrl ? (
          <div className="flex flex-col gap-4">
            {/* Recording UI */}
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="default"
                className={cn(
                  "rounded-full shrink-0 h-12 w-12",
                  isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary hover:bg-blue-600"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                data-testid="button-voice-record"
              >
                {isRecording ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              {/* Recording Timer & Status */}
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground">
                  {isRecording ? "Recording..." : "Ready to record"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(duration)} recorded
                </div>
              </div>

              {/* Cancel Button */}
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 text-destructive hover:bg-destructive/10"
                onClick={onCancel}
                data-testid="button-cancel-voice"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Waveform/Progress Indicator */}
            {isRecording && (
              <div className="flex items-center gap-1 h-8 px-2 bg-primary/10 rounded-lg">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-full rounded-sm transition-all duration-100 bg-primary",
                      i > (recordingProgress / 100) * 12 ? "opacity-20" : "opacity-100"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Playback UI */}
            <div className="flex items-center gap-3">
              {/* Play Button */}
              <Button
                size="icon"
                variant="default"
                className="rounded-full bg-primary hover:bg-blue-600 shrink-0 h-10 w-10"
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play();
                    }
                    setIsPlaying(!isPlaying);
                  }
                }}
                data-testid="button-play-voice"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* Audio Player */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="flex-1 h-8"
                data-testid="audio-player"
              />

              {/* Duration Display */}
              <div className="text-sm font-semibold text-foreground min-w-fit">
                {formatTime(duration)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleReset}
                data-testid="button-retry-voice"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-blue-600 text-white gap-2"
                onClick={handleSend}
                data-testid="button-send-voice"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
