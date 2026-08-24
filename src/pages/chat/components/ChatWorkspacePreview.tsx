"use client";

import { memo, type RefObject } from "react";
import {
  WebPreview,
  WebPreviewBody,
} from "@/components/ai-elements/web-preview";
import { MarkdownRenderer } from "@/components/ai-elements/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  ExternalLink,
  Maximize2,
  PanelLeftOpen,
  PanelLeftClose,
  FileText,
} from "lucide-react";

interface ChatWorkspacePreviewProps {
  previewUrl: string | null;
  previewContent: string | null;
  previewLoading: boolean;
  previewPath: string | null;
  refreshKey: number;
  containerRef: RefObject<HTMLDivElement | null>;
  onRefresh: () => void;
  onOpenNewTab: () => void;
  onFullscreen: () => void;
  onToggleFileTree: () => void;
  showFileTree: boolean;
}

export const ChatWorkspacePreview = memo(function ChatWorkspacePreview({
  previewUrl,
  previewContent,
  previewLoading,
  previewPath,
  refreshKey,
  containerRef,
  onRefresh,
  onOpenNewTab,
  onFullscreen,
  onToggleFileTree,
  showFileTree,
}: ChatWorkspacePreviewProps) {
  const fileName = previewPath?.split("/").pop() || "";

  return (
    <div ref={containerRef} className="h-full flex flex-col px-3 pt-2 pb-4 bg-background">
      {/* Unified preview header */}
      {previewPath && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-muted/20 mb-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs font-medium text-foreground/90">
              {fileName}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onToggleFileTree}
                  >
                    {showFileTree ? (
                      <PanelLeftClose className="size-3.5" />
                    ) : (
                      <PanelLeftOpen className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{showFileTree ? "收起文件树" : "展开文件树"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onRefresh}
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>刷新</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onOpenNewTab}
                  >
                    <ExternalLink className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>在新标签页中打开</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onFullscreen}
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>全屏</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Preview content */}
      {previewLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
          加载中...
        </div>
      ) : previewContent ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MarkdownRenderer content={previewContent} />
        </div>
      ) : previewUrl ? (
        <div className="flex-1 min-h-0">
          <WebPreview key={refreshKey}>
            <WebPreviewBody src={previewUrl} />
          </WebPreview>
        </div>
      ) : null}
    </div>
  );
}, (prev, next) =>
  prev.previewUrl === next.previewUrl &&
  prev.previewContent === next.previewContent &&
  prev.previewLoading === next.previewLoading &&
  prev.previewPath === next.previewPath &&
  prev.refreshKey === next.refreshKey &&
  prev.showFileTree === next.showFileTree
);
