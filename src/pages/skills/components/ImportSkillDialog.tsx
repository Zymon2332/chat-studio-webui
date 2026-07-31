"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Upload, Loader2 } from "lucide-react";
import { fetchPostSignature, uploadFileToS3, confirmUpload } from "@/lib/common";
import { createSkill } from "@/lib/skills";

interface ImportSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportSkillDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportSkillDialogProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setIsUploading(false);
  };

  const handleFileChange = async (f: File | null) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || ext !== "zip") {
      toast.error("仅支持 .zip 格式");
      return;
    }

    setIsUploading(true);

    try {
      const signature = await fetchPostSignature({
        fileOriginalName: f.name,
        contentType: f.type || "application/zip",
        appId: "SKILLS",
      });

      await uploadFileToS3(f, f.type || "application/zip", signature);

      const uploadId = await confirmUpload({
        objectKey: signature.fields.key,
        originalFileName: f.name,
        taskId: signature.taskId,
        appId: "SKILLS",
      });

      await createSkill(uploadId);
      toast.success("技能导入成功");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("技能导入失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isUploading) onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>导入技能</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && inputRef.current?.click()}
            className={cn(
              "rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
              dragOver
                ? "border-primary/50 bg-primary/5"
                : "border-sidebar-border/30 hover:border-sidebar-border/50 hover:bg-sidebar/30",
              isUploading && "pointer-events-none opacity-60",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-muted-foreground/40 animate-spin" />
                <p className="text-sm text-muted-foreground/70">正在导入...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm text-muted-foreground/70">
                    拖拽文件到此处，或<span className="text-primary cursor-pointer">点击选择</span>
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    支持 .zip 格式
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 text-muted-foreground">
            <p className="font-medium text-foreground/80">技能包要求：</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>压缩包内必须包含 SKILL.md 文件</li>
              <li>SKILL.md 头部需包含 YAML 格式的 name（技能名称）和 description（技能描述）</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
