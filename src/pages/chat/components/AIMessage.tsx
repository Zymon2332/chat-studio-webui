"use client";

import { memo, useMemo } from "react";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import type { ApiAIContent, StreamingItem } from "@/types/chat";
import { ChatToolCall } from "./ChatToolCall";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { MessageActions } from "./MessageActions";

const streamdownPlugins = { cjk, code, math, mermaid };

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
        const toolId = tool.toolId || `${contentIndex}-${toolIndex}`;
        items.push({
          id: `tool-${contentIndex}-${toolIndex}`,
          type: "tool",
          content: "",
          data: {
            id: toolId,
            name: tool.toolName,
            argument: tool.toolArgument,
            isAgent: tool.isAgent,
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

// ── 单 item memo 组件 ──

const ReasoningItem = memo(
  ({ item, isStreaming }: { item: StreamingItem; isStreaming: boolean }) => {
    const isComplete = item.isComplete === true;
    return (
      <Reasoning isStreaming={!isComplete && isStreaming} defaultOpen={false}>
        <ReasoningTrigger
          getThinkingMessage={(s) => s ? <Shimmer duration={1}>思考中...</Shimmer> : "深度思考"}
        />
        <ReasoningContent>{item.content}</ReasoningContent>
      </Reasoning>
    );
  },
  (prev, next) =>
    prev.item.content === next.item.content &&
    prev.item.isComplete === next.item.isComplete &&
    prev.isStreaming === next.isStreaming
);

const TextItem = memo(
  ({ item, isStreaming }: { item: StreamingItem; isStreaming: boolean }) => (
    <Streamdown mode="static" plugins={streamdownPlugins} isAnimating={isStreaming} linkSafety={{ enabled: false }}>
      {item.content}
    </Streamdown>
  ),
  (prev, next) =>
    prev.item.content === next.item.content &&
    prev.isStreaming === next.isStreaming
);

interface ToolItemProps {
  item: StreamingItem;
  isStreaming: boolean;
}

const ToolItem = memo(
  ({ item, isStreaming }: ToolItemProps) => {
    const hasResponse = !!item.data?.response;
    const isAgent = !!item.data?.isAgent;
    return (
      <ChatToolCall
        name={item.data?.name || "工具"}
        argument={item.data?.argument}
        response={item.data?.response?.text}
        isError={item.data?.response?.isError ?? undefined}
        isStreaming={isStreaming && !hasResponse}
        isAgent={isAgent}
        toolRequestId={item.data?.id}
      />
    );
  },
  (prev, next) =>
    prev.item.data?.response?.text === next.item.data?.response?.text &&
    prev.item.data?.argument === next.item.data?.argument &&
    prev.isStreaming === next.isStreaming
);

// 渲染单个 item
function renderItem(item: StreamingItem, isStreaming: boolean) {
  if (item.type === "think") return <ReasoningItem key={item.id} item={item} isStreaming={isStreaming} />;
  if (item.type === "text") return <TextItem key={item.id} item={item} isStreaming={isStreaming} />;
  if (item.type === "tool") return <ToolItem key={item.id} item={item} isStreaming={isStreaming} />;
  return null;
}

interface AIMessageProps {
  items: StreamingItem[];
  isStreaming: boolean;
  modelName?: string;
  tokenUsage?: number;
}

export const AIMessage = memo(
  function AIMessage({ items, isStreaming, modelName, tokenUsage }: AIMessageProps) {
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

  const hasContent = items.length > 0;

  const streamingIndicator = useMemo(() => {
    if (!isStreaming || !hasContent) return null;
    return (
      <div className="pt-1">
        <Shimmer duration={1.5} spread={1}>回复中...</Shimmer>
      </div>
    );
  }, [isStreaming, hasContent]);

  return (
    <Message align="start">
      <MessageContent>
        <Bubble variant="muted">
          <BubbleContent className="rounded-3xl">
            {showLoading ? (
              <div className="flex items-center py-2 px-1">
                <Shimmer duration={1}>思考中...</Shimmer>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item) => renderItem(item, isStreaming))}
              </div>
            )}
          </BubbleContent>
        </Bubble>
        {streamingIndicator}

        {hasContent && !isStreaming && (
          <MessageFooter>
            <MessageActions
              mode="ai"
              onCopy={handleCopy}
              modelName={modelName}
              tokenUsage={tokenUsage}
            />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
  },
  (prev, next) => {
    if (prev.isStreaming !== next.isStreaming) return false;
    if (prev.items.length !== next.items.length) return false;
    if (next.isStreaming) {
      return prev.items.every((item, i) => {
        const n = next.items[i];
        return item.content === n.content && item.type === n.type && item.isComplete === n.isComplete;
      });
    }
    return true;
  }
);
