import { useState, useEffect, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchModelSettings, updateModelSettings, type Model } from "@/lib/models";

interface ConfigForm {
  maxTokens: number;
  temperature: number;
  topP: number;
  stopSequences: string;
  frequencyPenalty: number;
  presencePenalty: number;
}

const defaultSettings: ConfigForm = {
  maxTokens: 0,
  temperature: 0.7,
  topP: 1,
  stopSequences: "",
  frequencyPenalty: 0,
  presencePenalty: 0,
};

interface ConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: Model | null;
}

export function ConfigDrawer({ open, onOpenChange, model }: ConfigDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ConfigForm>(defaultSettings);

  // 加载模型配置
  const loadSettings = useCallback(async () => {
    if (!model) return;

    try {
      setLoading(true);
      const settings = await fetchModelSettings(model.id);
      
      if (settings) {
        // 使用返回的配置
        setForm({
          maxTokens: settings.maxTokens ?? defaultSettings.maxTokens,
          temperature: settings.temperature ?? defaultSettings.temperature,
          topP: settings.topP ?? defaultSettings.topP,
          stopSequences: settings.stopSequences ?? defaultSettings.stopSequences,
          frequencyPenalty: settings.frequencyPenalty ?? defaultSettings.frequencyPenalty,
          presencePenalty: settings.presencePenalty ?? defaultSettings.presencePenalty,
        });
      } else {
        // 使用默认值
        setForm(defaultSettings);
      }
    } catch {
      // 错误已在拦截器处理
      setForm(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [model]);

  // 抽屉打开时加载配置
  useEffect(() => {
    if (open && model) {
      loadSettings();
    }
  }, [open, model, loadSettings]);

  // 保存配置
  const handleSave = async () => {
    if (!model) return;

    try {
      setSaving(true);
      await updateModelSettings({
        modelId: model.id,
        ...form,
      });
      toast.success("保存成功");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (!model) return null;

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-[400px] sm:w-[540px] h-full">
        <div className="h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>配置 - {model.modelName}</DrawerTitle>
            <DrawerDescription>
              编辑模型对话参数配置
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={form.maxTokens}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        maxTokens: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="0 表示不限制"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (0-2)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={form.temperature}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        temperature: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topP">Top P (0-1)</Label>
                  <Input
                    id="topP"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={form.topP}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        topP: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stopSequences">Stop Sequences</Label>
                  <Input
                    id="stopSequences"
                    value={form.stopSequences}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        stopSequences: e.target.value,
                      }))
                    }
                    placeholder="多个停止词请用逗号分隔，如：stop1,stop2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencyPenalty">Frequency Penalty (-2 到 2)</Label>
                  <Input
                    id="frequencyPenalty"
                    type="number"
                    step="0.1"
                    min="-2"
                    max="2"
                    value={form.frequencyPenalty}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        frequencyPenalty: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presencePenalty">Presence Penalty (-2 到 2)</Label>
                  <Input
                    id="presencePenalty"
                    type="number"
                    step="0.1"
                    min="-2"
                    max="2"
                    value={form.presencePenalty}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        presencePenalty: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button onClick={handleSave} disabled={loading || saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">取消</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
