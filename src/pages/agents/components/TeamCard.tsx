"use client";

import { cn } from "@/lib/utils";
import { Settings, Play } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { avatarUrls } from "@/lib/avatars";
import type { TeamItem } from "@/lib/agents";

interface TeamCardProps {
  team: TeamItem;
  className?: string;
}

export function TeamCard({ team, className }: TeamCardProps) {
  const displayAvatars = team.memberAvatars?.slice(0, 3) || [];
  const remaining = (team.memberCount ?? 0) - displayAvatars.length;

  return (
    <div
      className={cn(
        "flex flex-col p-5 rounded-2xl",
        "bg-sidebar/80 backdrop-blur-xl",
        "border border-sidebar-border/40",
        "transition-all duration-200",
        "hover:border-sidebar-border/80 hover:shadow-lg hover:-translate-y-0.5",
        "group relative overflow-hidden cursor-pointer",
        className,
      )}
    >
      {/* Member avatars stack — top */}
      {displayAvatars.length > 0 ? (
        <AvatarGroup className="mb-4">
          {displayAvatars.map((key, i) => (
              <Avatar key={i} size="default">
              <AvatarImage src={avatarUrls[key]} />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          ))}
          {remaining > 0 && <AvatarGroupCount>+{remaining}</AvatarGroupCount>}
        </AvatarGroup>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
          <span className="text-xs font-medium text-muted-foreground/50">{team.memberCount ?? 0}</span>
        </div>
      )}

      <h3 className="text-sm font-medium text-sidebar-foreground/90 truncate">
        {team.name}
      </h3>
      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
        {team.description}
      </p>

      {/* Updated time */}
      {team.updatedTime && (
        <p className="text-[10px] text-muted-foreground/50 mt-3">
          更新于 {team.updatedTime.slice(0, 10)}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-sidebar-border/20 flex items-center gap-1">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          配置
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          启动
        </button>
      </div>
    </div>
  );
}
