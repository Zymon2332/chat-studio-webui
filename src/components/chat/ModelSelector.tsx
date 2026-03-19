import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ChevronDown, Sparkles, Eye, Palette, Wrench, Globe, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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

export const ModelSelector = forwardRef<ModelSelectorRef, ModelSelectorProps>(
  ({ className }, ref) => {
    const [open, setOpen] = useState(false);
    const [currentModel, setCurrentModel] = useState<Model | null>(null);
    const [providers, setProviders] = useState<ModelProvider[]>([]);
    const [loadingCurrent, setLoadingCurrent] = useState(true);
    const [loadingList, setLoadingList] = useState(false);
    const [settingDefault, setSettingDefault] = useState<number | null>(null);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getSelectedModel: () => currentModel
    }));

    // 加载默认模型
    useEffect(() => {
      const fetchDefaultModel = async () => {
        setLoadingCurrent(true);
        try {
          const model = await getDefaultModel();
          setCurrentModel(model);
        } catch {
          setCurrentModel(null);
        } finally {
          setLoadingCurrent(false);
        }
      };

      fetchDefaultModel();
    }, []);

    // 加载模型列表
    const handleOpenChange = async (isOpen: boolean) => {
      setOpen(isOpen);
      
      if (isOpen && providers.length === 0) {
        setLoadingList(true);
        try {
          const data = await getModels();
          setProviders(data);
        } catch {
          // 静默处理错误
        } finally {
          setLoadingList(false);
        }
      }
    };

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

    // 渲染能力图标
    const renderAbilityIcons = (abilities: string) => {
      const abilityList = abilities.split(",").filter(Boolean);
      
      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {abilityList.map((ability) => {
              const config = abilityIcons[ability];
              if (!config) return null;
              
              const Icon = config.icon;
              return (
                <Tooltip key={ability}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Icon className="h-3.5 w-3.5 text-stone-400" />
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

    if (loadingCurrent) {
      return (
        <div className={cn("flex items-center", className)}>
          <Skeleton className="h-8 w-24" />
        </div>
      );
    }

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors",
              className
            )}
          >
            <span className="max-w-[120px] truncate font-medium">
              {currentModel?.modelName || "未安装模型"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="w-72 p-0" align="start">
          {loadingList ? (
            <div className="p-3 space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto py-2">
              {providers.map((provider) => (
                <div key={provider.providerId} className="px-2">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-stone-500">
                    {provider.icon && (
                      <img
                        src={provider.icon}
                        alt={provider.providerName}
                        className="h-3.5 w-3.5 rounded-sm"
                      />
                    )}
                    <span>{provider.providerName}</span>
                  </div>
                  
                  <div className="space-y-0.5">
                    {provider.models.map((model) => {
                      const isSelected = model.id === currentModel?.id;
                      const isSetting = settingDefault === model.id;
                      
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(model)}
                          disabled={isSetting}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                            isSelected
                              ? "bg-stone-100 text-stone-900"
                              : "hover:bg-stone-50 text-stone-700"
                          )}
                        >
                          <span className="truncate">{model.modelName}</span>
                          
                          <div className="flex items-center gap-2">
                            {renderAbilityIcons(model.abilities)}
                            {isSetting && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

ModelSelector.displayName = "ModelSelector";
