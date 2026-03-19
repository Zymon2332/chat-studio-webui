import { useState } from 'react';
import { Search, X, Send, Loader2, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  documentName: string;
  content: string;
  relevance: number;
  chunks: number;
}

interface SearchTestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBaseName: string;
}

// Mock 检索结果
const mockSearchResults: SearchResult[] = [
  {
    id: 'result-1',
    documentName: '2024产品规划.pdf',
    content: '我们的产品路线图包括三个主要阶段：第一阶段将重点开发核心AI对话功能，第二阶段引入多模态能力...',
    relevance: 0.95,
    chunks: 3,
  },
  {
    id: 'result-2',
    documentName: '用户调研报告.pdf',
    content: '根据用户调研，85%的受访者表示需要更智能的上下文理解能力，这是提升用户体验的关键...',
    relevance: 0.87,
    chunks: 2,
  },
  {
    id: 'result-3',
    documentName: 'API设计规范.docx',
    content: 'API设计遵循RESTful原则，所有端点都需要进行身份验证，支持OAuth 2.0和API Key两种方式...',
    relevance: 0.72,
    chunks: 1,
  },
];

export function SearchTestPanel({ isOpen, onClose, knowledgeBaseName }: SearchTestPanelProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setResults(mockSearchResults);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            检索测试
          </SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            测试知识库 "{knowledgeBaseName}" 的检索效果
          </p>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden py-4">
          {/* 输入区域 */}
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="输入测试问题，例如：产品的核心功能是什么？"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] resize-none pr-12"
              />
              <button
                onClick={clearSearch}
                className={cn(
                  'absolute top-2 right-2 p-1 rounded hover:bg-accent transition-opacity',
                  query ? 'opacity-100' : 'opacity-0'
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="w-full gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  检索中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  开始检索
                </>
              )}
            </Button>
          </div>

          {/* 结果区域 */}
          <div className="flex-1 overflow-y-auto mt-6 space-y-4">
            {!hasSearched && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  输入问题开始测试检索效果
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  系统将从知识库中检索最相关的文档片段
                </p>
              </div>
            )}

            {hasSearched && !isSearching && results.length > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>找到 {results.length} 个相关片段</span>
                  <span>按相关度排序</span>
                </div>

                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {index + 1}
                          </span>
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {result.documentName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {result.chunks} 片段
                          </span>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            {(result.relevance * 100).toFixed(0)}% 匹配
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {result.content}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {hasSearched && !isSearching && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">未找到相关结果</p>
                <p className="text-xs text-muted-foreground mt-2">
                  尝试使用不同的关键词或添加更多文档
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
