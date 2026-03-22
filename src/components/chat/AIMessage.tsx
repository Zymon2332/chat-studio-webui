"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { ApiAIContent, StreamingItem } from "@/types/chat";
import { MessageActions } from "./MessageActions";

// 转换 API AI Content 为流式 items
// 保证渲染顺序: thinking → text → tools
export function convertApiContentToItems(contents: ApiAIContent[]): StreamingItem[] {
  const items: StreamingItem[] = [];
  
  contents.forEach((content, contentIndex) => {
    // 1. thinking → think item (如果非空)
    // 静态渲染时，思考内容已经是完整的，标记 isComplete: true
    if (content.thinking && content.thinking.trim()) {
      items.push({
        id: `think-${contentIndex}`,
        type: "think",
        content: content.thinking,
        isComplete: true,  // 静态内容已完整
      });
    }
    
    // 2. text → text item (如果非空)
    if (content.text && content.text.trim()) {
      items.push({
        id: `text-${contentIndex}`,
        type: "text",
        content: content.text,
      });
    }
    
    // 3. executedTools → tool items (按数组顺序)
    if (content.executedTools && content.executedTools.length > 0) {
      content.executedTools.forEach((tool, toolIndex) => {
        items.push({
          id: `tool-${contentIndex}-${toolIndex}`,
          type: "tool",
          content: "",
          data: {
            id: `${contentIndex}-${toolIndex}`,
            name: tool.toolName,
            argument: tool.toolArguments,
            response: {
              text: tool.toolResult,
              isError: tool.isError,
            },
          },
        });
      });
    }
  });
  
  return items;
}

// 获取工具状态
function getToolState(
  hasResponse: boolean,
  isError: boolean | null | undefined
): "input-available" | "output-available" | "output-error" {
  if (!hasResponse) {
    return "input-available";
  }
  if (isError === true) {
    return "output-error";
  }
  return "output-available";
}

// 渲染单个 item
function renderItem(item: StreamingItem, isStreaming: boolean) {
  if (item.type === "think") {
    // 思考完成时（收到 [END] 标记），isStreaming 设为 false，defaultOpen 设为 false（折叠）
    const isThinkingComplete = item.isComplete === true;
    return (
      <Reasoning key={item.id} isStreaming={!isThinkingComplete && isStreaming} defaultOpen={!isThinkingComplete}>
        <ReasoningTrigger />
        <ReasoningContent>{item.content}</ReasoningContent>
      </Reasoning>
    );
  }

  if (item.type === "text") {
    return (
      <MessageResponse key={item.id} isAnimating={isStreaming}>
        {item.content}
      </MessageResponse>
    );
  }

  if (item.type === "tool") {
    const hasResponse = !!item.data?.response;
    const toolState = getToolState(
      hasResponse,
      item.data?.response?.isError
    );

    return (
      <Tool key={item.id}>
        <ToolHeader
          title={item.data?.name || "工具"}
          type="tool-ui"
          state={toolState}
        />
        <ToolContent>
          {item.data?.argument && (
            <ToolInput
              input={
                item.data.argument === "{}"
                  ? {}
                  : JSON.parse(item.data.argument)
              }
            />
          )}
          {hasResponse && (
            <ToolOutput
              output={item.data?.response?.text || "执行成功"}
              errorText={item.data?.response?.isError ? "执行失败" : undefined}
            />
          )}
        </ToolContent>
      </Tool>
    );
  }

  return null;
}

interface AIMessageProps {
  items: StreamingItem[];
  isStreaming: boolean;
}

export function AIMessage({ items, isStreaming }: AIMessageProps) {
  const handleCopy = () => {
    const textContent = items
      .filter((item) => item.type === "text")
      .map((item) => item.content)
      .join("");
    if (textContent) {
      navigator.clipboard.writeText(textContent);
    }
  };

  // 判断是否显示 loading
  const showLoading = isStreaming && items.length === 0;

  // 判断是否显示操作栏
  const hasText = items.some(
    (item) => item.type === "text" && item.content.trim().length > 0
  );
  const showActions = hasText && !isStreaming;

  return (
    <Message from="assistant">
      <MessageContent>
        {showLoading ? (
          <div className="flex items-center gap-1 py-2 px-1">
            <span
              className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        ) : (
          <>{items.map((item) => renderItem(item, isStreaming))}</>
        )}
      </MessageContent>

      {showActions && (
        <MessageActions
          mode="ai"
          onCopy={handleCopy}
          isComplete={true}
        />
      )}
    </Message>
  );
}
