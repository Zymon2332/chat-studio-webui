import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type ModelProvider,
  type CreateModelProviderRequest,
  type UpdateModelProviderRequest,
  type SourceType,
  SourceTypeLabels,
} from '@/types/modelProvider';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: ModelProvider | null;
  onSubmit: (data: CreateModelProviderRequest | UpdateModelProviderRequest) => void;
  loading?: boolean;
}

const defaultFormData: CreateModelProviderRequest = {
  id: '',
  providerName: '',
  sourceType: 'service',
  baseUrl: '',
  icon: '',
  description: '',
};

export const ModelProviderFormDialog: React.FC<ModelProviderFormDialogProps> = ({
  open,
  onOpenChange,
  provider,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!provider;
  const [formData, setFormData] = useState<CreateModelProviderRequest | UpdateModelProviderRequest>(() => {
    if (provider) {
      return {
        id: provider.id,
        providerName: provider.providerName,
        sourceType: provider.sourceType,
        baseUrl: provider.baseUrl,
        icon: provider.icon,
        description: provider.description,
      };
    }
    return defaultFormData;
  });
  const [previewUrl, setPreviewUrl] = useState<string>(provider?.icon || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (provider) {
      setFormData({
        id: provider.id,
        providerName: provider.providerName,
        sourceType: provider.sourceType,
        baseUrl: provider.baseUrl,
        icon: provider.icon,
        description: provider.description,
      });
      setPreviewUrl(provider.icon);
    } else {
      setFormData(defaultFormData);
      setPreviewUrl('');
    }
  }, [provider, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewUrl(base64);
      handleChange('icon', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = () => {
    setPreviewUrl('');
    handleChange('icon', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑模型提供商' : '新增模型提供商'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="id">
                 提供商ID <span className="text-red-500">*</span>
               </Label>
              <Input
                id="id"
                placeholder="如：openai"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                required
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">唯一标识，创建后不可修改</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerName">
                提供商名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="providerName"
                placeholder="如：OpenAI"
                value={formData.providerName}
                onChange={(e) => handleChange('providerName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceType">
              来源类型 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.sourceType}
              onValueChange={(value: SourceType) => handleChange('sourceType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">{SourceTypeLabels.service}</SelectItem>
                <SelectItem value="local">{SourceTypeLabels.local}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">
              基础地址 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="baseUrl"
              placeholder="https://api.example.com/v1"
              value={formData.baseUrl}
              onChange={(e) => handleChange('baseUrl', e.target.value)}
              required
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Logo <span className="text-red-500">*</span>
            </Label>
            {previewUrl ? (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-xl border-2 border-border overflow-hidden bg-background shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Logo预览"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                    title="删除Logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Logo已上传</p>
                  <p className="text-xs text-muted-foreground mt-1">点击右侧按钮更换</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadClick}
                >
                  更换Logo
                </Button>
              </div>
            ) : (
              <div
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                  isDragging
                    ? 'border-primary bg-primary/10 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200',
                    isDragging ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    {isDragging ? (
                      <Upload className="w-8 h-8 text-primary" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragging ? '松开以上传' : '点击或拖拽上传Logo'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 JPG、PNG、SVG、WEBP 格式
                    </p>
                  </div>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="提供商描述信息..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={3}
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
            <Button type="submit" disabled={loading || !formData.icon}>
              {loading ? '保存中...' : isEdit ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
