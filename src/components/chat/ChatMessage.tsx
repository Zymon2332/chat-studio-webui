import { UserMessageBubble } from "./UserMessageBubble";
import { AIMessageBubble } from "./AIMessageBubble";
import { isUserMessage, isAIMessage, isToolExecutionResultMessage, type Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  if (isUserMessage(message)) {
    return <UserMessageBubble message={message} />;
  }

  if (isAIMessage(message)) {
    return <AIMessageBubble message={message} isStreaming={isStreaming} />;
  }

  // TOOL_EXECUTION_RESULT 不单独渲染（由 ToolCallBlock 内部处理）
  if (isToolExecutionResultMessage(message)) {
    return null;
  }

  return null;
}
