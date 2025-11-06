import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ children, className, onClick, hover = false }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl transition-all duration-300",
        hover && "hover:translate-y-[-4px] hover:shadow-lg hover-elevate cursor-pointer",
        className
      )}
      style={{
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {children}
    </div>
  );
}
