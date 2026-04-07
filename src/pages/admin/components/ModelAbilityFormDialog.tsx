import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  type ModelAbility,
  type CreateModelAbilityRequest,
  type UpdateModelAbilityRequest,
  type ModelAbilityType,
  AllAbilities,
  AbilityLabels,
  AbilityColors,
  parseAbilities,
  stringifyAbilities,
} from '@/types/modelAbility';
import type { ModelProvider } from '@/types/modelProvider';

interface ModelAbilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelAbility?: ModelAbility | null;
  providers: ModelProvider[];
  onSubmit: (data: CreateModelAbilityRequest | UpdateModelAbilityRequest) => void;
  loading?: boolean;
}

export const ModelAbilityFormDialog: React.FC<ModelAbilityFormDialogProps> = ({
  open,
  onOpenChange,
  modelAbility,
  providers,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!modelAbility;
  
  const [formData, setFormData] = useState<{
    modelName: string;
    providerId: string;
    abilities: ModelAbilityType[];
    enabled: boolean;
  }>(() => {
    if (modelAbility) {
      return {
        modelName: modelAbility.modelName,
        providerId: modelAbility.providerId,
        abilities: parseAbilities(modelAbility.abilities),
        enabled: modelAbility.enabled,
      };
    }
    return {
      modelName: '',
      providerId: '',
      abilities: [],
      enabled: true,
    };
  });

  React.useEffect(() => {
    if (modelAbility) {
      setFormData({
        modelName: modelAbility.modelName,
        providerId: modelAbility.providerId,
        abilities: parseAbilities(modelAbility.abilities),
        enabled: modelAbility.enabled,
      });
    } else {
      setFormData({
        modelName: '',
        providerId: providers.length > 0 ? providers[0].id : '',
        abilities: [],
        enabled: true,
      });
    }
  }, [modelAbility, open, providers]);

  const handleAbilityToggle = (ability: ModelAbilityType) => {
    setFormData((prev) => {
      const newAbilities = prev.abilities.includes(ability)
        ? prev.abilities.filter((a) => a !== ability)
        : [...prev.abilities, ability];
      return { ...prev, abilities: newAbilities };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      abilities: stringifyAbilities(formData.abilities),
    };
    
    if (isEdit && modelAbility) {
      onSubmit({
        id: modelAbility.id,
        ...submitData,
      } as UpdateModelAbilityRequest);
    } else {
      onSubmit(submitData as CreateModelAbilityRequest);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑模型能力' : '新增模型能力'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">记录 ID</p>
                <p className="font-mono text-sm">{modelAbility?.id}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="providerId">
              供应商 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.providerId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, providerId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择供应商" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.providerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelName">
              模型名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="modelName"
              placeholder="如：gpt-4o"
              value={formData.modelName}
              onChange={(e) => setFormData((prev) => ({ ...prev, modelName: e.target.value }))}
              required
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>模型能力 <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 gap-3">
              {AllAbilities.map((ability) => (
                <div key={ability} className="flex items-center space-x-2">
                  <Checkbox
                    id={ability}
                    checked={formData.abilities.includes(ability)}
                    onCheckedChange={() => handleAbilityToggle(ability)}
                  />
                  <Label
                    htmlFor={ability}
                    className="text-sm font-normal cursor-pointer"
                  >
                    <Badge className={AbilityColors[ability]}>
                      {AbilityLabels[ability]}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">启用状态</Label>
              <p className="text-sm text-muted-foreground">
                {formData.enabled ? '已启用' : '已停用'}
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : isEdit ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
