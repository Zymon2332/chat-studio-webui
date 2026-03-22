import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Sparkles, Eye, Palette, Wrench, Globe, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PromptInputButton } from "@/components/ai-elements/prompt-input";
import { getDefaultModel, getModels, setDefaultModel, type Model, type ModelProvider } from "@/lib/models";

const abilityIcons: Record<string, { icon: React.ElementType; label: string }> = {
  THINKING: { icon: Sparkles, label: "深度思考" },
  VISUAL_UNDERSTANDING: { icon: Eye, label: "视觉理解" },
  IMAGE_GENERATION: { icon: Palette, label: "图片生成" },
  TOOL: { icon: Wrench, label: "工具调用" },
  NETWORK: { icon: Globe, label: "联网搜索" },
};

export interface ModelSelectorRef {
  getSelectedModel: () => Model | null;
}

interface ModelSelectorProps {
  className?: string;
}

// 渲染能力图标
const renderAbilityIcons = (abilities: string) => {
  const abilityList = abilities.split(",").filter(Boolean);
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 ml-auto">
        {abilityList.map((ability) => {
          const config = abilityIcons[ability];
          if (!config) return null;
          
          const Icon = config.icon;
          return (
            <Tooltip key={ability}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{config.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export const ModelSelector = forwardRef<ModelSelectorRef, ModelSelectorProps>(
  ({ className }, ref) => {
    const [open, setOpen] = useState(false);
    const [currentModel, setCurrentModel] = useState<Model | null>(null);
    const [providers, setProviders] = useState<ModelProvider[]>([]);
    const [loadingCurrent, setLoadingCurrent] = useState(true);
    const [settingDefault, setSettingDefault] = useState<number | null>(null);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getSelectedModel: () => currentModel
    }));

    // 加载默认模型和 providers 列表（同时加载）
    useEffect(() => {
      const fetchData = async () => {
        setLoadingCurrent(true);
        try {
          // 同时加载默认模型和 providers
          const [defaultModel, providersData] = await Promise.all([
            getDefaultModel(),
            getModels()
          ]);
          setCurrentModel(defaultModel);
          setProviders(providersData);
        } catch {
          setCurrentModel(null);
        } finally {
          setLoadingCurrent(false);
        }
      };

      fetchData();
    }, []);

    // 选择模型
    const handleSelectModel = async (model: Model) => {
      if (model.id === currentModel?.id) {
        setOpen(false);
        return;
      }

      setSettingDefault(model.id);
      try {
        await setDefaultModel(model.id);
        setCurrentModel(model);
        setOpen(false);
      } catch {
        // 静默处理错误
      } finally {
        setSettingDefault(null);
      }
    };

    // 获取当前模型的 provider
    const getCurrentProvider = (): ModelProvider | undefined => {
      if (!currentModel) return undefined;
      return providers.find(p => p.models.some(m => m.id === currentModel.id));
    };

    if (loadingCurrent) {
      return (
        <div className={cn("flex items-center", className)}>
          <Skeleton className="h-8 w-24" />
        </div>
      );
    }

    const currentProvider = getCurrentProvider();

    return (
      <AIModelSelector open={open} onOpenChange={setOpen}>
        <ModelSelectorTrigger asChild>
          <PromptInputButton className={className}>
            {currentProvider?.icon ? (
              <img 
                src={currentProvider.icon} 
                alt={currentProvider.providerName}
                className="size-4 rounded-sm"
              />
            ) : currentModel ? (
              <div className="size-4 rounded-sm bg-muted" />
            ) : null}
            <ModelSelectorName>
              {currentModel?.modelName || "选择模型"}
            </ModelSelectorName>
          </PromptInputButton>
        </ModelSelectorTrigger>
        <ModelSelectorContent title="选择模型">
          <ModelSelectorInput placeholder="搜索模型..." />
          <ModelSelectorList>
            {providers.length === 0 ? (
              <ModelSelectorEmpty>暂无可用模型</ModelSelectorEmpty>
            ) : (
              providers.map((provider) => (
                <ModelSelectorGroup 
                  key={provider.providerId} 
                  heading={provider.providerName}
                >
                  {provider.models.map((model) => {
                    const isSetting = settingDefault === model.id;
                    return (
                      <ModelSelectorItem
                        key={model.id}
                        onSelect={() => handleSelectModel(model)}
                        className={cn(
                          "flex items-center gap-2",
                          model.id === currentModel?.id && "bg-accent"
                        )}
                        disabled={isSetting}
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
                        {isSetting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-auto" />
                        ) : (
                          renderAbilityIcons(model.abilities)
                        )}
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
);

ModelSelector.displayName = "ModelSelector";
