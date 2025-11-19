
import { Button } from "@/components/ui/button";
import { MapPin, Gamepad2, Bell, FileImage, Music, Palette, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onActionSelect: (action: string) => void;
}

const quickActions = [
  { id: "location", label: "Location", icon: MapPin, color: "text-blue-500" },
  { id: "games", label: "Games", icon: Gamepad2, color: "text-purple-500" },
  { id: "reminders", label: "Reminders", icon: Bell, color: "text-yellow-500" },
  { id: "gifs", label: "GIFs", icon: FileImage, color: "text-pink-500" },
  { id: "music", label: "Music", icon: Music, color: "text-red-500" },
  { id: "stickers", label: "Stickers", icon: Palette, color: "text-green-500" },
];

export default function QuickActions({ onActionSelect }: QuickActionsProps) {
  return (
    <div className="border-t border-border bg-card/60 backdrop-blur-xl p-3">
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="ghost"
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={() => onActionSelect(action.id)}
            >
              <div className={cn("w-12 h-12 rounded-full bg-muted flex items-center justify-center", action.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs text-muted-foreground">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
