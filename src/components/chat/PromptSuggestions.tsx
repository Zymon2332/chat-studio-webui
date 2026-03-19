import { promptSuggestions } from "@/data/chatMock";

interface PromptSuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export function PromptSuggestions({ onSuggestionClick }: PromptSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-8 max-w-6xl mx-auto px-4">
      {promptSuggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSuggestionClick?.(suggestion.title)}
          className={`group relative flex flex-col justify-between p-4 rounded-2xl text-left transition-all hover:shadow-md hover:scale-[1.02] ${suggestion.color} min-h-[140px]`}
        >
          <p className={`text-sm font-medium leading-relaxed ${suggestion.textColor}`}>
            {suggestion.title}
          </p>
          <span className="text-xs text-muted-foreground mt-3">
            {suggestion.category}
          </span>
        </button>
      ))}
    </div>
  );
}
