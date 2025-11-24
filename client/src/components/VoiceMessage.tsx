import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceMessageProps {
  onSend: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceMessage({ onSend, onCancel }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearTimeout(durationTimerRef.current);
    };
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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      const timer = setInterval(() => {
        setDuration((d) => {
          if (d >= 60) {
            stopRecording();
            return 60;
          }
          return d + 1;
        });
      }, 1000);
      durationTimerRef.current = timer;
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
  };

  const handleSend = () => {
    if (audioUrl) {
      onSend(audioUrl, duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-md mx-auto">
        {!audioUrl ? (
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="default"
              className={cn(
                "rounded-full",
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary"
              )}
              onClick={isRecording ? stopRecording : startRecording}
              data-testid="button-voice-record"
            >
              {isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {isRecording ? "Recording..." : "Press to record"}
              </div>
              {isRecording && (
                <div className="text-xs text-muted-foreground">
                  {formatTime(duration)}
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              data-testid="button-cancel-voice"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full text-primary"
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
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="flex-1"
              data-testid="audio-player"
            />
            <div className="text-sm font-medium text-foreground">
              {formatTime(duration)}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAudioUrl(null);
                setDuration(0);
              }}
              data-testid="button-reset-voice"
            >
              Reset
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-blue-600 text-white"
              onClick={handleSend}
              data-testid="button-send-voice"
            >
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
