import { Wrench, ChevronRight, Loader2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ToolRequest, ToolResponse } from "@/types/chat";

interface ToolCallBlockProps {
  request: ToolRequest;
  response?: ToolResponse;
}

export function ToolCallBlock({ request, response }: ToolCallBlockProps) {
  const isLoading = !response;
  const hasError = response?.isError;

  return (
    <Collapsible defaultOpen={false}>
      {/* 折叠状态 - 极简标签 */}
      <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wrench className="h-4 w-4" />
        )}
        <span className={cn("text-sm", hasError && "text-destructive")}>
          {request.name}
        </span>
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      
      {/* 展开状态 - 引用块样式 */}
      <CollapsibleContent>
        <div className="relative pl-4">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border rounded-full" />
          <div className="bg-muted/30 rounded-r-lg p-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在调用工具...
              </div>
            ) : response ? (
              <div className={cn(
                "text-sm max-h-[300px] overflow-y-auto whitespace-pre-wrap",
                hasError ? "text-destructive" : "text-muted-foreground"
              )}>
                {response.text}
              </div>
            ) : null}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
