"use client";

import { cn } from "@/lib/utils";
import { Settings, Brain, Wrench, Trash2 } from "lucide-react";
import type { AgentItem } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";

interface AgentCardProps {
  agent: AgentItem;
  onClick?: () => void;
  onConfigure?: () => void;
  onDelete?: () => void;
  className?: string;
}

const typeConfig: Record<string, { label: string; bar: string; badge: string }> = {
  DEFAULT: { label: "默认", bar: "bg-blue-500", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  REMOTE: { label: "远程", bar: "bg-purple-500", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  LOCAL: { label: "本地", bar: "bg-green-500", badge: "bg-green-500/10 text-green-600 dark:text-green-400" },
};

export function AgentCard({ agent, onClick, onConfigure, onDelete, className }: AgentCardProps) {
  const tc = typeConfig[agent.type];

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden",
        "bg-sidebar/80 backdrop-blur-xl",
        "border border-sidebar-border/40",
        "transition-all duration-200",
        "hover:border-sidebar-border/80 hover:shadow-lg hover:-translate-y-0.5",
        "group relative cursor-pointer",
        className,
      )}
    >
      {/* Top color bar */}
      <div className={cn("h-1 shrink-0", tc.bar)} />

      {/* Hover actions */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-2">
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除
          </button>
        )}
        {onConfigure && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfigure();
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            配置
          </button>
        )}
      </div>

      <div className="flex flex-col p-6 flex-1">
        {/* Avatar + name row */}
        <div className="flex items-center gap-4 mb-3">
          <AgentAvatar avatar={agent.avatar} type={agent.type} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-sidebar-foreground/90 truncate">
              {agent.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
          {agent.description || "暂无描述"}
        </p>

        {/* Type badge */}
        <span className={cn("inline-flex self-start px-2.5 py-0.5 rounded-full text-xs font-medium mb-3", tc.badge)}>
          {tc.label}
        </span>

        {/* Divider */}
        <div className="border-t border-sidebar-border/20 -mx-6 mb-3" />

        {/* Bottom row: model + skills */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
          {agent.modelName && (
            <span className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              {agent.modelName}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            {agent.skillsCount ?? 0} 个技能
          </span>
        </div>

        {/* Updated time */}
        {agent.updatedTime && (
          <p className="text-[10px] text-muted-foreground/50 mt-2">
            更新于 {agent.updatedTime.slice(0, 10)}
          </p>
        )}
      </div>
    </div>
  );
}
