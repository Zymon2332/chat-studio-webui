
import { cn } from '@/lib/utils';
import type { Document, ProcessStatus } from '../types';
import {
  FileText,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  File,
  FileSpreadsheet,
  FileImage,
  FileCode,
  FileType,
  Layers,
  HardDrive,
  Database,
  Tag,
  Trash2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DocumentCardProps {
  document: Document;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onClick: (document: Document) => void;
  onDelete?: (docId: string) => void;
}

// 从文件名获取文件类型
function getFileTypeFromName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return ext;
}

function getFileIcon(fileName: string) {
  const fileType = getFileTypeFromName(fileName);
  switch (fileType) {
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
    case 'webp':
    case 'bmp':
      return FileImage;
    case 'md':
    case 'txt':
    case 'json':
    case 'js':
    case 'ts':
    case 'tsx':
    case 'html':
      return FileCode;
    default:
      return File;
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化 Token 数量
function formatTokenCount(count: number | null): string {
  if (count === null || count === undefined) return '--';
  return count.toLocaleString();
}

// 状态配置
const statusConfig: Record<
  ProcessStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  PENDING: {
    label: '等待中',
    icon: Clock,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
  PARSING: {
    label: '解析中',
    icon: Loader2,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  SHARDING: {
    label: '分片中',
    icon: Loader2,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  VECTORIZING: {
    label: '向量化',
    icon: Loader2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  COMPLETED: {
    label: '已完成',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  FAILED: {
    label: '失败',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
};

function StatusBadge({ status, errorText }: { status: ProcessStatus; errorText: string | null }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgColor,
        config.color
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', status !== 'COMPLETED' && status !== 'FAILED' && 'animate-spin')} />
      {config.label}
    </span>
  );

  if (status === 'FAILED' && errorText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            <p className="text-xs">{errorText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

// 格式化日期时间
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DocumentCard({
  document,
  isSelected,
  onSelect,
  onClick,
  onDelete,
}: DocumentCardProps) {
  const Icon = getFileIcon(document.title);

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:shadow-sm'
      )}
      onClick={() => onClick(document)}
    >
      {/* 选择框 */}
      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(document.docId, checked as boolean)}
        />
      </div>

      {/* 图标 */}
      <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
        <Icon className="h-5 w-5" />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        {/* 标题行 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate hover:text-primary">{document.title}</h4>
          </div>

          {/* 状态徽章 */}
          <StatusBadge status={document.processStatus} errorText={document.errorText} />
        </div>

        {/* 标签 */}
        {document.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 元信息 */}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {document.chunkSize} 分片
          </span>

          <span className="inline-flex items-center gap-1">
            <HardDrive className="h-3.5 w-3.5" />
            {formatFileSize(document.size)}
          </span>

          {document.totalTokenCount !== null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <Database className="h-3.5 w-3.5" />
                    {formatTokenCount(document.totalTokenCount)} tokens
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs space-y-1">
                    <p>输入: {formatTokenCount(document.inputTokenCount)}</p>
                    <p>输出: {formatTokenCount(document.outputTokenCount)}</p>
                    <p>总计: {formatTokenCount(document.totalTokenCount)}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <span>{formatDateTime(document.uploadTime)}</span>
        </div>
      </div>

      {/* 删除按钮 - hover时显示 */}
      {onDelete && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(document.docId);
            }}
            className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
