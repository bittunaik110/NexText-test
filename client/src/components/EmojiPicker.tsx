
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = {
  smileys: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖"],
  reactions: ["😮", "😯", "😲", "😳", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "😱", "😨", "😰", "😥", "😓"]
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="space-y-3">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 capitalize">
                {category}
              </p>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSelect(emoji);
                      setOpen(false);
                    }}
                    className="p-2 hover:bg-muted rounded text-2xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
