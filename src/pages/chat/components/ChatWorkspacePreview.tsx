"use client";

import { memo, type RefObject } from "react";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
} from "@/components/ai-elements/web-preview";
import { MarkdownRenderer } from "@/components/ai-elements/MarkdownRenderer";
import { RefreshCw, ExternalLink, Maximize2 } from "lucide-react";

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
}: ChatWorkspacePreviewProps) {
  return (
    <div ref={containerRef} className="h-full pt-2 px-3 pb-4">
      {previewLoading ? (
        <div className="text-xs text-muted-foreground">加载中...</div>
      ) : previewContent ? (
        <div className="h-full overflow-y-auto">
          <MarkdownRenderer content={previewContent} />
        </div>
      ) : previewUrl ? (
        <WebPreview key={refreshKey}>
          <WebPreviewNavigation>
            <span className="flex-1 truncate text-xs text-muted-foreground px-2">
              {previewPath}
            </span>
            <WebPreviewNavigationButton tooltip="刷新" onClick={onRefresh}>
              <RefreshCw className="size-3.5" />
            </WebPreviewNavigationButton>
            <WebPreviewNavigationButton tooltip="在新标签页中打开" onClick={onOpenNewTab}>
              <ExternalLink className="size-3.5" />
            </WebPreviewNavigationButton>
            <WebPreviewNavigationButton tooltip="全屏" onClick={onFullscreen}>
              <Maximize2 className="size-3.5" />
            </WebPreviewNavigationButton>
          </WebPreviewNavigation>
          <WebPreviewBody src={previewUrl} />
        </WebPreview>
      ) : null}
    </div>
  );
}, (prev, next) =>
  prev.previewUrl === next.previewUrl &&
  prev.previewContent === next.previewContent &&
  prev.previewLoading === next.previewLoading &&
  prev.previewPath === next.previewPath &&
  prev.refreshKey === next.refreshKey
);
