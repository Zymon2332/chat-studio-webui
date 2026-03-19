import { MarkdownRenderer } from "./MarkdownRenderer";
import { ThinkingBlock } from "./ThinkingBlock";
import { ToolCallBlock } from "./ToolCallBlock";
import { MessageActions } from "./MessageActions";
import { type AIMessage } from "@/types/chat";

interface AIMessageBubbleProps {
  message: AIMessage;
  isStreaming?: boolean;
}

export function AIMessageBubble({ message, isStreaming }: AIMessageBubbleProps) {
  // 处理复制功能
  const handleCopy = () => {
    const textContent = message.blocks
      ?.filter(b => b.type === 'text')
      .map(b => b.content)
      .join('') || '';
    if (textContent) {
      navigator.clipboard.writeText(textContent);
    }
  };

  // 判断是否应该显示操作栏（只要有文本内容且非流式状态就显示）
  const hasText = message.blocks?.some(b => b.type === 'text' && b.content.trim()) || false;
  const showActions = hasText && !isStreaming;

  // 判断是否显示 loading（流式传输中且没有内容）
  const isEmpty = !message.blocks || message.blocks.length === 0;
  const showLoading = isStreaming && isEmpty;

  return (
    <div className="space-y-2 group">
      {/* 按顺序渲染所有内容块或显示 loading */}
      {showLoading ? (
        // Loading 状态 - 三个点动画
        <div className="flex items-center gap-1 py-2 px-1">
          <span 
            className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0ms' }} 
          />
          <span 
            className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" 
            style={{ animationDelay: '150ms' }} 
          />
          <span 
            className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" 
            style={{ animationDelay: '300ms' }} 
          />
        </div>
      ) : (
        // 正常渲染内容块
        message.blocks?.map((block, index) => {
          switch (block.type) {
            case 'think':
              return <ThinkingBlock key={index} content={block.content} />;
            case 'tool':
              return (
                <ToolCallBlock
                  key={index}
                  request={block.request}
                  response={block.response}
                />
              );
            case 'text':
              return block.content ? (
                <div key={index} className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={block.content} isStreaming={isStreaming} />
                </div>
              ) : null;
            default:
              return null;
          }
        })
      )}
      
      {/* 操作栏（悬停显示） */}
      {showActions && (
        <div className="mt-2">
          <MessageActions
            mode="ai"
            dateTime={message.dateTime}
            onCopy={handleCopy}
          />
        </div>
      )}
    </div>
  );
}
