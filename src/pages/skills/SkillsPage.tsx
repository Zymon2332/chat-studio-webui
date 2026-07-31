"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileTree, FileTreeFolder, FileTreeFile } from "@/components/ai-elements/file-tree";
import { fetchSkillPage, fetchSkillFiles, deleteSkill, fetchSkillPackagePage, fetchPackageSkills, deleteSkillPackage, updateSkillPackageSkills, type SkillItem, type SkillPackageItem } from "@/lib/skills";
import { SkillTabContent } from "./components/SkillTabContent";
import { PackageTabContent } from "./components/PackageTabContent";
import { ImportSkillDialog } from "./components/ImportSkillDialog";
import { CreatePackageDialog } from "./components/CreatePackageDialog";

const PAGE_SIZE = 20;

interface TreeNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: TreeNode[];
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of paths) {
    const parts = filePath.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const nodePath = parts.slice(0, i + 1).join("/");

      let existing = current.find((n) => n.name === part);
      if (!existing) {
        existing = isFile
          ? { name: part, type: "file", path: nodePath }
          : { name: part, type: "directory", path: nodePath, children: [] };
        current.push(existing);
      }
      if (!isFile && existing.children) {
        current = existing.children;
      }
    }
  }

  return root;
}

function renderTree(nodes: TreeNode[]): React.ReactNode {
  return nodes.map((node) =>
    node.type === "directory" ? (
      <FileTreeFolder key={node.path} path={node.path} name={node.name}>
        {renderTree(node.children!)}
      </FileTreeFolder>
    ) : (
      <FileTreeFile key={node.path} path={node.path} name={node.name} />
    ),
  );
}

function collectDirectoryPaths(nodes: TreeNode[]): Set<string> {
  const paths = new Set<string>();
  for (const node of nodes) {
    if (node.type === "directory") {
      paths.add(node.path);
      if (node.children) {
        for (const p of collectDirectoryPaths(node.children)) {
          paths.add(p);
        }
      }
    }
  }
  return paths;
}

export function SkillsPage() {
  const [tab, setTab] = useState("skills");
  const [importOpen, setImportOpen] = useState(false);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detailSkill, setDetailSkill] = useState<SkillItem | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [fileTreeLoading, setFileTreeLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SkillItem | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [packages, setPackages] = useState<SkillPackageItem[]>([]);
  const [packagesTotal, setPackagesTotal] = useState(0);
  const [packagesPageNum, setPackagesPageNum] = useState(1);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [createPackageOpen, setCreatePackageOpen] = useState(false);
  const [detailPackage, setDetailPackage] = useState<SkillPackageItem | null>(null);
  const [packageSkills, setPackageSkills] = useState<SkillItem[]>([]);
  const [packageSkillsLoading, setPackageSkillsLoading] = useState(false);
  const [packageDeleteTarget, setPackageDeleteTarget] = useState<SkillPackageItem | null>(null);
  const [editingSkillIds, setEditingSkillIds] = useState<Set<number>>(new Set());
  const [savingPackage, setSavingPackage] = useState(false);
  const [addableSkills, setAddableSkills] = useState<SkillItem[]>([]);
  const [addablePage, setAddablePage] = useState(1);
  const [addableTotal, setAddableTotal] = useState(0);
  const [addableLoading, setAddableLoading] = useState(false);

  const loadSkills = useCallback(async (page: number, append = false) => {
    setLoading(true);
    try {
      const result = await fetchSkillPage({ pageNum: page, pageSize: PAGE_SIZE });
      if (append) {
        setSkills((prev) => [...prev, ...(result.records || [])]);
      } else {
        setSkills(result.records || []);
      }
      setTotal(result.total || 0);
      setPageNum(page);
    } catch {
      if (!append) setSkills([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMore = () => {
    loadSkills(pageNum + 1, true);
  };

  const loadPackages = useCallback(async (page: number, append = false) => {
    setPackagesLoading(true);
    try {
      const result = await fetchSkillPackagePage({ pageNum: page, pageSize: PAGE_SIZE });
      if (append) {
        setPackages((prev) => [...prev, ...(result.records || [])]);
      } else {
        setPackages(result.records || []);
      }
      setPackagesTotal(result.total || 0);
      setPackagesPageNum(page);
    } catch {
      if (!append) setPackages([]);
      setPackagesTotal(0);
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills(1);
    loadPackages(1);
  }, [loadSkills, loadPackages]);

  const handleLoadMorePackages = () => {
    loadPackages(packagesPageNum + 1, true);
  };

  const handleSkillClick = async (skill: SkillItem) => {
    setDetailSkill(skill);
    setFileTreeLoading(true);
    setFileTree([]);
    try {
      const paths = await fetchSkillFiles(skill.id);
      const tree = buildTree(paths);
      setFileTree(tree);
      setExpandedPaths(collectDirectoryPaths(tree));
    } catch {
      setFileTree([]);
    } finally {
      setFileTreeLoading(false);
    }
  };

  const handlePackageClick = async (pkg: SkillPackageItem) => {
    setDetailPackage(pkg);
    setPackageSkillsLoading(true);
    setPackageSkills([]);
    setAddableSkills([]);
    setAddablePage(1);
    try {
      const [skills, pageResult] = await Promise.all([
        fetchPackageSkills(pkg.id),
        fetchSkillPage({ pageNum: 1, pageSize: 20 }),
      ]);
      setPackageSkills(skills || []);
      setAddableSkills(pageResult.records || []);
      setAddableTotal(pageResult.total || 0);
      setAddablePage(1);
      setEditingSkillIds(new Set((skills || []).map((s) => Number(s.id))));
    } catch {
      setPackageSkills([]);
      setAddableSkills([]);
      setAddableTotal(0);
      setEditingSkillIds(new Set());
    } finally {
      setPackageSkillsLoading(false);
    }
  };

  const loadAddableSkills = useCallback(async (page: number, append = false) => {
    setAddableLoading(true);
    try {
      const result = await fetchSkillPage({ pageNum: page, pageSize: 20 });
      if (append) {
        setAddableSkills((prev) => [...prev, ...(result.records || [])]);
      } else {
        setAddableSkills(result.records || []);
      }
      setAddableTotal(result.total || 0);
      setAddablePage(page);
    } catch {
      if (!append) setAddableSkills([]);
      setAddableTotal(0);
    } finally {
      setAddableLoading(false);
    }
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSkill(deleteTarget.id);
      toast.success("技能已删除");
      setDeleteTarget(null);
      setDetailSkill(null);
      loadSkills(1);
    } catch {
      toast.error("删除失败");
    }
  };

  const handleDeletePackage = async () => {
    if (!packageDeleteTarget) return;
    try {
      await deleteSkillPackage(packageDeleteTarget.id);
      toast.success("技能包已删除");
      setPackageDeleteTarget(null);
      setDetailPackage(null);
      loadPackages(1);
    } catch {
      toast.error("删除失败");
    }
  };

  const handleSavePackage = async () => {
    if (!detailPackage) return;
    setSavingPackage(true);
    try {
      await updateSkillPackageSkills(detailPackage.id, {
        skillsIds: Array.from(editingSkillIds),
      });
      toast.success("技能包已更新");
      setDetailPackage(null);
      loadPackages(1);
    } catch {
      toast.error("更新失败");
    } finally {
      setSavingPackage(false);
    }
  };

  const hasMore = skills.length < total;

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-6 pt-8 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setTab("skills")}
              className={cn(
                "text-xl transition-colors",
                tab === "skills"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              我的技能
            </button>
            <button
              onClick={() => setTab("packages")}
              className={cn(
                "text-xl transition-colors",
                tab === "packages"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              技能包
            </button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setImportOpen(true)}
          >
            <Plus className="w-4 h-4" />
            导入技能
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {tab === "skills" ? (
          <SkillTabContent
            skills={skills}
            total={total}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onSkillClick={handleSkillClick}
          />
        ) : (
          <PackageTabContent
            packages={packages}
            total={packagesTotal}
            loading={packagesLoading}
            hasMore={packages.length < packagesTotal}
            onLoadMore={handleLoadMorePackages}
            onCreate={() => setCreatePackageOpen(true)}
            onPackageClick={handlePackageClick}
          />
        )}
      </div>

      <ImportSkillDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => loadSkills(1)}
      />

      <CreatePackageDialog
        open={createPackageOpen}
        onOpenChange={setCreatePackageOpen}
        onSuccess={() => loadPackages(1)}
      />

      <Sheet open={!!detailSkill} onOpenChange={(v) => { if (!v) setDetailSkill(null); }}>
        <SheetContent side="right" className="w-96 sm:w-[440px] p-0">
          <div className="flex flex-col h-full">
          <SheetHeader className="px-5 pt-5 pb-0 shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {detailSkill?.name}
            </SheetTitle>
          </SheetHeader>

          {detailSkill && (
            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
              <p className="text-sm text-muted-foreground pt-3">{detailSkill.description}</p>
              <p className="text-xs text-muted-foreground/50">导入于 {detailSkill.createdTime.slice(0, 10)}</p>

              <div>
                <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-3">技能文件</h4>
                {fileTreeLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-sidebar-border/30 border-t-primary animate-spin" />
                    加载中...
                  </div>
                ) : fileTree.length > 0 ? (
                  <FileTree defaultExpanded={expandedPaths}>
                    {renderTree(fileTree)}
                  </FileTree>
                ) : (
                  <p className="text-sm text-muted-foreground/50 text-center py-8">暂无文件</p>
                )}
              </div>
            </div>
          )}

          <SheetFooter className="shrink-0 px-5 py-4 border-t border-sidebar-border/20">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={() => setDeleteTarget(detailSkill)}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              删除技能
            </Button>
          </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!detailPackage} onOpenChange={(v) => { if (!v) setDetailPackage(null); }}>
        <SheetContent side="right" className="w-96 sm:w-[440px] p-0">
          <div className="flex flex-col h-full">
          <SheetHeader className="px-5 pt-5 pb-0 shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {detailPackage?.name}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
            {detailPackage ? (
              <>
              <p className="text-sm text-muted-foreground pt-3">{detailPackage.description}</p>

              <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
                <span>创建于 {detailPackage.createdTime.slice(0, 10)}</span>
                <span>已选 {editingSkillIds.size} 个技能</span>
              </div>

              <div>
                <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-3">已有技能</h4>
                {editingSkillIds.size > 0 ? (
                  <div className="space-y-1">
                    {(() => {
                      const existingSkills: SkillItem[] = [];
                      const seen = new Set<number>();
                      for (const s of packageSkills) {
                        const id = Number(s.id);
                        if (editingSkillIds.has(id) && !seen.has(id)) {
                          existingSkills.push(s);
                          seen.add(id);
                        }
                      }
                      for (const s of addableSkills) {
                        const id = Number(s.id);
                        if (editingSkillIds.has(id) && !seen.has(id)) {
                          existingSkills.push(s);
                          seen.add(id);
                        }
                      }
                      return existingSkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-sidebar-border/20 bg-sidebar/40"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-sidebar-foreground/90 truncate">
                              {skill.name}
                            </div>
                            <div className="text-xs text-muted-foreground/60 truncate">
                              {skill.description}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Set(editingSkillIds);
                              next.delete(Number(skill.id));
                              setEditingSkillIds(next);
                            }}
                            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50">暂无技能，请从下方添加</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-3">添加技能</h4>
                {packageSkillsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-sidebar-border/30 border-t-primary animate-spin" />
                    加载中...
                  </div>
                ) : addableSkills.length > 0 ? (
                  <div className="space-y-1">
                    {addableSkills.map((skill) => {
                      const added = editingSkillIds.has(Number(skill.id));
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => {
                            if (added) return;
                            const next = new Set(editingSkillIds);
                            next.add(Number(skill.id));
                            setEditingSkillIds(next);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors cursor-pointer hover:bg-accent/50"
                        >
                          <span className={added ? "w-1.5 h-1.5 rounded-full shrink-0 bg-muted-foreground/30" : "w-1.5 h-1.5 rounded-full shrink-0 bg-primary"} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-sidebar-foreground/90 truncate">
                              {skill.name}
                            </div>
                            <div className="text-xs text-muted-foreground/60 truncate">
                              {skill.description}
                            </div>
                          </div>
                          {added && (
                            <span className="text-xs text-muted-foreground/50 shrink-0">
                              已添加
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {addablePage * 20 < addableTotal && (
                      <button
                        type="button"
                        onClick={() => loadAddableSkills(addablePage + 1, true)}
                        disabled={addableLoading}
                        className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground py-2 text-center transition-colors disabled:opacity-50"
                      >
                        {addableLoading ? "加载中..." : "加载更多 →"}
                      </button>
                    )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50 text-center py-8">暂无其他技能</p>
              )}
            </div>
              </>
            ) : null}
          </div>

          <SheetFooter className="shrink-0 px-5 py-4 border-t border-sidebar-border/20 flex-row items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={() => setPackageDeleteTarget(detailPackage)}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              删除技能包
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailPackage(null)}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSavePackage}
              disabled={savingPackage}
            >
              {savingPackage ? "保存中..." : "保存"}
            </Button>
          </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除技能「{deleteTarget?.name}」吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!packageDeleteTarget} onOpenChange={(v) => { if (!v) setPackageDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除技能包「{packageDeleteTarget?.name}」吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPackageDeleteTarget(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePackage} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
