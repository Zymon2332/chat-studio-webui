"use client";

import { forwardRef, useRef, useImperativeHandle, useCallback, useMemo } from "react";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
} from "@/components/ui/message-scroller";
import { Button } from "@/components/ui/button";
import { Marker } from "@/components/ui/marker";
import { UserChatMessage } from "./UserChatMessage";
import { AIMessage, convertApiContentToItems } from "./AIMessage";
import {
  isUserMessage,
  isAIMessage,
  isMarkerMessage,
  type Message,
  type AIMessage as AIMessageType,
} from "@/types/chat";

export interface ChatMessagesRef {
  scrollToBottom: () => void;
}

interface ChatMessagesProps {
  messages: Message[];
}

function getDateLabel(dateStr: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const fmt = (d: Date) => d.toDateString();

  if (fmt(date) === fmt(today)) return "今天";
  if (fmt(date) === fmt(yesterday)) return "昨天";
  if (date.getFullYear() === today.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function ChatMessagesInner({
  messages,
  onReady,
}: {
  messages: Message[];
  onReady: (fn: () => void) => void;
}) {
  const { scrollToEnd } = useMessageScroller();

  const handleScrollToEnd = useCallback(() => {
    scrollToEnd();
  }, [scrollToEnd]);

  onReady(handleScrollToEnd);

  const items = useMemo(() => {
    const result: React.ReactNode[] = [];
    let lastDate: string | null = null;

    messages.forEach((message, index) => {
      if (isMarkerMessage(message)) {
        result.push(
          <Marker key={`marker-${index}`} variant="separator">
            {message.label}
          </Marker>
        );
        return;
      }

      const dateStr = isUserMessage(message)
        ? message.attributes?.dateTime || new Date().toISOString()
        : null;
      const dateLabel = dateStr ? getDateLabel(dateStr) : null;

      if (dateLabel && dateLabel !== lastDate) {
        result.push(
          <Marker key={`date-${dateLabel}`} variant="separator">
            {dateLabel}
          </Marker>
        );
        lastDate = dateLabel;
      }

      if (isUserMessage(message)) {
        const dateTime = message.attributes?.dateTime || "";
        result.push(
          <MessageScrollerItem key={`user-${index}`}>
            <UserChatMessage message={message} dateTime={dateTime} />
          </MessageScrollerItem>
        );
        return;
      }

      if (isAIMessage(message)) {
        const aiMsg = message as AIMessageType;
        const isStreaming = !!aiMsg._streamingContent;
        const items = isStreaming
          ? aiMsg._streamingContent!.items
          : aiMsg._completedItems ?? convertApiContentToItems(aiMsg.contents);
        const modelName = aiMsg.modelName || "";
        const tokenUsageNum = aiMsg.tokenUsage ?? 0;

        result.push(
          <MessageScrollerItem
            key={aiMsg.id || `ai-${index}`}
            scrollAnchor={isStreaming}
          >
            <AIMessage
              items={items}
              isStreaming={isStreaming}
              modelName={modelName}
              tokenUsage={tokenUsageNum}
            />
          </MessageScrollerItem>
        );
      }
    });

    return result;
  }, [messages]);

  return (
    <>
      <MessageScrollerViewport className="py-6 relative">
        <MessageScrollerContent className="max-w-4xl mx-auto px-4">
          {items}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton
        direction="end"
        render={<Button variant="secondary" size="icon-sm" className="rounded-full" />}
      />
    </>
  );
}

export const ChatMessages = forwardRef<ChatMessagesRef, ChatMessagesProps>(
  ({ messages }, ref) => {
    const scrollFnRef = useRef<() => void>(() => {});

    useImperativeHandle(ref, () => ({
      scrollToBottom: () => scrollFnRef.current?.(),
    }), []);

    const handleReady = useCallback((fn: () => void) => {
      scrollFnRef.current = fn;
    }, []);

    return (
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="flex-1 min-h-0">
          <ChatMessagesInner messages={messages} onReady={handleReady} />
        </MessageScroller>
      </MessageScrollerProvider>
    );
  }
);

ChatMessages.displayName = "ChatMessages";
