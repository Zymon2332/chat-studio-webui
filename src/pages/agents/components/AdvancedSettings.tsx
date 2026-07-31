"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ModelPicker } from "./ModelPicker";

interface AdvancedSettingsProps {
  rollbackModel: string;
  onRollbackModelChange: (v: string) => void;
  maxTokensPerSession: number;
  onMaxTokensChange: (v: number) => void;
  rateLimit: number;
  onRateLimitChange: (v: number) => void;
  maxConcurrency: number;
  onMaxConcurrencyChange: (v: number) => void;
  kbEnabled: boolean;
  onKbEnabledChange: (v: boolean) => void;
}

export function AdvancedSettings(props: AdvancedSettingsProps) {
  return (
    <Collapsible className="rounded-2xl border border-sidebar-border/20">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-3.5 text-left group cursor-pointer">
        <span className="text-sm font-medium text-sidebar-foreground/80">
          高级设置
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-5 pb-5 space-y-6 border-t border-sidebar-border/20 pt-4">
          {/* 备用模型 */}
          <div>
            <h3 className="text-xs font-medium text-sidebar-foreground/70 mb-3">
              备用模型
            </h3>
            <ModelPicker
              value={props.rollbackModel}
              onChange={props.onRollbackModelChange}
            />
            <p className="text-xs text-muted-foreground/60 mt-1.5">
              主模型调用失败时自动切换到此模型
            </p>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-sidebar-border/10" />

          {/* 成本与速率 */}
          <div>
            <h3 className="text-xs font-medium text-sidebar-foreground/70 mb-3">
              成本与速率
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">
                  单次对话消耗
                </span>
                <input
                  type="number"
                  value={props.maxTokensPerSession}
                  onChange={(e) => props.onMaxTokensChange(Number(e.target.value))}
                  className="w-24 h-8 rounded-lg border border-sidebar-border/20 bg-background/50 px-3 text-sm text-center focus:outline-none focus:border-primary/40"
                />
                <span className="text-xs text-muted-foreground">tokens</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">
                  每分钟请求
                </span>
                <input
                  type="number"
                  value={props.rateLimit}
                  onChange={(e) => props.onRateLimitChange(Number(e.target.value))}
                  className="w-24 h-8 rounded-lg border border-sidebar-border/20 bg-background/50 px-3 text-sm text-center focus:outline-none focus:border-primary/40"
                />
                <span className="text-xs text-muted-foreground">次/分钟</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">
                  最大并发
                </span>
                <input
                  type="number"
                  value={props.maxConcurrency}
                  onChange={(e) => props.onMaxConcurrencyChange(Number(e.target.value))}
                  className="w-24 h-8 rounded-lg border border-sidebar-border/20 bg-background/50 px-3 text-sm text-center focus:outline-none focus:border-primary/40"
                />
                <span className="text-xs text-muted-foreground">个对话</span>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-sidebar-border/10" />

          {/* 知识库 */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-sidebar-foreground/70">
                知识库
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={props.kbEnabled}
                  onChange={(e) => props.onKbEnabledChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full bg-sidebar-border/30 peer-checked:bg-primary/70 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1">
              开启后智能体可在对话中检索知识库内容作为参考
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
