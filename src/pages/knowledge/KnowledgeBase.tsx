import { useState, useMemo } from 'react';
import { mockKnowledgeBases } from './types';
import type { ViewMode, SortBy } from './types';
import { KnowledgeSidebar } from './components/KnowledgeSidebar';
import { DocumentList } from './components/DocumentList';
import { SearchTestPanel } from './components/SearchTestPanel';
import { EmptyState } from './components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Upload, Link2, FileUp } from 'lucide-react';

export function KnowledgeBase() {
  const [knowledgeBases, setKnowledgeBases] = useState(mockKnowledgeBases);
  const [currentKbId, setCurrentKbId] = useState(mockKnowledgeBases[0].id);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const currentKb = useMemo(
    () => knowledgeBases.find((kb) => kb.id === currentKbId) || knowledgeBases[0],
    [knowledgeBases, currentKbId]
  );

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return currentKb.documents;
    return currentKb.documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentKb.documents, searchQuery]);

  const handleSelectKb = (id: string) => {
    setCurrentKbId(id);
    // 切换知识库时自动折叠sidebar（可选）
    // setIsSidebarExpanded(false);
  };

  const handleCreateKb = (name: string, description: string) => {
    const newKb = {
      id: `kb-${Date.now()}`,
      name,
      description,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: '刚刚',
      totalDocuments: 0,
      totalLinks: 0,
    };
    setKnowledgeBases([...knowledgeBases, newKb]);
    setCurrentKbId(newKb.id);
  };

  const handleDeleteKb = (id: string) => {
    const newKbs = knowledgeBases.filter((kb) => kb.id !== id);
    setKnowledgeBases(newKbs);
    if (currentKbId === id && newKbs.length > 0) {
      setCurrentKbId(newKbs[0].id);
    }
  };

  const handleRetry = (docId: string) => {
    // 模拟重试索引
    const newKbs = knowledgeBases.map((kb) => ({
      ...kb,
      documents: kb.documents.map((doc) =>
        doc.id === docId ? { ...doc, status: 'processing' as const } : doc
      ),
    }));
    setKnowledgeBases(newKbs);
  };

  const handleDeleteDocs = (ids: string[]) => {
    const newKbs = knowledgeBases.map((kb) =>
      kb.id === currentKbId
        ? {
            ...kb,
            documents: kb.documents.filter((doc) => !ids.includes(doc.id)),
          }
        : kb
    );
    setKnowledgeBases(newKbs);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: linkUrl.split('/').pop() || '未命名链接',
      type: 'link' as const,
      status: 'pending' as const,
      url: linkUrl,
      chunks: 0,
      updatedAt: '刚刚',
      citations: 0,
    };
    
    const newKbs = knowledgeBases.map((kb) =>
      kb.id === currentKbId
        ? { ...kb, documents: [newDoc, ...kb.documents] }
        : kb
    );
    setKnowledgeBases(newKbs);
    setLinkUrl('');
    setShowLinkDialog(false);
  };

  return (
    <div className="h-full flex">
      {/* 可折叠迷你 Sidebar */}
      <KnowledgeSidebar
        knowledgeBases={knowledgeBases}
        currentKbId={currentKbId}
        onSelectKb={handleSelectKb}
        onCreateKb={handleCreateKb}
        onDeleteKb={handleDeleteKb}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-semibold">{currentKb.name}</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {currentKb.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>

            {/* 检索测试按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchPanelOpen(true)}
              className="gap-1.5"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">检索测试</span>
            </Button>
          </div>
        </div>

        {/* 文档列表区 */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          {currentKb.documents.length === 0 ? (
            <EmptyState
              onUpload={() => setShowUploadDialog(true)}
              onAddLink={() => setShowLinkDialog(true)}
            />
          ) : (
            <DocumentList
              documents={filteredDocuments}
              viewMode={viewMode}
              sortBy={sortBy}
              onViewModeChange={setViewMode}
              onSortChange={setSortBy}
              onRetry={handleRetry}
              onDelete={handleDeleteDocs}
            />
          )}
        </div>

        {/* 浮动操作按钮（当列表不为空时显示） */}
        {currentKb.documents.length > 0 && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-2">
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                >
                  <Link2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加网页链接</DialogTitle>
                  <DialogDescription>
                    输入网页URL，系统将自动抓取并索引内容
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="https://example.com/article"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddLink} disabled={!linkUrl.trim()}>
                    添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>

      {/* 检索测试面板 */}
      <SearchTestPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        knowledgeBaseName={currentKb.name}
      />

      {/* 上传文档对话框 */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>上传文档</DialogTitle>
            <DialogDescription>
              拖拽文件到此处，或点击选择文件
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                点击或拖拽文件到此处
              </p>
              <p className="text-xs text-muted-foreground">
                支持 PDF、Word、Excel、Markdown、TXT 等格式
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              取消
            </Button>
            <Button disabled>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
