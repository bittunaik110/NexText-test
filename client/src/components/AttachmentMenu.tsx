import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Camera, Image as ImageIcon, FileText, Music, Mic, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentMenuProps {
  onGallerySelect: () => void;
  onDocumentSelect: () => void;
  onCameraSelect?: () => void;
  onVoiceSelect?: () => void;
  onAudioSelect?: () => void;
  onContactSelect?: () => void;
  onLocationSelect?: () => void;
}

const attachmentOptions = [
  { id: "camera", icon: Camera, label: "Camera", bgColor: "bg-red-500" },
  { id: "gallery", icon: ImageIcon, label: "Gallery", bgColor: "bg-purple-500" },
  { id: "document", icon: FileText, label: "Document", bgColor: "bg-blue-500" },
  { id: "contact", icon: User, label: "Contact", bgColor: "bg-green-500" },
  { id: "location", icon: MapPin, label: "Location", bgColor: "bg-orange-500" },
  { id: "audio", icon: Music, label: "Audio", bgColor: "bg-yellow-500" },
  { id: "voice", icon: Mic, label: "Voice", bgColor: "bg-pink-500" },
];

export default function AttachmentMenu({
  onGallerySelect,
  onDocumentSelect,
  onCameraSelect,
  onVoiceSelect,
  onAudioSelect,
  onContactSelect,
  onLocationSelect,
}: AttachmentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    const handlers: Record<string, () => void> = {
      camera: () => {
        onCameraSelect?.();
        console.log("📸 Camera feature coming soon");
      },
      gallery: () => {
        onGallerySelect();
      },
      document: () => {
        onDocumentSelect();
      },
      contact: () => {
        onContactSelect?.();
        console.log("👤 Contact share coming soon");
      },
      location: () => {
        onLocationSelect?.();
        console.log("📍 Location share coming soon");
      },
      audio: () => {
        onAudioSelect?.();
        console.log("🎵 Audio share coming soon");
      },
      voice: () => {
        onVoiceSelect?.();
        console.log("🎤 Voice message recording");
      },
    };
    handlers[id]?.();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 text-primary hover:bg-primary/10 rounded-full h-9 w-9"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-attachment-menu"
        title="Add attachment"
      >
        <Plus className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-12 -left-8 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-80">
          <div className="grid grid-cols-3 gap-4">
            {attachmentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  data-testid={`attachment-${option.id}`}
                >
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", option.bgColor)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
