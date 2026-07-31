"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { AgentCard } from "./AgentCard";
import type { AgentItem } from "@/lib/agents";

interface AgentTabContentProps {
  agents: AgentItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onCardClick?: (agent: AgentItem) => void;
  onCardConfigure?: (agent: AgentItem) => void;
  onCardDelete?: (agent: AgentItem) => void;
}

export function AgentTabContent({ agents, loading, hasMore, onLoadMore, onCardClick, onCardConfigure, onCardDelete }: AgentTabContentProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
      { threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!loading && agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
        <Bot className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">暂无智能体</p>
        <p className="text-xs mt-1">点击右上角「新建智能体」开始</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => onCardClick?.(agent)}
            onConfigure={onCardConfigure ? () => onCardConfigure(agent) : undefined}
            onDelete={onCardDelete ? () => onCardDelete(agent) : undefined}
          />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}
