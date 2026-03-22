"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { UserChatMessage } from "./UserChatMessage";
import { AIMessage, convertApiContentToItems } from "./AIMessage";
import { isUserMessage, isAIMessage, type Message, type StreamingContent } from "@/types/chat";

interface ChatMessagesProps {
  messages: Message[];
  streamingContent?: StreamingContent | null;
  isStreaming?: boolean;
  currentAIMessageId?: string | null;  // 当前流式 AI 消息的 ID
}

export function ChatMessages({
  messages,
  streamingContent,
  isStreaming,
  currentAIMessageId,
}: ChatMessagesProps) {
  return (
    <Conversation className="flex-1 min-h-0">
      <ConversationContent className="max-w-4xl mx-auto py-6 px-4">
        {/* 消息列表 - 统一渲染（静态 + 流式合并） */}
        {messages.map((message, index) => {
          if (isUserMessage(message)) {
            // 从 attributes 中获取日期
            const dateTime = message.attributes?.dateTime || "";
            return <UserChatMessage key={index} message={message} dateTime={dateTime} />;
          }
          if (isAIMessage(message)) {
            // 判断是否是当前流式消息
            const isCurrentStreaming = isStreaming && message.id === currentAIMessageId;
            
            // 如果是当前流式消息，使用 streamingContent；否则使用静态 contents
            const items = isCurrentStreaming && streamingContent && streamingContent.items.length > 0
              ? streamingContent.items
              : convertApiContentToItems(message.contents);
            
            return (
              <AIMessage
                key={message.id || index}
                items={items}
                isStreaming={isCurrentStreaming}
              />
            );
          }
          return null;
        })}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
