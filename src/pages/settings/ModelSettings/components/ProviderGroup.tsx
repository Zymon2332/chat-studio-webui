import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Model, ModelProvider } from "@/lib/models";
import { ModelItem } from "./ModelItem";

interface ProviderGroupProps {
  provider: ModelProvider;
  onDelete: (model: Model) => void;
  onAdd: (provider: ModelProvider) => void;
  onConfig: (model: Model) => void;
}

export function ProviderGroup({ provider, onDelete, onAdd, onConfig }: ProviderGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between w-full py-3 px-4 hover:bg-accent/50 rounded-md transition-colors">
        <CollapsibleTrigger className="flex-1 flex items-center gap-3">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              !isOpen && "-rotate-90"
            )}
          />
          {provider.icon && (
            <img
              src={provider.icon}
              alt={provider.providerName}
              className="h-5 w-5 rounded"
            />
          )}
          <span className="font-medium">{provider.providerName}</span>
          <Badge variant="secondary">{provider.models.length}</Badge>
        </CollapsibleTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(provider);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          添加模型
        </Button>
      </div>
      <CollapsibleContent>
        <div className="pl-11 space-y-1">
          {provider.models.map((model) => (
            <ModelItem key={model.id} model={model} onDelete={onDelete} onConfig={onConfig} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
