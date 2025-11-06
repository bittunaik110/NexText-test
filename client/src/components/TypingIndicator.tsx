import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export default function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1 px-4 py-3 rounded-3xl bg-card/60 backdrop-blur-xl border border-white/10 w-fit", className)}>
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-bounce-dot"></span>
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-bounce-dot [animation-delay:0.2s]"></span>
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-bounce-dot [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
}
