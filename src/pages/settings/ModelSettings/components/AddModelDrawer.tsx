import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, PenLine } from "lucide-react";
import { useState } from "react";
import type { ModelProvider } from "@/lib/models";
import type { DictItem } from "@/lib/common";

interface AddModelForm {
  modelName: string;
  contextLength: number;
  abilities: string[];
  useDefaultConfig: boolean;
  setting: {
    maxTokens: number;
    temperature: number;
    topP: number;
    stopSequences: string;
    frequencyPenalty: number;
    presencePenalty: number;
  };
}

interface AddModelDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ModelProvider | null;
  catalogModels: string[];
  isLoadingCatalog: boolean;
  abilityOptions: DictItem[];
  isLoadingAbilities: boolean;
  form: AddModelForm;
  isCustomInput: boolean;
  onFormChange: (form: AddModelForm) => void;
  onCustomInputChange: (isCustom: boolean) => void;
  onAbilityToggle: (code: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AddModelDrawer({
  open,
  onOpenChange,
  provider,
  catalogModels,
  isLoadingCatalog,
  abilityOptions,
  isLoadingAbilities,
  form,
  isCustomInput,
  onFormChange,
  onCustomInputChange,
  onAbilityToggle,
  onConfirm,
  onCancel,
}: AddModelDrawerProps) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-[400px] sm:w-[540px] h-full">
        <div className="h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>添加模型 - {provider?.providerName}</DrawerTitle>
            <DrawerDescription>
              填写模型信息以添加到该提供商
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-6">
            {/* 模型名称 */}
            <div className="space-y-2">
              <Label>模型名称</Label>
              {isLoadingCatalog ? (
                <Skeleton className="h-10 w-full" />
              ) : isCustomInput ? (
                <div className="space-y-2">
                  <Input
                    value={form.modelName}
                    onChange={(e) => onFormChange({ ...form, modelName: e.target.value })}
                    placeholder="请输入模型名称"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onCustomInputChange(false);
                      onFormChange({ ...form, modelName: "" });
                    }}
                  >
                    从预设列表中选择
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Select
                    value={form.modelName}
                    onValueChange={(value) => onFormChange({ ...form, modelName: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogModels.map((modelName) => (
                        <SelectItem key={modelName} value={modelName}>
                          {modelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => onCustomInputChange(true)}
                  >
                    <PenLine className="h-4 w-4 mr-1" />
                    自定义输入
                  </Button>
                </div>
              )}
            </div>

            {/* 上下文长度 */}
            <div className="space-y-2">
              <Label>上下文长度</Label>
              <ContextLengthInput
                value={form.contextLength}
                onChange={(val) => onFormChange({ ...form, contextLength: val })}
              />
            </div>

            {/* 能力选择 */}
            <div className="space-y-2">
              <Label>模型能力</Label>
              <p className="text-xs text-muted-foreground">
                提示：模型能力用于标识模型支持的特性。对话时系统会根据模型能力自动启用相应功能（如深度思考）。建议前往模型官网查看具体能力说明，如不确定可暂不选择。
              </p>
              {isLoadingAbilities ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {abilityOptions.map((item) => (
                    <div key={item.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ability-${item.code}`}
                        checked={form.abilities.includes(item.code)}
                        onCheckedChange={() => onAbilityToggle(item.code)}
                      />
                      <Label htmlFor={`ability-${item.code}`} className="text-sm cursor-pointer">
                        {item.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 配置方式 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="useDefaultConfig">使用默认配置</Label>
                <Switch
                  id="useDefaultConfig"
                  checked={form.useDefaultConfig}
                  onCheckedChange={(checked) =>
                    onFormChange({ ...form, useDefaultConfig: checked })
                  }
                />
              </div>

              {/* 高级配置 */}
              {!form.useDefaultConfig && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start gap-2 text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      警告：建议仅在了解这些参数含义时自定义配置，否则建议使用默认配置以避免对话异常。
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* maxTokens */}
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        value={form.setting.maxTokens}
                        onChange={(e) =>
                          onFormChange({
                            ...form,
                            setting: { ...form.setting, maxTokens: parseInt(e.target.value) || 0 },
                          })
                        }
                        placeholder="0 表示不限制"
                      />
                    </div>

                    {/* temperature */}
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (0-2)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={form.setting.temperature}
                        onChange={(e) =>
                          onFormChange({
                            ...form,
                            setting: { ...form.setting, temperature: parseFloat(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>

                    {/* topP */}
                    <div className="space-y-2">
                      <Label htmlFor="topP">Top P (0-1)</Label>
                      <Input
                        id="topP"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={form.setting.topP}
                        onChange={(e) =>
                          onFormChange({
                            ...form,
                            setting: { ...form.setting, topP: parseFloat(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>

                    {/* stopSequences */}
                    <div className="space-y-2">
                      <Label htmlFor="stopSequences">Stop Sequences</Label>
                      <Input
                        id="stopSequences"
                        value={form.setting.stopSequences}
                        onChange={(e) =>
                          onFormChange({
                            ...form,
                            setting: { ...form.setting, stopSequences: e.target.value },
                          })
                        }
                        placeholder="多个停止词请用逗号分隔，如：stop1,stop2"
                      />
                    </div>

                    {/* frequencyPenalty */}
                    <div className="space-y-2">
                      <Label htmlFor="frequencyPenalty">Frequency Penalty (-2 到 2)</Label>
                      <Input
                        id="frequencyPenalty"
                        type="number"
                        step="0.1"
                        min="-2"
                        max="2"
                        value={form.setting.frequencyPenalty}
                        onChange={(e) =>
                          onFormChange({
                            ...form,
                            setting: { ...form.setting, frequencyPenalty: parseFloat(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>

                    {/* presencePenalty */}
                    <div className="space-y-2">
                      <Label htmlFor="presencePenalty">Presence Penalty (-2 到 2)</Label>
                      <Input
                        id="presencePenalty"
                        type="number"
                        step="0.1"
                        min="-2"
                        max="2"
                        value={form.setting.presencePenalty}
                        onChange={(e) =>
                          onFormChange({
                            ...form,
                            setting: { ...form.setting, presencePenalty: parseFloat(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={onConfirm}>确认添加</Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={onCancel}>
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ── 上下文长度选择组件 ──

const CTX_PRESETS = [
  { label: "未设置", value: 0 },
  { label: "32K (32768)", value: 32768 },
  { label: "64K (65536)", value: 65536 },
  { label: "128K (128000)", value: 128000 },
  { label: "256K (262144)", value: 262144 },
  { label: "1M (1048576)", value: 1048576 },
] as const;

const isPresetValue = (v: number) => CTX_PRESETS.some((p) => p.value === v);

function ContextLengthInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [isCustom, setIsCustom] = useState(() => value > 0 && !isPresetValue(value));

  return (
    <div className="space-y-2">
      <Select
        value={isCustom ? "__custom__" : String(value)}
        onValueChange={(v) => {
          if (v === "__custom__") {
            setIsCustom(true);
            onChange(0);
          } else {
            setIsCustom(false);
            onChange(Number(v));
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="选择上下文长度" />
        </SelectTrigger>
        <SelectContent>
          {CTX_PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={String(preset.value)}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value="__custom__">自定义</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <Input
          type="number"
          min={1}
          placeholder="输入上下文长度"
          value={value || ""}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        />
      )}
    </div>
  );
}

export type { AddModelForm };
