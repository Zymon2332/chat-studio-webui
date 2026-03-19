import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Document, ViewMode, SortBy } from '../types';
import { DocumentCard } from './DocumentCard';
import {
  FileText,
  Link2,
  ArrowUpDown,
  Clock,
  Quote,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortBy) => void;
  onRetry: (id: string) => void;
  onDelete: (ids: string[]) => void;
  onPreview?: (document: Document) => void;
}

export function DocumentList({
  documents,
  viewMode,
  sortBy,
  onViewModeChange,
  onSortChange,
  onRetry,
  onDelete,
  onPreview,
}: DocumentListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [showBatchDelete, setShowBatchDelete] = useState(false);

  // 筛选和排序
  const filteredAndSortedDocs = useMemo(() => {
    let filtered = documents;

    if (viewMode === 'files') {
      filtered = documents.filter((d) => d.type === 'file');
    } else if (viewMode === 'links') {
      filtered = documents.filter((d) => d.type === 'link');
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return 0; // 保持原有顺序（mock数据已排序）
        case 'name':
          return a.name.localeCompare(b.name);
        case 'citations':
          return b.citations - a.citations;
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
      setSelectedIds(new Set(filteredAndSortedDocs.map((d) => d.id)));
    }
  };

  const handleBatchDelete = () => {
    onDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowBatchDelete(false);
  };

  const handleSingleDelete = () => {
    if (docToDelete) {
      onDelete([docToDelete]);
      setDocToDelete(null);
    }
  };

  if (documents.length === 0) {
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
            <button
              onClick={() => onViewModeChange('links')}
              className={cn(
                'px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5',
                viewMode === 'links'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <Link2 className="h-3.5 w-3.5" />
              链接
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
        </div>

        <div className="text-sm text-muted-foreground">
          共 {filteredAndSortedDocs.length} 个项目
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowBatchDelete(true)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              删除
            </Button>
          </div>
        </div>
      )}

      {/* 文档列表 */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-2">
          {filteredAndSortedDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isSelected={selectedIds.has(doc.id)}
              onSelect={handleSelect}
              onRetry={onRetry}
              onDelete={(id) => setDocToDelete(id)}
              onPreview={onPreview}
            />
          ))}
        </div>
      </div>

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

      {/* 批量删除确认 */}
      <AlertDialog open={showBatchDelete} onOpenChange={setShowBatchDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除选中的 {selectedIds.size} 个文档吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBatchDelete(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
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
