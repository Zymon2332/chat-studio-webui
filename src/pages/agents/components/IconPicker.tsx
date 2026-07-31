"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AgentAvatar } from "./AgentAvatar";
import { avatarKeys } from "@/lib/avatars";

interface IconPickerProps {
  selectedAvatar: string;
  onAvatarChange: (key: string) => void;
}

export function IconPicker({
  selectedAvatar,
  onAvatarChange,
}: IconPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center bg-sidebar/60 border border-sidebar-border/20 transition-all duration-300">
          <AgentAvatar avatar={selectedAvatar} size="lg" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex-1 flex gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none"
        >
          {avatarKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onAvatarChange(key)}
              className={cn(
                "shrink-0 w-13 h-13 rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all duration-150",
                selectedAvatar === key
                  ? "border-primary ring-2 ring-primary/20 scale-105"
                  : "border-transparent hover:border-sidebar-border/40 hover:scale-105",
              )}
            >
              <AgentAvatar avatar={key} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
