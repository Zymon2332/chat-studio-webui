import { forwardRef, useRef, useCallback, useImperativeHandle } from "react";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModelSelector, type ModelSelectorRef } from "./ModelSelector";
import { TipTapEditor, type TipTapEditorRef } from "./TipTapEditor";
import type { Model } from "@/lib/models";

export interface ChatInputRef {
  getSelectedModel: () => Model | null;
  getAgentIds: () => string[];
  getSkillIds: () => string[];
}

interface ChatInputProps {
  onSend?: (message: string) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
  className?: string;
  footerExtra?: React.ReactNode;
  onFocusChange?: (focused: boolean) => void;
  onModelChange?: (model: Model) => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  (
    {
      onSend,
      onCancel,
      isStreaming = false,
      placeholder = "给我发消息或布置任务",
      className,
      footerExtra,
      onFocusChange,
      onModelChange,
    },
    ref
  ) => {
    const editorRef = useRef<TipTapEditorRef>(null);
    const modelSelectorRef = useRef<ModelSelectorRef>(null);

    const status = isStreaming ? "streaming" : "ready";

    const submitText = useCallback(() => {
      if (isStreaming) return;
      const text = editorRef.current?.getText() || "";
      if (!text) return;
      onSend?.(text);
      editorRef.current?.clear();
    }, [onSend, isStreaming]);

    const handleEnterSubmit = useCallback(() => {
      submitText();
    }, [submitText]);

    useImperativeHandle(ref, () => ({
      getSelectedModel: () => modelSelectorRef.current?.getSelectedModel() ?? null,
      getAgentIds: () => editorRef.current?.getAgentIds() ?? [],
      getSkillIds: () => editorRef.current?.getSkillIds() ?? [],
    }), []);

    return (
      <div className={cn("rounded-2xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm", className)}>
        <TipTapEditor
          ref={editorRef}
          placeholder={placeholder}
          onEnterSubmit={handleEnterSubmit}
          onFocusChange={onFocusChange}
        />

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputButton size="icon-sm" variant="ghost">
                  <Paperclip className="size-4" />
                </PromptInputButton>
              </TooltipTrigger>
              <TooltipContent side="top">添加附件</TooltipContent>
            </Tooltip>
            <ModelSelector ref={modelSelectorRef} onModelChange={onModelChange} />
          </div>

          <div className="flex items-center gap-2">
            {footerExtra}
            <PromptInputSubmit
              status={status}
              onStop={onCancel}
              onClick={() => submitText()}
            />
          </div>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
