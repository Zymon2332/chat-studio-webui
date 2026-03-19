import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { AtSign, Paperclip, Wrench, Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelSelector, type ModelSelectorRef } from "./ModelSelector";

export interface ChatInputRef {
  getSelectedModel: () => import("@/lib/models").Model | null;
}

interface ChatInputProps {
  onSend?: (message: string) => void;
  onCancel?: () => void; // 新增：取消流式对话
  isStreaming?: boolean; // 新增：是否正在流式传输
  placeholder?: string;
  className?: string;
  variant?: "default" | "compact";
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  (
    {
      onSend,
      onCancel,
      isStreaming = false,
      placeholder = "给我发消息或布置任务",
      className,
      variant = "default",
    },
    ref
  ) => {
    const [input, setInput] = useState("");
    const modelSelectorRef = useRef<ModelSelectorRef>(null);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getSelectedModel: () => modelSelectorRef.current?.getSelectedModel() || null,
    }));

    const handleSend = () => {
      if (input.trim() && !isStreaming) {
        onSend?.(input);
        setInput("");
      }
    };

    const handleCancel = () => {
      if (isStreaming) {
        onCancel?.();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div className={cn("w-full", className)}>
        <div
          className="relative bg-background border border-border rounded-3xl shadow-sm transition-colors hover:border-border/80"
        >
          {/* 输入框 */}
          <textarea
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full ${
              variant === "compact" ? "min-h-[40px]" : "min-h-[100px]"
            } max-h-[200px] px-5 py-4 bg-transparent border-0 resize-none focus:outline-none text-base text-foreground placeholder:text-muted-foreground`}
            rows={1}
          />

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                title="提及知识库"
              >
                <AtSign className="h-5 w-5" />
              </button>

              <button
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                title="上传附件"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <button
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                title="选择工具"
              >
                <Wrench className="h-5 w-5" />
              </button>

              {/* 模型选择器 */}
              <ModelSelector ref={modelSelectorRef} />
            </div>

            {/* 根据流式状态切换按钮 */}
            {isStreaming ? (
              // 流式对话中 - 显示停止按钮
              <button
                onClick={handleCancel}
                className="p-2.5 bg-muted text-foreground rounded-full hover:bg-muted/80 transition-colors"
                title="停止生成"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              // 正常状态 - 显示发送按钮
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
