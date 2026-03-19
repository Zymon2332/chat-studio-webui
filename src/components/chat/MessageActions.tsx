import { useState } from "react";
import { Copy, ThumbsUp, ThumbsDown, Share2, Check, CheckCircle2 } from "lucide-react";

interface MessageActionsProps {
  mode: "user" | "ai";
  dateTime: string;
  onCopy?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  isComplete?: boolean;
}

export function MessageActions({
  mode,
  dateTime,
  onCopy,
  onLike,
  onDislike,
  onShare,
  isComplete = true
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (mode === "user") {
    return (
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleCopy}
          className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
          title="复制"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <span className="text-xs text-stone-400">{dateTime}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* 完成状态 - 常显 */}
      {isComplete && (
        <div className="flex items-center gap-1 text-stone-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="text-xs">完成</span>
        </div>
      )}
      
      {/* 分隔线 - 常显 */}
      <div className="w-px h-3 bg-stone-300" />
      
      {/* 操作按钮 - 常显 */}
      <button
        onClick={onLike}
        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
        title="点赞"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      
      <button
        onClick={onDislike}
        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
        title="点踩"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
      
      <button
        onClick={handleCopy}
        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
        title="复制"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      
      <button
        onClick={onShare}
        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
        title="分享"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
      
      {/* 时间 - 悬停显示 */}
      <span className="text-xs text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {dateTime}
      </span>
    </div>
  );
}
