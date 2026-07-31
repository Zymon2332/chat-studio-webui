"use client";

import { cn } from "@/lib/utils";
import { Wrench } from "lucide-react";

interface SkillCardProps {
  name: string;
  description: string;
  createdTime: string;
  onClick?: () => void;
  className?: string;
}

export function SkillCard({
  name,
  description,
  createdTime,
  onClick,
  className,
}: SkillCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col p-5 rounded-2xl",
        "bg-sidebar/80 backdrop-blur-xl",
        "border border-sidebar-border/40",
        "transition-all duration-200",
        "hover:border-sidebar-border/80 hover:shadow-lg hover:-translate-y-0.5",
        "group relative overflow-hidden",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A040]/20 to-[#D4A040]/5 flex items-center justify-center mb-4">
        <Wrench className="w-6 h-6 text-primary" />
      </div>

      <h3 className="text-sm font-medium text-sidebar-foreground/90 truncate">
        {name}
      </h3>
      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
        {description}
      </p>

      <p className="text-[11px] text-muted-foreground/50 mt-3">
        {createdTime.slice(0, 10)}
      </p>
    </div>
  );
}
