"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Bot, Wrench, BookText, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/ai-elements/MarkdownRenderer";
import { AgentAvatar } from "./AgentAvatar";
import { fetchAgentDetails, type AgentDetail } from "@/lib/agents";

interface AgentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: number;
}

const typeLabels: Record<string, string> = {
  DEFAULT: "默认",
  REMOTE: "远程",
  LOCAL: "本地",
};

export function AgentDetailDialog({ open, onOpenChange, agentId }: AgentDetailDialogProps) {
  const [detail, setDetail] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDetail = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await fetchAgentDetails(id);
      setDetail(data);
    } catch {
      toast.error("加载智能体详情失败");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [onOpenChange]);

  useEffect(() => {
    if (!open || !agentId) return;
    loadDetail(agentId);
  }, [open, agentId, loadDetail]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>智能体详情</DialogTitle>
        </DialogHeader>

        {loading || !detail ? (
          <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            加载中...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-5 py-2">
            {/* Avatar + name + meta */}
            <div className="flex items-center gap-4">
              <AgentAvatar avatar={detail.avatar} size="lg" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{detail.name}</h3>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {detail.type ? (typeLabels[detail.type] ?? detail.type) : ""}{detail.modelName ? ` · ${detail.modelName}` : ""}
                  <span className="mx-1.5">·</span>
                  <Bot className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                  知识库:
                  <span className={detail.enableKnowledgeBase ? "text-green-600 font-medium ml-0.5" : "text-muted-foreground/50 ml-0.5"}>
                    {detail.enableKnowledgeBase ? "已开启" : "未开启"}
                  </span>
                </p>
              </div>
            </div>

            {/* Description */}
            {detail.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {detail.description}
              </p>
            )}

            {/* Skills */}
            <div>
              <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                技能
              </h4>
              {detail.skills && detail.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {detail.skills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary"
                    >
                      <Wrench className="w-3 h-3" />
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">未配置技能</p>
              )}
            </div>

            {/* System prompt */}
            <div>
              <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-2 flex items-center gap-1.5">
                <BookText className="w-3.5 h-3.5" />
                系统提示词
              </h4>
              {detail.systemPrompt ? (
                <div className="rounded-lg border border-sidebar-border/20 bg-background/50 px-4 py-3 text-sm prose prose-sm max-w-none dark:prose-invert">
                  <MarkdownRenderer content={detail.systemPrompt} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">未设置</p>
              )}
            </div>

            {/* Trigger template */}
            <div>
              <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                触发模板
              </h4>
              {detail.variables && detail.variables.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-2">
                    模板变量
                  </h4>
                  <div className="rounded-lg border border-sidebar-border/20 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sidebar-border/20 bg-sidebar/20">
                          <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2 w-[140px]">变量名</th>
                          <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2 w-[90px]">类型</th>
                          <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2">描述</th>
                          <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2 w-[110px]">默认值</th>
                          <th className="text-center text-xs text-muted-foreground/60 font-medium px-4 py-2 w-[50px]">可选</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.variables.map((v, i) => (
                          <tr key={i} className="border-b border-sidebar-border/10 last:border-b-0">
                            <td className="px-4 py-2.5 text-sm font-mono">{v.key}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary">
                                {v.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">
                              {v.description || '—'}
                            </td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">
                              {v.defaultValue || '—'}
                            </td>
                            <td className="px-4 py-2.5 text-center text-sm text-muted-foreground">
                              {v.isOptional ? '是' : '否'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <h4 className="text-xs font-medium text-sidebar-foreground/70 mb-2">
                模板内容
              </h4>
              {detail.triggerTemplate ? (
                <div className="rounded-lg border border-sidebar-border/20 bg-background/50 px-4 py-3 text-sm font-mono whitespace-pre-wrap">
                  {detail.triggerTemplate}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">未设置</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
