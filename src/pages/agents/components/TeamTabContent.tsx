"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { TeamCard } from "./TeamCard";
import type { TeamItem } from "@/lib/agents";

interface TeamTabContentProps {
  teams: TeamItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function TeamTabContent({ teams, loading, hasMore, onLoadMore }: TeamTabContentProps) {
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

  if (!loading && teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
        <Bot className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">暂无团队</p>
        <p className="text-xs mt-1">点击右上角「新建团队」开始</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}
