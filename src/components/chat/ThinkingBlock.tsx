import { Sparkles, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ThinkingBlockProps {
  content: string;
}

export function ThinkingBlock({ content }: ThinkingBlockProps) {
  if (!content || content === "null") return null;

  return (
    <Collapsible defaultOpen={true}>
      {/* 折叠状态 - 极简标签 */}
      <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-2">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm">深度思考</span>
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      
      {/* 展开状态 - 引用块样式 */}
      <CollapsibleContent>
        <div className="relative pl-4">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border rounded-full" />
          <div className="bg-muted/30 rounded-r-lg p-3 text-muted-foreground text-sm">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
