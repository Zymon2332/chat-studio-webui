import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Document, ViewMode, SortBy } from '../types';
import { DocumentCard } from './DocumentCard';
import {
  FileText,
  ArrowUpDown,
  Clock,
  Quote,
  CheckSquare,
  Square,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from './EmptyState';

interface DocumentListProps {
  documents: Document[];
  viewMode: ViewMode;
  sortBy: SortBy;
  currentPage: number;
  pageSize: number;
  total: number;
  isLoading: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortBy) => void;
  onPageChange: (page: number) => void;
  onPreview: (document: Document) => void;
  onDelete: (ids: string[]) => void;
  onRefresh: () => void;
}

export function DocumentList({
  documents,
  viewMode,
  sortBy,
  currentPage,
  pageSize,
  total,
  isLoading,
  onViewModeChange,
  onSortChange,
  onPageChange,
  onPreview,
  onDelete,
  onRefresh,
}: DocumentListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  // 筛选和排序
  const filteredAndSortedDocs = useMemo(() => {
    let filtered = documents || [];

    if (viewMode === 'files') {
      // 这里可以根据需要添加文件类型过滤
      filtered = documents.filter((d) => d.title.match(/\.(pdf|docx?|pptx?|xlsx?|txt|md)$/i));
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'citations':
          // 暂时使用 chunkSize 作为排序依据，后续可以添加 citation 统计
          return b.chunkSize - a.chunkSize;
        default:
          return 0;
      }
    });
  }, [documents, viewMode, sortBy]);

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedDocs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedDocs.map((d) => d.docId)));
    }
  };

  const handleSingleDelete = () => {
    if (docToDelete) {
      onDelete([docToDelete]);
      setDocToDelete(null);
    }
  };

  // 生成分页页码
  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      }
    }

    return items;
  };

  if (documents.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  const allSelected =
    filteredAndSortedDocs.length > 0 &&
    selectedIds.size === filteredAndSortedDocs.length;

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between py-3 border-b">
        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="flex items-center border rounded-md p-0.5">
            <button
              onClick={() => onViewModeChange('all')}
              className={cn(
                'px-3 py-1.5 text-sm rounded transition-colors',
                viewMode === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              全部
            </button>
            <button
              onClick={() => onViewModeChange('files')}
              className={cn(
                'px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5',
                viewMode === 'files'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              文档
            </button>
          </div>

          {/* 排序 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                排序
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onSortChange('updated')}>
                <Clock className="mr-2 h-4 w-4" />
                更新时间
                {sortBy === 'updated' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('name')}>
                <span className="mr-2 text-sm">Aa</span>
                名称
                {sortBy === 'name' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('citations')}>
                <Quote className="mr-2 h-4 w-4" />
                引用次数
                {sortBy === 'citations' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 刷新按钮 */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            刷新
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          共 {total} 个文档
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-md my-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-sm hover:text-primary"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              已选择 {selectedIds.size} 项
            </button>
          </div>
        </div>
      )}

      {/* 文档列表 */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedDocs.map((doc) => (
              <DocumentCard
                key={doc.docId}
                document={doc}
                isSelected={selectedIds.has(doc.docId)}
                onSelect={handleSelect}
                onClick={onPreview}
                onDelete={(id) => setDocToDelete(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {!isLoading && (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {getPaginationItems().map((item, index) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      onClick={() => onPageChange(item as number)}
                      isActive={currentPage === item}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={!!docToDelete} onOpenChange={() => setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个文档吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSingleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
