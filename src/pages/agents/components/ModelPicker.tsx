"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Eye, Palette, Wrench, Globe, Loader2, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ModelSelector as AIModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorName,
  ModelSelectorEmpty,
} from "@/components/ai-elements/model-selector";
import { getModels, type Model, type ModelProvider } from "@/lib/models";

const abilityConfig: Record<string, { icon: React.ElementType; label: string }> = {
  THINKING: { icon: Sparkles, label: "深度思考" },
  VISUAL_UNDERSTANDING: { icon: Eye, label: "视觉理解" },
  IMAGE_GENERATION: { icon: Palette, label: "图片生成" },
  TOOL: { icon: Wrench, label: "工具调用" },
  NETWORK: { icon: Globe, label: "联网搜索" },
};

const renderAbilities = (abilities: string) => {
  if (!abilities) return null;
  const list = abilities.split(",").filter(Boolean);
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 ml-auto">
        {list.map((a) => {
          const cfg = abilityConfig[a];
          if (!cfg) return null;
          const Icon = cfg.icon;
          return (
            <Tooltip key={a}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{cfg.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

interface ModelPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelPicker({ value, onChange }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadModels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getModels();
      setProviders(data || []);
      setLoaded(true);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loaded) return;
    if (open || value) loadModels();
  }, [open, value, loaded, loadModels]);

  const findSelected = (): { model: Model; provider: ModelProvider } | null => {
    if (!value) return null;
    for (const p of providers) {
      const found = p.models.find((m) => String(m.id) === value);
      if (found) return { model: found, provider: p };
    }
    return null;
  };

  const selectedModel = findSelected();

  return (
    <AIModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full h-auto min-h-11 px-3 py-2.5 justify-between text-sm"
        >
          {selectedModel ? (
            <span className="flex items-center gap-2 min-w-0">
              {selectedModel.provider.icon ? (
                <img
                  src={selectedModel.provider.icon}
                  alt={selectedModel.provider.providerName}
                  className="size-5 rounded-sm shrink-0"
                />
              ) : (
                <div className="size-5 rounded-sm bg-muted shrink-0" />
              )}
              <span className="truncate">
                {selectedModel.model.modelName}
                <span className="text-xs text-muted-foreground font-normal ml-1.5">
                  · {selectedModel.provider.providerName}
                </span>
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">选择运行模型</span>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground/60 shrink-0 ml-2" />
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent title="选择模型">
        <ModelSelectorInput placeholder="搜索模型..." />
        <ModelSelectorList>
          {loading && providers.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
              加载中...
            </div>
          ) : providers.length === 0 ? (
            <ModelSelectorEmpty>暂无可用模型</ModelSelectorEmpty>
          ) : (
            providers.map((provider) => (
              <ModelSelectorGroup
                key={provider.providerId}
                heading={provider.providerName}
              >
                {provider.models.map((model) => {
                  const id = String(model.id);
                  const isSelected = value === id;
                  return (
                    <ModelSelectorItem
                      key={model.id}
                      value={`${model.modelName} ${provider.providerName}`}
                      onSelect={() => {
                        onChange(id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2",
                        isSelected && "bg-accent",
                      )}
                    >
                      {provider.icon ? (
                        <img
                          src={provider.icon}
                          alt={provider.providerName}
                          className="size-4 rounded-sm"
                        />
                      ) : (
                        <div className="size-4 rounded-sm bg-muted" />
                      )}
                      <ModelSelectorName>{model.modelName}</ModelSelectorName>
                      {renderAbilities(model.abilities)}
                    </ModelSelectorItem>
                  );
                })}
              </ModelSelectorGroup>
            ))
          )}
        </ModelSelectorList>
      </ModelSelectorContent>
    </AIModelSelector>
  );
}
