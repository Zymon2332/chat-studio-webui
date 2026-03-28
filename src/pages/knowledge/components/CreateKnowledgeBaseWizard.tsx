"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { 
  FileText, 
  Video, 
  Image as ImageIcon, 
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Check,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createKnowledgeBase, fetchKbTags } from '@/lib/knowledge';
import { RetrievalConfigForm } from './RetrievalConfigForm';
import type { Tag, KnowledgeBaseFormData } from '../types';

interface CreateKnowledgeBaseWizardProps {
  onCancel: () => void;
  onSuccess: (kbId: number) => void;
}

// 默认值
const defaultFormData: KnowledgeBaseFormData = {
  name: '',
  description: '',
  type: 'DOCUMENT',
  responseType: 'BASIC',
  tags: [],
  config: {
    retrievalMode: 'HYBRID',
    topK: 5,
    embedMinScore: 0.7,
    fusionStrategy: 'RRF',
    topN: 5,
    rerankMinScore: 0.7,
    denseWeight: 0.7,
    sparseWeight: 0.3,
  },
};

export function CreateKnowledgeBaseWizard({
  onCancel,
  onSuccess
}: CreateKnowledgeBaseWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KnowledgeBaseFormData>(defaultFormData);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // 获取标签列表
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchKbTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error('请输入知识库名称');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('请输入知识库描述');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreate = async () => {
    try {
      const newKbId = await createKnowledgeBase(formData);
      toast.success('知识库创建成功');
      onSuccess(newKbId);
      setStep(1);
      setFormData(defaultFormData);
    } catch (error) {
      toast.error('创建失败');
    }
  };

  const handleCancel = () => {
    onCancel();
    setStep(1);
    setFormData(defaultFormData);
  };

  const addTag = (tag: { id?: number; name: string }) => {
    if (!formData.tags.find(t => t.name === tag.name)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const removeTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.name !== tagName)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag({ name: tagInput.trim() });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">新建知识库</h2>
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 py-4 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-12 h-0.5 transition-colors",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* 第1步：基础信息 */}
        {step === 1 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold">基础信息</h3>
            
            {/* 名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                placeholder="输入知识库名称"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="description">描述 *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[250px]">
                        <p>知识库描述将用于智能体检索，建议描述清楚该知识库的职责</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={cn(
                  "text-xs",
                  formData.description.length > 150 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {formData.description.length}/150
                </span>
              </div>
              <Textarea
                id="description"
                placeholder="描述这个知识库的用途"
                rows={3}
                maxLength={150}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={cn(
                  formData.description.length > 150 && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>

            {/* 知识库类型 - 卡片选择 */}
            <div className="space-y-3">
              <Label>知识库类型 *</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'DOCUMENT' as const, icon: FileText, label: '文档', desc: 'PDF、Word等' },
                  { type: 'VIDEO' as const, icon: Video, label: '视频', desc: 'MP4、MOV等' },
                  { type: 'IMAGE' as const, icon: ImageIcon, label: '图片', desc: 'JPG、PNG等' },
                ].map(({ type, icon: Icon, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all relative",
                      formData.type === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-accent hover:bg-accent/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-8 w-8",
                      formData.type === type ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                    {formData.type === type && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 响应类型 */}
            <div className="space-y-3">
              <Label>响应类型 *</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'BASIC' as const, label: '基础响应', desc: '仅返回文本回答，适合大多数场景' },
                  { type: 'MULTIMODAL' as const, label: '多模态响应', desc: '支持返回图片、视频等多媒体内容' },
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setFormData(prev => ({ ...prev, responseType: type }))}
                    className={cn(
                      "flex flex-col gap-2 p-4 rounded-lg border-2 transition-all text-left relative",
                      formData.responseType === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-accent hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{label}</span>
                      {formData.responseType === type && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-3">
              <Label>标签</Label>
              <div className="relative">
                <Input
                  placeholder="搜索标签或输入新标签后回车"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowTagDropdown(true)}
                />
                
                {/* 标签下拉列表 */}
                {showTagDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground mb-2">已有标签：</div>
                      <div className="flex flex-wrap gap-1">
                        {availableTags
                          .filter(tag => !formData.tags.find(t => t.name === tag.name))
                          .filter(tag => !tagInput || tag.name.toLowerCase().includes(tagInput.toLowerCase()))
                          .map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => addTag(tag)}
                              className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80"
                            >
                              {tag.name}
                            </button>
                          ))}
                      </div>
                      {tagInput && !availableTags.find(t => t.name === tagInput) && (
                        <>
                          <div className="border-t my-2" />
                          <button
                            onClick={() => addTag({ name: tagInput })}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Plus className="w-4 h-4" />
                            创建标签 "{tagInput}"
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 已选标签 */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag.name}
                      <button
                        onClick={() => removeTag(tag.name)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 第2步：检索配置 */}
        {step === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold">检索配置</h3>
            <RetrievalConfigForm 
              config={formData.config} 
              onChange={(config) => setFormData(prev => ({ ...prev, config }))} 
            />
          </div>
        )}

        {/* 第3步：确认预览 */}
        {step === 3 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold">确认预览</h3>
            
            {/* 基础信息预览 */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">基础信息</h4>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  编辑
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">名称</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                {formData.description && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">描述</span>
                    <span>{formData.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">类型</span>
                  <span>{formData.type === 'DOCUMENT' ? '文档' : formData.type === 'VIDEO' ? '视频' : '图片'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">响应</span>
                  <span>{formData.responseType === 'BASIC' ? '基础响应' : '多模态响应'}</span>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">标签</span>
                    <div className="flex gap-1">
                      {formData.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 检索配置预览 */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">检索配置</h4>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  编辑
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">检索模式</span>
                  <span>
                    {formData.config.retrievalMode === 'EMBEDDING' ? '向量检索' : 
                     formData.config.retrievalMode === 'HYBRID' ? '混合检索' : '全文检索'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">融合策略</span>
                  <span>{formData.config.fusionStrategy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TopK</span>
                  <span>{formData.config.topK}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">相似度阈值</span>
                  <span>{formData.config.embedMinScore}</span>
                </div>
                {formData.config.fusionStrategy === 'RERANK' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TopN</span>
                      <span>{formData.config.topN}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rerank阈值</span>
                      <span>{formData.config.rerankMinScore}</span>
                    </div>
                  </>
                )}
                {formData.config.fusionStrategy === 'WEIGHT' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">向量权重</span>
                      <span>{formData.config.denseWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">关键词权重</span>
                      <span>{formData.config.sparseWeight}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex justify-between px-6 py-4 border-t bg-background">
        <Button
          variant="outline"
          onClick={step === 1 ? handleCancel : handleBack}
        >
          {step === 1 ? '取消' : (
            <>
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </>
          )}
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNext}>
            下一步
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleCreate}>
            创建知识库
          </Button>
        )}
      </div>
    </div>
  );
}
