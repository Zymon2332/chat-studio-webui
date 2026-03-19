import { promptTags } from "@/data/chatMock";

interface PromptTagsProps {
  onTagClick?: (tagId: string) => void;
}

export function PromptTags({ onTagClick }: PromptTagsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
      {promptTags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagClick?.(tag.id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-full hover:bg-accent hover:border-border/80 transition-colors"
        >
          <span>{tag.icon}</span>
          <span>{tag.label}</span>
        </button>
      ))}
    </div>
  );
}
