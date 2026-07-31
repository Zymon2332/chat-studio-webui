import { cn } from "@/lib/utils";
import { Bot, Globe, Laptop } from "lucide-react";
import { avatarUrls } from "@/lib/avatars";
import type { AgentType } from "@/lib/agents";

const typeIcon: Record<string, React.ElementType> = {
  DEFAULT: Bot,
  REMOTE: Globe,
  LOCAL: Laptop,
};

const sizeMap = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4", img: "w-8 h-8" },
  md: { container: "w-10 h-10", icon: "w-5 h-5", img: "w-10 h-10" },
  lg: { container: "w-20 h-20", icon: "w-10 h-10", img: "w-20 h-20" },
};

interface AgentAvatarProps {
  avatar?: string;
  type?: AgentType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AgentAvatar({ avatar, type, size = "md", className }: AgentAvatarProps) {
  const s = sizeMap[size];

  if (avatar && avatarUrls[avatar]) {
    return (
      <img
        src={avatarUrls[avatar]}
        alt=""
        className={cn(s.img, "rounded-xl object-contain shrink-0", className)}
      />
    );
  }

  const Icon = (type && typeIcon[type]) || Bot;
  return (
    <div
      className={cn(
        s.container,
        "rounded-xl bg-sidebar-accent/80 flex items-center justify-center shrink-0",
        className,
      )}
    >
      <Icon className={cn(s.icon, "text-muted-foreground")} />
    </div>
  );
}
