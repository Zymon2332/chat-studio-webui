import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowDown } from "lucide-react";
import { ChatInput, type ChatInputRef } from "@/components/chat/ChatInput";
import { ChatMessageList, type ChatMessageListRef } from "@/components/chat/ChatMessageList";
import { getSessionMessages } from "@/lib/session";
import { useChat } from "@/hooks/useChat";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Message, AIMessage } from "@/types/chat";
import type { Model } from "@/lib/models";

// 转换旧格式消息到新格式（包含 blocks）
function normalizeMessage(message: Message, allMessages: Message[] = []): Message {
  if (message.messageType === "AI") {
    const aiMessage = message as AIMessage;
    // 如果已经有 blocks 且不为空，直接返回
    if (aiMessage.blocks && aiMessage.blocks.length > 0) {
      return message;
    }
    
    // 转换旧格式到新格式
    const blocks: AIMessage['blocks'] = [];
    
    // 使用类型断言访问旧字段
    const oldMessage = message as any;
    
    // 处理 thinking
    if (oldMessage.thinking) {
      if (Array.isArray(oldMessage.thinking)) {
        oldMessage.thinking.forEach((t: string) => {
          if (t) blocks.push({ type: 'think', content: t });
        });
      } else if (typeof oldMessage.thinking === 'string') {
        // 兼容字符串格式的 thinking
        blocks.push({ type: 'think', content: oldMessage.thinking });
      }
    }
    
    // 处理 text（放在 tool 之前）
    if (oldMessage.text) {
      blocks.push({ type: 'text', content: oldMessage.text });
    }
    
    // 处理 toolRequests（放在 text 之后）
    if (oldMessage.toolRequests) {
      oldMessage.toolRequests.forEach((tool: any) => {
        // 在 AI 消息本身的 toolResponses 中查找
        let response = oldMessage.toolResponses?.find((r: any) => r.id === tool.id);
        
        // 如果没找到，在所有消息中查找 TOOL_EXECUTION_RESULT
        if (!response) {
          const toolResultMsg = allMessages.find(
            (m): m is Extract<Message, { messageType: "TOOL_EXECUTION_RESULT" }> =>
              m.messageType === "TOOL_EXECUTION_RESULT" &&
              (m as any).toolResponse?.id === tool.id
          );
          if (toolResultMsg) {
            response = toolResultMsg.toolResponse;
          }
        }
        
        blocks.push({ type: 'tool', request: tool, response });
      });
    }
    
    return {
      ...aiMessage,
      blocks: blocks.length > 0 ? blocks : []
    };
  }
  return message;
}

function UserMessageSkeleton() {
  return (
    <div className="flex flex-col items-end">
      <Skeleton className="max-w-[80%] bg-stone-200 h-14 rounded-2xl px-4 py-3 w-64" />
    </div>
  );
}

function AIMessageSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-5/6 max-w-lg" />
      <Skeleton className="h-4 w-4/6 max-w-sm" />
    </div>
  );
}

export function Conversation() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const chatInputRef = useRef<ChatInputRef>(null);
  const messageListRef = useRef<ChatMessageListRef>(null);
  const [scrollState, setScrollState] = useState({ atBottom: true, hasOverflow: false });
  
  // 使用 useCallback 包装滚动状态变化回调，避免无限循环
  const handleScrollStateChange = useCallback((state: { atBottom: boolean; hasOverflow: boolean }) => {
    setScrollState(state);
  }, []);
  
  const [initialModel] = useState<Model | null>(() => {
    const state = location.state as { model?: Model; initialMessage?: string } | null;
    return state?.model || null;
  });
  const [initialMessage] = useState<string | null>(() => {
    const state = location.state as { model?: Model; initialMessage?: string } | null;
    return state?.initialMessage || null;
  });
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const initialMessageSent = useRef(false);

  const { messages, streamingMessage, isStreaming, sendMessage, cancelStream } = useChat(id || "");

  // 计算是否显示悬浮球：有滚动内容且不在底部
  const showScrollButton = scrollState.hasOverflow && !scrollState.atBottom;

  // 加载历史消息
  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) return;
      
      setIsLoadingHistory(true);
      try {
        const data = await getSessionMessages(id);
        // 转换旧格式消息到新格式（传递所有消息用于查找 tool response）
        const normalizedData = data.map(msg => normalizeMessage(msg, data));
        setHistoryMessages(normalizedData);
      } catch {
        toast.error("加载历史消息失败");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchMessages();
  }, [id]);

  // 自动发送 initialMessage
  useEffect(() => {
    if (
      !initialMessageSent.current &&
      initialMessage &&
      initialModel &&
      !isLoadingHistory &&
      historyMessages.length === 0
    ) {
      initialMessageSent.current = true;
      sendMessage(initialMessage, initialModel);
    }
  }, [initialMessage, initialModel, isLoadingHistory, historyMessages.length, sendMessage]);

  const handleSend = async (text: string) => {
    if (!id) return;
    
    const model = chatInputRef.current?.getSelectedModel();
    
    if (!model) {
      toast.error("请先选择模型");
      return;
    }

    await sendMessage(text, model);
  };

  // 处理回到底部
  const handleScrollToBottom = () => {
    messageListRef.current?.scrollToBottom('smooth');
  };

  // 合并历史消息和当前对话消息
  const displayMessages: Message[] = [...historyMessages, ...messages];

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* 消息列表 */}
      {isLoadingHistory ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
            <UserMessageSkeleton />
            <AIMessageSkeleton />
            <UserMessageSkeleton />
            <AIMessageSkeleton />
            <UserMessageSkeleton />
            <AIMessageSkeleton />
          </div>
        </div>
      ) : (
        <ChatMessageList
          ref={messageListRef}
          messages={displayMessages}
          streamingMessage={streamingMessage}
          isStreaming={isStreaming}
          onScrollStateChange={handleScrollStateChange}
        />
      )}

      {/* 回到底部悬浮按钮 - 固定在输入框上方 */}
      {showScrollButton && (
        <div className="absolute bottom-[140px] left-1/2 -translate-x-1/2 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={handleScrollToBottom}
            className="rounded-full shadow-lg hover:shadow-xl"
            title="回到底部"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 底部输入框 - 固定不滚动 */}
      <div className="flex-shrink-0 bg-background">
        <div className="max-w-4xl mx-auto px-4 pb-4 pt-0">
          <ChatInput
            ref={chatInputRef}
            onSend={handleSend}
            onCancel={cancelStream}
            isStreaming={isStreaming}
            placeholder="输入消息..."
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
}
