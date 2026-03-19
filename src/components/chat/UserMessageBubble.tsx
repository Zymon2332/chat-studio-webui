import { MessageActions } from "./MessageActions";
import type { UserMessage } from "@/types/chat";

interface UserMessageBubbleProps {
  message: UserMessage;
}

export function UserMessageBubble({ message }: UserMessageBubbleProps) {
  const text = message.contents.map((c) => c.text).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col items-end group">
      <div className="max-w-[80%] bg-muted text-foreground rounded-2xl px-4 py-3">
        <div className="text-sm whitespace-pre-wrap">{text}</div>
      </div>
      <div className="mt-1">
        <MessageActions
          mode="user"
          dateTime={message.dateTime}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
}
