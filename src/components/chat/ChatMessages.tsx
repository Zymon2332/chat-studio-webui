"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { UserChatMessage } from "./UserChatMessage";
import { AIMessage, convertApiContentToItems } from "./AIMessage";
import { isUserMessage, isAIMessage, type Message } from "@/types/chat";

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({
  messages,
}: ChatMessagesProps) {
  return (
    <Conversation className="flex-1 min-h-0">
      <ConversationContent className="max-w-4xl mx-auto py-6 px-4">
        {messages.map((message, index) => {
          if (isUserMessage(message)) {
            const dateTime = message.attributes?.dateTime || "";
            return (
              <UserChatMessage
                key={`user-${message.contents[0]?.text?.slice(0, 32)}-${index}`}
                message={message}
                dateTime={dateTime}
              />
            );
          }
          if (isAIMessage(message)) {
            const isStreaming = !!message._streamingContent;
            const items = isStreaming
              ? message._streamingContent!.items
              : message._completedItems ?? convertApiContentToItems(message.contents);

            return (
              <AIMessage
                key={message.id || `ai-${index}`}
                items={items}
                isStreaming={isStreaming}
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
