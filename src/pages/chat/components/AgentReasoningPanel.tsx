"use client";

import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { AIMessage, convertApiContentToItems } from "./AIMessage";
import { AgentAvatar } from "@/pages/agents/components/AgentAvatar";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  isUserMessage,
  isAIMessage,
  type Message as MessageType,
} from "@/types/chat";

interface AgentReasoningPanelProps {
  loading: boolean;
  agentName: string;
  agentAvatar: string;
  messages: MessageType[];
}

export function AgentReasoningPanel({
  loading,
  agentName,
  agentAvatar,
  messages,
}: AgentReasoningPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Shimmer duration={1}>加载中...</Shimmer>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-sm text-muted-foreground/60 py-8 text-center">
        暂无推理过程
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 pt-3 pb-1 border-b border-border mb-4">
        <AgentAvatar avatar={agentAvatar} size="sm" />
        <span className="text-sm font-medium">{agentName} 推理过程</span>
      </div>

      <MessageGroup className="flex flex-col gap-4">
        {messages.map((msg, i) => {
          if (isUserMessage(msg)) {
            return (
              <Message key={i} align="end" className="w-fit ml-auto">
                <MessageContent>
                  <Bubble variant="default">
                    <BubbleContent className="bg-primary text-primary-foreground rounded-3xl">
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.contents.map((c) => c.text).join("\n")}
                      </div>
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            );
          }
          if (isAIMessage(msg)) {
            const items = convertApiContentToItems(msg.contents);
            return (
              <AIMessage
                key={i}
                items={items}
                isStreaming={false}
              />
            );
          }
          return null;
        })}
      </MessageGroup>
    </div>
  );
}
