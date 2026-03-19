import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { ChatMessage } from './ChatMessage';
import type { Message, AIMessage } from "@/types/chat";

export interface ChatMessageListRef {
  scrollToBottom: (behavior?: 'smooth' | 'instant' | 'auto') => void;
  isAtBottom: () => boolean;
}

interface ChatMessageListProps {
  messages: Message[];
  streamingMessage?: AIMessage | null;
  isStreaming?: boolean;
  onScrollStateChange?: (state: { atBottom: boolean; hasOverflow: boolean }) => void;
}

export const ChatMessageList = forwardRef<ChatMessageListRef, ChatMessageListProps>(
  ({ messages, streamingMessage, onScrollStateChange }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessagesRef = useRef<Message[]>([]);
    const justAutoScrolledRef = useRef(false); // 标记刚自动滚动过，避免闪烁
    const shouldAutoScrollRef = useRef(true); // 跟踪是否应该继续自动滚动

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    scrollToBottom: (behavior: 'smooth' | 'instant' | 'auto' = 'smooth') => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    },
    isAtBottom: () => {
      if (!scrollRef.current) return true;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      return scrollHeight - scrollTop - clientHeight < 100;
    }
  }));

    // 检查是否在底部（100px 阈值）
    const checkIsAtBottom = useCallback(() => {
      if (!scrollRef.current) return true;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      return scrollHeight - scrollTop - clientHeight < 100;
    }, []);

    // 检查是否有滚动（内容超过一屏）
    const hasScroll = useCallback(() => {
      if (!scrollRef.current) return false;
      const { scrollHeight, clientHeight } = scrollRef.current;
      return scrollHeight > clientHeight + 10;
    }, []);

    // 通知父组件滚动状态变化
    const notifyScrollStateChange = useCallback(() => {
      if (!onScrollStateChange) return;
      const atBottom = checkIsAtBottom();
      const hasOverflow = hasScroll();
      onScrollStateChange({ atBottom, hasOverflow });
    }, [onScrollStateChange, checkIsAtBottom, hasScroll]);

    // 处理滚动事件 - 根据用户滚动行为控制自动滚动
    useEffect(() => {
      const container = scrollRef.current;
      if (!container) return;

      const onScroll = () => {
        // 刚自动滚动过，跳过状态更新避免闪烁
        if (justAutoScrolledRef.current) return;
        
        notifyScrollStateChange();
      };

      container.addEventListener('scroll', onScroll);
      return () => {
        container.removeEventListener('scroll', onScroll);
      };
    }, [checkIsAtBottom, notifyScrollStateChange]);

    // 监听消息变化，自动滚动到底部
    useEffect(() => {
      if (!scrollRef.current) return;

      // 检测新增消息
      const prevLength = prevMessagesRef.current.length;
      const hasNewMessage = messages.length > prevLength;
      const isInitialLoad = prevLength === 0 && messages.length > 0; // 初次加载
      const newMessage = hasNewMessage ? messages[messages.length - 1] : null;
      const isUserMessage = newMessage?.messageType === "USER";
      
      // 更新引用
      prevMessagesRef.current = messages;

      // 混合滚动逻辑
      if (isUserMessage || isInitialLoad) {
        // 用户消息或初次加载：重置并总是滚动（使用 smooth）
        shouldAutoScrollRef.current = true;
        justAutoScrolledRef.current = true; // 标记开始自动滚动
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => { justAutoScrolledRef.current = false; }, 300); // 300ms后重置
      } else {
        // AI 消息或流式更新：根据 shouldAutoScrollRef 决定是否滚动（使用 instant）
        if (shouldAutoScrollRef.current) {
          justAutoScrolledRef.current = true; // 标记开始自动滚动
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
          setTimeout(() => { justAutoScrolledRef.current = false; }, 300); // 300ms后重置
          
          // 滚动后检查是否还在底部，如果不在说明用户主动滚动了，停止自动跟随
          setTimeout(() => {
            const atBottom = checkIsAtBottom();
            if (!atBottom) {
              shouldAutoScrollRef.current = false;
            }
          }, 50);
        }
      }
    }, [messages, streamingMessage, notifyScrollStateChange]);

    return (
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {streamingMessage && (
            <ChatMessage
              message={streamingMessage}
              isStreaming
            />
          )}

          {/* 滚动锚点 - 空占位元素，确保 scrollIntoView 目标正确 */}
          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";
