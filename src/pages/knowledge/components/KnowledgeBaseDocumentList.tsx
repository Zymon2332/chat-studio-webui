import { useState, useEffect, useCallback } from 'react';
import type { KnowledgeBase, ViewMode, SortBy, Document } from '../types';
import { DocumentList } from './DocumentList';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { fetchDocuments } from '@/lib/knowledge';
import type { PageResult } from '@/types/api';
import { toast } from 'sonner';

interface KnowledgeBaseDocumentListProps {
  knowledgeBase: KnowledgeBase;
  onDeleteDocs: (ids: string[]) => void;
  onUploadClick: () => void;
  onPreview: (document: Document) => void;
  refreshTrigger?: number;
}

export function KnowledgeBaseDocumentList({
  knowledgeBase,
  onDeleteDocs,
  onUploadClick,
  onPreview,
  refreshTrigger = 0,
}: KnowledgeBaseDocumentListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pageResult, setPageResult] = useState<PageResult<Document> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchDocuments(knowledgeBase.id, {
        pageNum: currentPage,
        pageSize,
      });
      setPageResult(result);
      setDocuments(result.records || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('加载文档列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [knowledgeBase.id, currentPage, pageSize]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshTrigger]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div>
            <h1 className="text-xl font-semibold">{knowledgeBase.name}</h1>
            <p className="text-sm text-muted-foreground">
              {knowledgeBase.description || '暂无描述'}
            </p>
          </div>
        </div>
      </div>

      {/* 文档列表区 */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        {documents.length === 0 && !isLoading ? (
          <EmptyState onUpload={onUploadClick} />
        ) : (
          <DocumentList
            documents={documents}
            viewMode={viewMode}
            sortBy={sortBy}
            currentPage={currentPage}
            pageSize={pageSize}
            total={pageResult?.total || 0}
            isLoading={isLoading}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
            onPageChange={handlePageChange}
            onPreview={onPreview}
            onDelete={onDeleteDocs}
            onRefresh={loadDocuments}
          />
        )}
      </div>

      {/* 浮动操作按钮（当列表不为空时显示） */}
      {documents.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={onUploadClick}
          >
            <Upload className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
