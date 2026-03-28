'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchKnowledgeBaseDetail, updateKnowledgeBase } from '@/lib/knowledge';
import type { KnowledgeBase, KnowledgeBaseFormData } from '../types';
import { BasicInfoTab } from './BasicInfoTab';
import { RetrievalConfigTab } from './RetrievalConfigTab';
import { TagManagerTab } from './TagManagerTab';
import { toast } from 'sonner';

interface KnowledgeBaseDetailProps {
  knowledgeBase: KnowledgeBase;
  onBack: () => void;
}

const tabs = [
  { id: 'basic', label: '基础信息' },
  { id: 'retrieval', label: '检索配置' },
  { id: 'tags', label: '标签管理' },
];

// 默认表单数据（用于初始状态）
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

export function KnowledgeBaseDetail({ knowledgeBase, onBack }: KnowledgeBaseDetailProps) {
  const [formData, setFormData] = useState<KnowledgeBaseFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取知识库详情数据
  useEffect(() => {
    const loadKnowledgeBaseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const detail = await fetchKnowledgeBaseDetail(knowledgeBase.id);
        
        // 将 API 返回的数据转换为表单数据格式
        setFormData({
          name: detail.name,
          description: detail.description,
          type: detail.type,
          responseType: detail.responseType,
          tags: detail.tags,
          config: detail.config,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取知识库详情失败');
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeBaseDetail();
  }, [knowledgeBase.id]);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      // 更新时排除 type 字段，因为知识库类型不可修改
      const { type, ...updateData } = formData;
      await updateKnowledgeBase(knowledgeBase.id, updateData as KnowledgeBaseFormData);
      toast.success('知识库更新成功');
      onBack();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{knowledgeBase.name} - 设置</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{knowledgeBase.name} - 设置</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-destructive max-w-md text-center">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={onBack}>
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            formData={formData}
            onChange={setFormData}
            knowledgeBase={knowledgeBase}
          />
        );
      case 'retrieval':
        return (
          <RetrievalConfigTab
            config={formData.config}
            onChange={(config) => setFormData({ ...formData, config })}
          />
        );
      case 'tags':
        return (
          <TagManagerTab
            tags={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 简化后的 Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">{knowledgeBase.name} - 设置</h2>
      </div>

      {/* 主内容区：左侧导航 + 右侧内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧垂直导航 */}
        <div className="w-[200px] border-r bg-muted/30 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}

          {/* 只在标签管理 Tab 显示保存按钮 */}
          {activeTab === 'tags' && (
            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={onBack} className="gap-2" disabled={saving}>
                <X className="h-4 w-4" />
                取消
              </Button>
              <Button onClick={handleSave} className="gap-2" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? '保存中...' : '保存更改'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
