import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Video, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KnowledgeBase, KnowledgeBaseFormData } from '../types';

interface BasicInfoTabProps {
  formData: KnowledgeBaseFormData;
  onChange: (data: KnowledgeBaseFormData) => void;
  knowledgeBase: KnowledgeBase;
}

export function BasicInfoTab({ formData, onChange, knowledgeBase }: BasicInfoTabProps) {
  return (
    <div className="max-w-2xl space-y-6">
      {/* 名称 */}
      <div className="space-y-2">
        <Label htmlFor="name">名称</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
        />
      </div>

      {/* 描述 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">描述</Label>
          <span className={cn(
            "text-xs",
            formData.description.length > 150 ? "text-destructive" : "text-muted-foreground"
          )}>
            {formData.description.length}/150
          </span>
        </div>
        <Textarea
          id="description"
          rows={3}
          maxLength={150}
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          className={cn(
            formData.description.length > 150 && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>

      {/* 类型（只读） */}
      <div className="space-y-2">
        <Label>知识库类型</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'DOCUMENT' as const, icon: FileText, label: '文档', desc: 'PDF、Word等' },
            { type: 'VIDEO' as const, icon: Video, label: '视频', desc: 'MP4、MOV等' },
            { type: 'IMAGE' as const, icon: ImageIcon, label: '图片', desc: 'JPG、PNG等' },
          ].map(({ type, icon: Icon, label, desc }) => {
            const isSelected = formData.type === type;
            return (
              <div
                key={type}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 relative',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/50 opacity-60'
                )}
              >
                <Icon className={cn('h-8 w-8', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">知识库类型创建后不可修改</p>
      </div>

      {/* 响应类型（可编辑） */}
      <div className="space-y-2">
        <Label>响应类型</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'BASIC' as const, label: '基础响应', desc: '仅返回文本回答' },
            { type: 'MULTIMODAL' as const, label: '多模态响应', desc: '支持返回多媒体内容' },
          ].map(({ type, label, desc }) => {
            const isSelected = formData.responseType === type;
            return (
              <button
                key={type}
                onClick={() => onChange({ ...formData, responseType: type })}
                className={cn(
                  'flex flex-col gap-2 p-4 rounded-lg border-2 transition-all relative text-left',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-accent hover:bg-accent/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
        <h4 className="font-medium">统计信息</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">文档数量：</span>
            <span className="font-medium">{knowledgeBase.docCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">创建时间：</span>
            <span className="font-medium">{knowledgeBase.createdTime}</span>
          </div>
          <div>
            <span className="text-muted-foreground">更新时间：</span>
            <span className="font-medium">{knowledgeBase.updatedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
