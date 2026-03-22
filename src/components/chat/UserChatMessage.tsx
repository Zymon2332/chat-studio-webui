"use client";

import { Message, MessageContent } from "@/components/ai-elements/message";
import type { UserMessage } from "@/types/chat";
import { MessageActions } from "./MessageActions";

interface UserChatMessageProps {
  message: UserMessage;
  dateTime: string;
}

export function UserChatMessage({ message, dateTime }: UserChatMessageProps) {
  const text = message.contents.map((c) => c.text).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Message from="user">
      <MessageContent>
        <div className="text-sm whitespace-pre-wrap">{text}</div>
      </MessageContent>
      {dateTime && (
        <MessageActions mode="user" dateTime={dateTime} onCopy={handleCopy} className="ml-auto" />
      )}
    </Message>
  );
}