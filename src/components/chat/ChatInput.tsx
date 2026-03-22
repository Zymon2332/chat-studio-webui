import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputFooter,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
} from "@/components/ai-elements/prompt-input";
import { ModelSelector, type ModelSelectorRef } from "./ModelSelector";
import { AtSign, Wrench } from "lucide-react";
import type { Model } from "@/lib/models";

export interface ChatInputRef {
  getSelectedModel: () => Model | null;
}

interface ChatInputProps {
  onSend?: (message: string) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
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
    const modelSelectorRef = useRef<ModelSelectorRef>(null);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getSelectedModel: () => modelSelectorRef.current?.getSelectedModel() || null,
    }));

    // 映射 isStreaming 到 ai-elements 的 status
    const status = isStreaming ? "streaming" : "ready";

    return (
      <PromptInput
        className={className}
        onSubmit={({ text }) => {
          if (text.trim() && !isStreaming) {
            onSend?.(text);
          }
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea 
            placeholder={placeholder}
            className={variant === "compact" ? "min-h-[40px] max-h-[120px]" : "min-h-[100px] max-h-[200px]"}
          />
        </PromptInputBody>
        
        <PromptInputFooter>
          <PromptInputTools>
            {/* 左侧工具栏 */}
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger 
                tooltip={{ content: "添加附件", shortcut: "⌘+U" }}
              />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label="添加文件" />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            
            <PromptInputButton tooltip={{ content: "@提及知识库" }}>
              <AtSign className="size-4" />
            </PromptInputButton>
            
            <PromptInputButton tooltip={{ content: "选择工具" }}>
              <Wrench className="size-4" />
            </PromptInputButton>
            
            {/* 模型选择器 */}
            <ModelSelector ref={modelSelectorRef} />
          </PromptInputTools>
          
          {/* 右侧提交/停止按钮 */}
          <PromptInputSubmit 
            status={status}
            onStop={onCancel}
          />
        </PromptInputFooter>
      </PromptInput>
    );
  }
);

ChatInput.displayName = "ChatInput";