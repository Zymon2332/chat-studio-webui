"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon, WrenchIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useAgentReasoning } from "../contexts/AgentReasoningContext";

interface ChatToolCallProps {
  name: string;
  argument?: string;
  response?: string;
  isError?: boolean;
  isStreaming?: boolean;
  isAgent?: boolean;
  toolRequestId?: string;
}

export function ChatToolCall({
  name,
  argument,
  response,
  isError,
  isStreaming,
  isAgent,
  toolRequestId,
}: ChatToolCallProps) {
  const { openAgentReasoning } = useAgentReasoning();
  const hasResponse = !!response || !!isError;
  const content = argument || response;

  return (
    <Collapsible className="not-prose">
      <CollapsibleTrigger className="flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground">
        <WrenchIcon className="size-4 shrink-0" />
        {isStreaming && !hasResponse ? (
          <Shimmer duration={1}>{`${name}中`}</Shimmer>
        ) : isError ? (
          <span>{name} 调用失败</span>
        ) : (
          <span>{name}</span>
        )}
        <ChevronDownIcon className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      {content && (
        <CollapsibleContent className="mt-4 text-sm text-muted-foreground space-y-3">
          {response ? (
            <pre className="whitespace-pre-wrap break-all rounded-md bg-muted/50 p-3 text-xs">
              {response}
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap break-all rounded-md bg-muted/50 p-3 text-xs">
              {argument}
            </pre>
          )}
          {isAgent && toolRequestId && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => openAgentReasoning(toolRequestId)}
            >
              <EyeIcon className="size-3" />
              查看推理过程
            </Button>
          )}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
