"use client";

import { useState, useMemo } from "react";
import { Copy, ThumbsUp, ThumbsDown, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  mode: "user" | "ai";
  dateTime?: string;
  onCopy?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  isComplete?: boolean;
  modelName?: string;
  tokenUsage?: number;
  className?: string;
}

export function MessageActions({
  mode,
  dateTime,
  onCopy,
  onLike,
  onDislike,
  onShare,
  modelName,
  tokenUsage,
  className,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked(!liked);
    setDisliked(false);
    onLike?.();
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    setLiked(false);
    onDislike?.();
  };

  const tokenDisplay = useMemo(() => {
    if (tokenUsage === undefined || tokenUsage === null || tokenUsage === 0) return null;
    return `${tokenUsage} tokens`;
  }, [tokenUsage]);

  if (mode === "user") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="复制"
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
        {dateTime && <span className="text-xs text-muted-foreground">{dateTime}</span>}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={handleLike}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          liked
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="点赞"
      >
        <ThumbsUp className="size-3.5" />
      </button>

      <button
        onClick={handleDislike}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          disliked
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="点踩"
      >
        <ThumbsDown className="size-3.5" />
      </button>

      <button
        onClick={handleCopy}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        title="复制"
      >
        {copied ? (
          <Check className="size-3.5 text-green-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>

      <button
        onClick={onShare}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        title="分享"
      >
        <Share2 className="size-3.5" />
      </button>

      {(modelName || tokenDisplay) && (
        <>
          <div className="w-px h-3 bg-border mx-1" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            {modelName && <span>{modelName}</span>}
            {modelName && tokenDisplay && <span>/</span>}
            {tokenDisplay && <span>{tokenDisplay}</span>}
          </div>
        </>
      )}
    </div>
  );
}
