"use client";

import { memo } from "react";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import type { UserMessage } from "@/types/chat";
import { MessageActions } from "./MessageActions";

interface UserChatMessageProps {
  message: UserMessage;
  dateTime: string;
}

export const UserChatMessage = memo(function UserChatMessage({
  message,
  dateTime,
}: UserChatMessageProps) {
  const text = message.contents.map((c) => c.text).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Message align="end" className="w-fit ml-auto">
      <MessageContent>
        <Bubble variant="default">
          <BubbleContent className="bg-primary text-primary-foreground rounded-3xl">
            <div className="text-sm whitespace-pre-wrap break-normal">{text}</div>
          </BubbleContent>
        </Bubble>
        <MessageFooter className="opacity-0 group-hover/message:opacity-100 transition-opacity">
          <MessageActions mode="user" dateTime={dateTime} onCopy={handleCopy} />
        </MessageFooter>
      </MessageContent>
    </Message>
  );
});
