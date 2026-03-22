import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ChatInput, type ChatInputRef } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { getSessionMessages } from "@/lib/session";
import { useChat } from "@/hooks/useChat";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/types/chat";
import type { Model } from "@/lib/models";

// 将后端 API 返回的消息转换为前端使用的格式
// 后端返回格式: { type: "USER"|"AI", contents: [...], attributes: {...} }
// 前端内部格式: { messageType: "USER"|"AI", contents: [...], attributes: {...} }
function normalizeMessages(messages: any[]): Message[] {
  const result: Message[] = [];

  for (const message of messages) {
    // 后端使用 'type' 字段，映射到前端的 'messageType'
    const messageType = message.type || message.messageType;

    if (messageType === "USER") {
      // USER 消息 - 从 attributes 获取日期等信息
      result.push({
        messageType: "USER",
        contents: message.contents || [],
        attributes: message.attributes || {},
      });
    } else if (messageType === "AI") {
      // AI 消息 - 后端直接返回新格式
      if (message.contents && message.contents.length > 0) {
        result.push({
          messageType: "AI",
          contents: message.contents.map((content: any) => ({
            text: content.text || "",
            thinking: content.thinking || "",
            executedTools: content.executedTools || [],
            attributes: content.attributes || {},
          })),
        });
      }
    }
  }

  return result;
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
  
  const [initialModel] = useState<Model | null>(() => {
    const state = location.state as { model?: Model; initialMessage?: string; isNewSession?: boolean } | null;
    return state?.model || null;
  });
  const [initialMessage] = useState<string | null>(() => {
    const state = location.state as { model?: Model; initialMessage?: string; isNewSession?: boolean } | null;
    return state?.initialMessage || null;
  });
  const [isNewSession] = useState<boolean>(() => {
    const state = location.state as { model?: Model; initialMessage?: string; isNewSession?: boolean } | null;
    return state?.isNewSession || false;
  });
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const initialMessageSent = useRef(false);
  const loadingStartTimeRef = useRef<number>(0);
  const MIN_LOADING_DISPLAY_TIME = 300; // 最小显示时间 300ms

  const { messages, streamingContent, isStreaming, currentAIMessageId, sendMessage, cancelStream } = useChat(id || "");

  // 加载历史消息
  useEffect(() => {
    // 如果是新创建的会话，跳过加载历史消息（直接显示输入框）
    if (isNewSession) {
      setIsLoadingHistory(false);
      return;
    }

    const fetchMessages = async () => {
      if (!id) return;
      
      loadingStartTimeRef.current = Date.now();
      setIsLoadingHistory(true);
      
      try {
        const data = await getSessionMessages(id);
        // 转换格式
        const normalizedData = normalizeMessages(data);
        setHistoryMessages(normalizedData);
      } catch {
        toast.error("加载历史消息失败");
      } finally {
        // 计算已显示时间，确保最小显示时间
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, MIN_LOADING_DISPLAY_TIME - elapsedTime);
        
        setTimeout(() => {
          setIsLoadingHistory(false);
        }, remainingTime);
      }
    };

    fetchMessages();
  }, [id, isNewSession]);

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
        <ChatMessages
          messages={displayMessages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          currentAIMessageId={currentAIMessageId}
        />
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
