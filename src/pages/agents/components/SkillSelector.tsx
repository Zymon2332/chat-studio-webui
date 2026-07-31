"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  X, Plus, Package,
  Search, Loader2, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  fetchSkillPage, fetchSkillPackagePage, fetchPackageSkills,
  type SkillItem, type SkillPackageItem,
} from "@/lib/skills";

interface SkillSelectorProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

interface PackageUIItem {
  item: SkillPackageItem;
  skills: SkillItem[];
  skillsLoaded: boolean;
}

interface SelectedPackage {
  id: number;
  name: string;
  skills: SkillItem[];
}

const PAGE_SIZE = 20;

export function SkillSelector({ selected, onChange }: SkillSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"skills" | "packages">("skills");
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);
  const [allPackages, setAllPackages] = useState<SkillPackageItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState<{ skills: boolean; packages: boolean }>({
    skills: false,
    packages: false,
  });
  const [pageState, setPageState] = useState<{
    skills: { pageNum: number; total: number };
    packages: { pageNum: number; total: number };
  }>({
    skills: { pageNum: 0, total: 0 },
    packages: { pageNum: 0, total: 0 },
  });
  const [packageStates, setPackageStates] = useState<Map<number, PackageUIItem>>(new Map());
  const [selectedPackages, setSelectedPackages] = useState<Map<number, SelectedPackage>>(new Map());
  const [individuallyToggled, setIndividuallyToggled] = useState<Set<string>>(new Set());
  const initialLoadedRef = useRef(false);
  const loadingRef = useRef({ skills: false, packages: false });
  const loadMoreRef = useRef<() => void>(() => {});

  const loadInitialData = useCallback(async (selectedSkills: string[]) => {
    setIndividuallyToggled(new Set(selectedSkills));
    try {
      const result = await fetchSkillPage({ pageNum: 1, pageSize: Math.max(PAGE_SIZE, selectedSkills.length) });
      setAllSkills(result.records || []);
    } catch {
      // Silently fail — initial load is best-effort
    }
  }, []);

  useEffect(() => {
    if (selected.length > 0 && !initialLoadedRef.current) {
      initialLoadedRef.current = true;
      loadInitialData(selected);
    }
  }, [selected, loadInitialData]);

  // --- Pagination ---

  const loadFirstPage = useCallback(async () => {
    setInitialLoading(true);
    setSearchQuery("");
    setActiveTab("skills");
    setAllSkills([]);
    setAllPackages([]);
    setPackageStates(new Map());
    setPageState({ skills: { pageNum: 0, total: 0 }, packages: { pageNum: 0, total: 0 } });

    try {
      const [sr, pr] = await Promise.all([
        fetchSkillPage({ pageNum: 1, pageSize: PAGE_SIZE }),
        fetchSkillPackagePage({ pageNum: 1, pageSize: PAGE_SIZE }),
      ]);
      const skillRecords = sr.records || [];
      const pkgRecords = pr.records || [];

      setAllSkills(skillRecords);
      setAllPackages(pkgRecords);
      setPageState({
        skills: { pageNum: 1, total: sr.total || 0 },
        packages: { pageNum: 1, total: pr.total || 0 },
      });

      const map = new Map<number, PackageUIItem>();
      for (const pkg of pkgRecords) {
        map.set(pkg.id, { item: pkg, skills: [], skillsLoaded: false });
      }
      setPackageStates(map);
    } catch {
      setAllSkills([]);
      setAllPackages([]);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadFirstPage();
  }, [open, loadFirstPage]);

  const loadMoreSkills = useCallback(async () => {
    if (loadingRef.current.skills) return;
    const nextPage = pageState.skills.pageNum + 1;
    loadingRef.current.skills = true;
    setLoadingMore((prev) => ({ ...prev, skills: true }));
    try {
      const result = await fetchSkillPage({ pageNum: nextPage, pageSize: PAGE_SIZE });
      setAllSkills((prev) => [...prev, ...(result.records || [])]);
      setPageState((prev) => ({
        ...prev,
        skills: { pageNum: nextPage, total: result.total || prev.skills.total || 0 },
      }));
    } catch {
      // Silently fail
    }
    loadingRef.current.skills = false;
    setLoadingMore((prev) => ({ ...prev, skills: false }));
  }, [pageState.skills.pageNum]);

  const loadMorePackages = useCallback(async () => {
    if (loadingRef.current.packages) return;
    const nextPage = pageState.packages.pageNum + 1;
    loadingRef.current.packages = true;
    setLoadingMore((prev) => ({ ...prev, packages: true }));
    try {
      const result = await fetchSkillPackagePage({ pageNum: nextPage, pageSize: PAGE_SIZE });
      const newPackages = result.records || [];
      setAllPackages((prev) => [...prev, ...newPackages]);
      setPageState((prev) => ({
        ...prev,
        packages: { pageNum: nextPage, total: result.total || prev.packages.total || 0 },
      }));
      setPackageStates((prev) => {
        const next = new Map(prev);
        for (const pkg of newPackages) {
          next.set(pkg.id, { item: pkg, skills: [], skillsLoaded: false });
        }
        return next;
      });
    } catch {
      // Silently fail
    }
    loadingRef.current.packages = false;
    setLoadingMore((prev) => ({ ...prev, packages: false }));
  }, [pageState.packages.pageNum]);

  // Keep loadMoreRef up-to-date so IntersectionObserver always calls the latest logic
  useEffect(() => {
    loadMoreRef.current = () => {
      if (initialLoading) return;
      if (searchQuery.trim()) return;

      const loading = loadingRef.current;
      const hasMoreSkills = pageState.skills.total > 0 && allSkills.length < pageState.skills.total;
      const hasMorePackages = pageState.packages.total > 0 && allPackages.length < pageState.packages.total;

      if (activeTab === "skills" && hasMoreSkills && !loading.skills) {
        loadMoreSkills();
      } else if (activeTab === "packages" && hasMorePackages && !loading.packages) {
        loadMorePackages();
      }
    };
  });

  // Observer cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node || !open) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreRef.current();
          }
        },
        { threshold: 0.01 },
      );
      observerRef.current.observe(node);
    },
    [open],
  );

  // --- Skill toggle ---

  const toggleSkill = useCallback(
    (id: string) => {
      setIndividuallyToggled((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      onChange(
        selected.includes(id)
          ? selected.filter((s) => s !== id)
          : [...selected, id],
      );
    },
    [selected, onChange],
  );

  // --- Package selection ---

  const togglePackage = useCallback(
    async (pkg: SkillPackageItem, shouldSelect: boolean) => {
      if (shouldSelect) {
        let skills: SkillItem[];
        const cached = packageStates.get(pkg.id);
        if (cached?.skillsLoaded) {
          skills = cached.skills;
        } else {
          try {
            skills = await fetchPackageSkills(pkg.id);
            setPackageStates((prev) => {
              const next = new Map(prev);
              next.set(pkg.id, {
                ...next.get(pkg.id)!,
                skills,
                skillsLoaded: true,
              });
              return next;
            });
          } catch {
            return;
          }
        }

        setSelectedPackages((prev) => {
          const next = new Map(prev);
          next.set(pkg.id, { id: pkg.id, name: pkg.name, skills });
          return next;
        });

        const newIds = skills.map((s) => s.id).filter((id) => !selected.includes(id));
        if (newIds.length > 0) {
          onChange([...selected, ...newIds]);
        }
      } else {
        const entry = selectedPackages.get(pkg.id);
        if (!entry) return;
        const pkgSkillIds = new Set(entry.skills.map((s) => s.id));

        const otherPkgSkills = new Set<string>();
        for (const [id, p] of selectedPackages) {
          if (id !== pkg.id) {
            p.skills.forEach((s) => otherPkgSkills.add(s.id));
          }
        }

        const remaining = selected.filter((id) => {
          if (!pkgSkillIds.has(id)) return true;
          if (otherPkgSkills.has(id)) return true;
          if (individuallyToggled.has(id)) return true;
          return false;
        });

        setSelectedPackages((prev) => {
          const next = new Map(prev);
          next.delete(pkg.id);
          return next;
        });
        onChange(remaining);
      }
    },
    [selected, onChange, selectedPackages, packageStates, individuallyToggled],
  );

  const getPackageCheckState = useCallback(
    (_pkgId: number, skillIds: string[]): boolean | "indeterminate" => {
      if (!skillIds.length) return false;
      const count = skillIds.filter((id) => selected.includes(id)).length;
      if (count === 0) return false;
      if (count === skillIds.length) return true;
      return "indeterminate";
    },
    [selected],
  );

  const handleClearAll = useCallback(() => {
    setSelectedPackages(new Map());
    setIndividuallyToggled(new Set());
    onChange([]);
  }, [onChange]);

  // --- Filtering ---

  const q = searchQuery.toLowerCase().trim();

  const filteredSkills = useMemo(() => {
    if (!q) return allSkills;
    return allSkills.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }, [allSkills, q]);

  const filteredPackages = useMemo(() => {
    if (!q) return allPackages;
    return allPackages.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [allPackages, q]);

  const hasMore = useMemo(() => {
    if (q) return false;
    if (activeTab === "skills") {
      return pageState.skills.total > 0 && allSkills.length < pageState.skills.total;
    }
    return pageState.packages.total > 0 && allPackages.length < pageState.packages.total;
  }, [activeTab, allSkills.length, allPackages.length, pageState, q]);

  // --- Render helpers ---

  const getSkillName = useCallback(
    (id: string): string | null => {
      const fromAll = allSkills.find((s) => s.id === id);
      if (fromAll) return fromAll.name;
      for (const pkg of selectedPackages.values()) {
        const found = pkg.skills.find((s) => s.id === id);
        if (found) return found.name;
      }
      return null;
    },
    [allSkills, selectedPackages],
  );

  const renderSkillCheckbox = (skill: SkillItem) => (
    <label
      key={skill.id}
      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
    >
      <Checkbox
        checked={selected.includes(skill.id)}
        onCheckedChange={() => toggleSkill(skill.id)}
      />
      <Wrench className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm">{skill.name}</div>
        <div className="text-[10px] text-muted-foreground/60 truncate">
          {skill.description}
        </div>
      </div>
    </label>
  );

  const renderPackageRow = (pkg: SkillPackageItem) => {
    const ps = packageStates.get(pkg.id);
    const skills = ps?.skills ?? [];
    const skillIds = skills.map((s) => s.id);
    const checkState = getPackageCheckState(pkg.id, skillIds);

    return (
      <div key={pkg.id} className="py-0.5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors">
          <Checkbox
            checked={checkState}
            onCheckedChange={() => {
              togglePackage(pkg, checkState !== true);
            }}
          />
          <Package className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm">{pkg.name}</div>
            <div className="text-[10px] text-muted-foreground/60">
              {pkg.skillCount} 个技能
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNoResults = () => (
    <div className="text-xs text-muted-foreground/50 text-center py-8">
      无匹配结果
    </div>
  );

  // --- Main render ---

  const hasSelection = selected.length > 0;

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/70">
          {hasSelection ? `已选 ${selected.length} 项` : "尚未添加技能"}
        </span>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground/50 hover:text-destructive transition-colors"
            >
              清空全部
            </button>
          )}
          <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
            >
              <Plus className="w-3 h-3" />
              添加
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            {/* Tabs */}
            <div className="flex border-b px-3 pt-2 pb-0 gap-0">
              {(["skills", "packages"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1.5 text-xs border-b-2 transition-colors -mb-px",
                    activeTab === tab
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "skills" ? "技能" : "技能包"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索技能或技能包..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-7 pr-3 text-xs rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-h-64 overflow-y-auto p-1">
              {initialLoading ? (
                <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  加载中...
                </div>
              ) : activeTab === "skills" ? (
                <div>
                  {filteredSkills.length === 0
                    ? renderNoResults()
                    : filteredSkills.map((s) => renderSkillCheckbox(s))}
                </div>
              ) : (
                <div>
                  {filteredPackages.length === 0
                    ? renderNoResults()
                    : filteredPackages.map(renderPackageRow)}
                </div>
              )}
              {hasMore && (
                <div ref={sentinelRef} className="flex items-center justify-center py-3">
                  {(loadingMore.skills || loadingMore.packages) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      加载更多...
                    </div>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        </div>
      </div>

      {/* Selected items — flow chips */}
      {hasSelection ? (
        <div className="flex flex-wrap items-start gap-1.5">
          {selected.map((id) => {
            const name = getSkillName(id);
            if (!name) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
              >
                <Wrench className="w-3 h-3" />
                {name}
                <button
                  type="button"
                  onClick={() => toggleSkill(id)}
                  className="ml-0.5 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50">
          <Wrench className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">未配置技能</p>
        </div>
      )}
    </div>
  );
}
