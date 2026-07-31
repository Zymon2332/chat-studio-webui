"use client";

import { cn } from "@/lib/utils";
import { Plus, Package } from "lucide-react";
import type { SkillPackageItem } from "@/lib/skills";

interface PackageTabContentProps {
  packages: SkillPackageItem[];
  total: number;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onCreate?: () => void;
  onPackageClick?: (pkg: SkillPackageItem) => void;
}

export function PackageTabContent({
  packages,
  total,
  loading,
  hasMore,
  onLoadMore,
  onCreate,
  onPackageClick,
}: PackageTabContentProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground/60 mb-4">
        共 {total} 个技能包
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => onPackageClick?.(pkg)}
            className={cn(
              "flex flex-col p-5 rounded-2xl",
              "bg-sidebar/80 backdrop-blur-xl",
              "border border-sidebar-border/40",
              "transition-all duration-200",
              "hover:border-sidebar-border/80 hover:shadow-lg hover:-translate-y-0.5",
              "group relative overflow-hidden cursor-pointer",
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>

            <h3 className="text-sm font-medium text-sidebar-foreground/90 truncate">
              {pkg.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {pkg.description}
            </p>

            <div className="mt-auto pt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {pkg.skillCount} 个技能
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                {pkg.createdTime.slice(0, 10)}
              </span>
            </div>
          </div>
        ))}

        <button
          onClick={onCreate}
          className={cn(
            "flex flex-col items-center justify-center p-5 rounded-2xl min-h-[200px]",
            "border-2 border-dashed border-sidebar-border/30",
            "hover:border-sidebar-border/60 hover:bg-sidebar/40",
            "transition-all duration-200 cursor-pointer group",
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-sidebar-accent/50 flex items-center justify-center mb-3 group-hover:bg-sidebar-accent transition-colors">
            <Plus className="w-6 h-6 text-muted-foreground/50 group-hover:text-muted-foreground/80 transition-colors" />
          </div>
          <span className="text-sm font-medium text-muted-foreground/60 group-hover:text-muted-foreground/90 transition-colors">
            创建技能包
          </span>
          <span className="text-xs text-muted-foreground/40 mt-1">
            组合多个技能使用
          </span>
        </button>
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
