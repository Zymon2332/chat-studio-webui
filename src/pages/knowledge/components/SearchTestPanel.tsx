'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Search, Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KnowledgeBaseConfig, RetrieveResult } from '../types';
import { RetrievalConfigForm } from './RetrievalConfigForm';
import { retrieveKnowledgeBase } from '@/lib/knowledge';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SearchTestPanelProps {
  onClose: () => void;
  knowledgeBaseName: string;
  kbId: number;
}

export function SearchTestPanel({ onClose, knowledgeBaseName, kbId }: SearchTestPanelProps) {
  const [query, setQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<KnowledgeBaseConfig>({
    retrievalMode: 'HYBRID',
    topK: 5,
    embedMinScore: 0.7,
    fusionStrategy: 'RRF',
    topN: 5,
    rerankMinScore: 0.7,
    denseWeight: 0.7,
    sparseWeight: 0.3,
  });
  const [tempConfig, setTempConfig] = useState(config);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RetrieveResult[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      setHasSearched(true);
      
      const response = await retrieveKnowledgeBase({
        kbId,
        content: query,
        config,
      });
      
      setResults(response);
    } catch (error) {
      toast.error('检索失败，请稍后重试');
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleOpenSettings = () => {
    setTempConfig({ ...config });
    setShowSettings(true);
  };

  const handleApplySettings = () => {
    setConfig(tempConfig);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setShowSettings(false);
  };

  return (
    <>
      {/* 主面板 */}
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">召回测试</h2>
            <p className="text-sm text-muted-foreground">
              根据给定的查询文本测试「{knowledgeBaseName}」的召回效果
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：查询区 */}
          <div className="w-1/2 p-6 border-r overflow-y-auto">
            {/* 查询输入框 */}
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">源文本</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSettings}
                    className="h-7 gap-1"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    配置
                  </Button>
                </div>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入文本，建议使用简短的陈述句"
                  className="min-h-[200px] resize-none"
                  maxLength={200}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={cn(
                    "text-xs",
                    query.length > 200 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {query.length} / 200
                  </span>
                  <Button
                    onClick={handleSearch}
                    disabled={!query.trim()}
                    size="sm"
                  >
                    测试
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {!hasSearched ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">输入查询文本并点击测试按钮查看检索结果</p>
              </div>
            ) : isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-12 w-12 mb-4 animate-spin opacity-50" />
                <p className="text-sm">检索中...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  共找到 {results.length} 个结果
                </div>
                {results.map((result: RetrieveResult, index: number) => (
                  <div
                    key={result.vectorId}
                    className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-primary">
                            {(result.score * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="text-sm font-medium truncate">
                          {result.docName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vector ID: {result.vectorId} · 长度: {result.charLength} 字符
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <p className={cn(
                        "text-sm text-muted-foreground",
                        !expandedItems.has(result.vectorId) && "line-clamp-3"
                      )}>
                        {result.text}
                      </p>
                      {result.text.length > 100 && (
                        <button
                          onClick={() => toggleExpand(result.vectorId)}
                          className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {expandedItems.has(result.vectorId) ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              收起
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              展开
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 配置面板 */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>检索配置</SheetTitle>
          </SheetHeader>
          <div className="mt-6 px-6">
            <RetrievalConfigForm 
              config={tempConfig} 
              onChange={setTempConfig}
            />
            {/* 按钮 */}
            <div className="flex gap-2 pt-6 mt-6 border-t">
              <Button variant="outline" className="flex-1" onClick={handleCancelSettings}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleApplySettings}>
                应用
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
