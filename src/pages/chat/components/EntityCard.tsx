"use client";

import { cn } from "@/lib/utils";
import { Bot, Users, MessageSquare } from "lucide-react";

interface EntityCardProps {
  name: string;
  type: "agent" | "team";
  subtitle: string;
  statusColor?: string;
  gradientFrom: string;
  gradientTo: string;
  onClick: () => void;
}

export function EntityCard({
  name,
  type,
  subtitle,
  statusColor,
  gradientFrom,
  gradientTo,
  onClick,
}: EntityCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center w-40 shrink-0 p-5 rounded-2xl text-center",
        "bg-sidebar/80 backdrop-blur-sm",
        "border border-sidebar-border/30",
        "transition-all duration-200",
        "hover:border-sidebar-border/60 hover:shadow-md hover:-translate-y-0.5",
        "group cursor-pointer",
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5",
          gradientFrom,
          gradientTo,
        )}
      >
        {type === "agent" ? (
          <Bot className="w-7 h-7 text-white" />
        ) : (
          <Users className="w-7 h-7 text-white" />
        )}
      </div>

      <span className="text-sm font-medium text-sidebar-foreground/90 truncate w-full">
        {name}
      </span>

      <div className="flex items-center gap-1.5 mt-1.5">
        {statusColor && (
          <span className={cn("w-1.5 h-1.5 rounded-full", statusColor)} />
        )}
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>

      <div className="mt-3.5 pt-3.5 border-t border-sidebar-border/20 w-full">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 group-hover:text-foreground/80 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          开始对话
        </div>
      </div>
    </button>
  );
}
