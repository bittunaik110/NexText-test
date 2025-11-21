import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl" | "default" | "large" | "xlarge";
  online?: boolean;
  className?: string;
}

export default function UserAvatar({ src, name, size = "md", online, className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    md: "h-10 w-10",
    large: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
    xlarge: "h-32 w-32",
  };

  const dotSizeClasses = {
    sm: "h-2 w-2",
    default: "h-2.5 w-2.5",
    md: "h-2.5 w-2.5",
    large: "h-3 w-3",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
    xlarge: "h-5 w-5",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative", className)}>
      <Avatar
        className={cn(
          sizeClasses[size],
          online && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <AvatarImage src={src} alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {online && (
        <div className="absolute bottom-0 right-0">
          <span className={cn("relative flex", dotSizeClasses[size])}>
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-status-online opacity-75"></span>
            <span className={cn("relative inline-flex rounded-full bg-status-online", dotSizeClasses[size])}></span>
          </span>
        </div>
      )}
    </div>
  );
}
