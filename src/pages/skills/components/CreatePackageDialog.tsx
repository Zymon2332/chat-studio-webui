"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchSkillPage, createSkillPackage, type SkillItem } from "@/lib/skills";

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePackageDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePackageDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchSkillPage({ pageNum: 1, pageSize: 200 })
      .then((res) => setSkills(res.records || []))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, [open]);

  const toggleSkill = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedIds.length === 0) return;
    try {
      await createSkillPackage({
        name: name.trim(),
        description: description.trim(),
        skillsIds: selectedIds,
      });
      toast.success("技能包创建成功");
      setName("");
      setDescription("");
      setSelectedIds([]);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("创建失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建技能包</DialogTitle>
          <DialogDescription>
            组合多个技能为一个技能包
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">技能包名称</Label>
            <Input
              id="pkg-name"
              placeholder="输入名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-desc">描述</Label>
            <Textarea
              id="pkg-desc"
              placeholder="描述这个技能包的用途"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none max-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>选择技能</Label>
            <div className="max-h-48 overflow-y-auto overflow-x-hidden space-y-1 rounded-lg border p-1">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  加载中...
                </div>
              ) : skills.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  暂无技能
                </div>
              ) : (
                skills.map((skill) => {
                  const skillId = Number(skill.id);
                  return (
                    <label
                      key={skill.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedIds.includes(skillId)}
                        onCheckedChange={() => toggleSkill(skillId)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{skill.name}</div>
                        <div className="text-[10px] text-muted-foreground/60 line-clamp-1">
                          {skill.description}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {selectedIds.length > 0 && (
            <p className="text-xs text-muted-foreground/60">
              已选 {selectedIds.length} 个技能
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || selectedIds.length === 0}
          >
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
