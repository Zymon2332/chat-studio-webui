import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Document } from '../types';
import {
  FileText,
  Link2,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  MoreVertical,
  RotateCcw,
  Trash2,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileImage,
  FileCode,
  FileType,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

interface DocumentCardProps {
  document: Document;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onRetry?: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview?: (document: Document) => void;
}

function getFileIcon(fileType?: string) {
  switch (fileType?.toLowerCase()) {
    case 'pdf':
      return FileText;
    case 'docx':
    case 'doc':
      return FileType;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return FileSpreadsheet;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'sketch':
    case 'fig':
      return FileImage;
    case 'md':
    case 'txt':
    case 'json':
    case 'js':
    case 'ts':
    case 'tsx':
      return FileCode;
    default:
      return File;
  }
}

function StatusBadge({ status }: { status: Document['status'] }) {
  switch (status) {
    case 'indexed':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          已索引
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          处理中
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          待处理
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <XCircle className="h-3.5 w-3.5" />
          失败
        </span>
      );
  }
}

export function DocumentCard({
  document,
  isSelected,
  onSelect,
  onRetry,
  onDelete,
  onPreview,
}: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = document.type === 'link' ? Link2 : getFileIcon(document.fileType);

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-4 rounded-lg border transition-all',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:shadow-sm'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 选择框 */}
      <div className="pt-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(document.id, checked as boolean)}
        />
      </div>

      {/* 图标 */}
      <div
        className={cn(
          'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          document.type === 'link'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4
              className="font-medium text-sm truncate cursor-pointer hover:text-primary"
              onClick={() => onPreview?.(document)}
            >
              {document.name}
            </h4>
            {document.type === 'link' && document.url && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {document.url}
              </p>
            )}
          </div>

          {/* 操作菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'p-1.5 rounded-md transition-opacity',
                  isHovered || isSelected ? 'opacity-100' : 'opacity-0',
                  'hover:bg-accent'
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview?.(document)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                预览/查看
              </DropdownMenuItem>
              {document.status === 'failed' && onRetry && (
                <DropdownMenuItem onClick={() => onRetry(document.id)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  重新索引
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(document.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 元信息 */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <StatusBadge status={document.status} />
          <span className="w-px h-3 bg-border" />
          {document.status === 'indexed' && (
            <>
              <span>{document.chunks} 片段</span>
              <span className="w-px h-3 bg-border" />
            </>
          )}
          {document.size && <span>{document.size}</span>}
          {document.size && <span className="w-px h-3 bg-border" />}
          <span>{document.updatedAt}</span>
          {document.citations > 0 && (
            <>
              <span className="w-px h-3 bg-border" />
              <span className="text-primary">引用 {document.citations} 次</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
