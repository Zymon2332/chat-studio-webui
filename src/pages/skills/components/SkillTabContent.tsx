"use client";

import { SkillCard } from "./SkillCard";
import type { SkillItem } from "@/lib/skills";

interface SkillTabContentProps {
  skills: SkillItem[];
  total: number;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSkillClick?: (skill: SkillItem) => void;
}

export function SkillTabContent({
  skills,
  total,
  loading,
  hasMore,
  onLoadMore,
  onSkillClick,
}: SkillTabContentProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground/60 mb-4">
        共 {total} 个技能
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            name={skill.name}
            description={skill.description}
            createdTime={skill.createdTime}
            onClick={() => onSkillClick?.(skill)}
          />
        ))}
      </div>
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 rounded-xl text-sm text-muted-foreground border border-sidebar-border/30 hover:border-sidebar-border/60 hover:text-foreground transition-colors disabled:opacity-50"
          >
            {loading ? "加载中..." : "加载更多"}
          </button>
        </div>
      )}
    </div>
  );
}
