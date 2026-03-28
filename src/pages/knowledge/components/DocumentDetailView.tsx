import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Document, Chunk } from '../types';
import { fetchDocumentDetail, fetchChunks, updateChunk } from '@/lib/knowledge';
import { toast } from 'sonner';

import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  Layers,
  HardDrive,
  Database,
  Calendar,
  CheckSquare,
  Square,
  FolderOpen,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { DocumentDetail } from '../types';

interface DocumentDetailViewProps {
  document: Document;
  onBack: () => void;
}

// 状态配置
const statusConfig = {
  PENDING: { label: '等待中', icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  PARSING: { label: '解析中', icon: Loader2, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  SHARDING: { label: '分片中', icon: Loader2, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  VECTORIZING: { label: '向量化', icon: Loader2, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  COMPLETED: { label: '已完成', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  FAILED: { label: '失败', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
};

function StatusBadge({ status }: { status: Document['processStatus'] }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bgColor, config.color)}>
      <Icon className={cn('h-3.5 w-3.5', status !== 'COMPLETED' && status !== 'FAILED' && 'animate-spin')} />
      {config.label}
    </span>
  );
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

export function DocumentDetailView({ document, onBack }: DocumentDetailViewProps) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  // 切片列表状态
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalChunks, setTotalChunks] = useState(0);
  
  // 选择状态
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<string>>(new Set());

  // 抽屉状态
  const [selectedChunk, setSelectedChunk] = useState<Chunk | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 加载文档详情
  useEffect(() => {
    loadDetail();
  }, [document.docId]);

  // 加载切片列表
  useEffect(() => {
    loadChunks();
  }, [document.docId, currentPage]);

  const loadDetail = async () => {
    setIsLoadingDetail(true);
    try {
      const data = await fetchDocumentDetail(document.docId);
      setDetail(data);
    } catch (error) {
      console.error('Failed to load document detail:', error);
      toast.error('加载文档详情失败');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadChunks = async () => {
    setIsLoadingChunks(true);
    try {
      const result = await fetchChunks(document.docId, {
        pageNum: currentPage,
        pageSize,
      });
      setChunks(result.records || []);
      setTotalChunks(result.total);
    } catch (error) {
      console.error('Failed to load chunks:', error);
      toast.error('加载切片列表失败');
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const handleSelectChunk = (chunkId: string, selected: boolean) => {
    const newSelected = new Set(selectedChunkIds);
    if (selected) {
      newSelected.add(chunkId);
    } else {
      newSelected.delete(chunkId);
    }
    setSelectedChunkIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedChunkIds.size === chunks.length) {
      setSelectedChunkIds(new Set());
    } else {
      setSelectedChunkIds(new Set(chunks.map(c => c.chunkId)));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 点击切片打开抽屉
  const handleChunkClick = (chunk: Chunk) => {
    setSelectedChunk(chunk);
    setEditContent(chunk.content);
    setIsSheetOpen(true);
  };

  // 保存切片
  const handleSaveChunk = async () => {
    if (!selectedChunk) return;

    const trimmedContent = editContent.trim();
    if (!trimmedContent) {
      toast.error('切片内容不能为空');
      return;
    }

    setIsSaving(true);
    try {
      await updateChunk({
        docId: document.docId,
        chunkId: selectedChunk.chunkId,
        content: trimmedContent,
      });

      toast.success('切片保存成功');

      // 更新本地数据
      setChunks(prev => prev.map(c =>
        c.chunkId === selectedChunk.chunkId
          ? { ...c, content: trimmedContent }
          : c
      ));

      setIsSheetOpen(false);
    } catch (error) {
      console.error('Failed to update chunk:', error);
      toast.error('保存切片失败');
    } finally {
      setIsSaving(false);
    }
  };

  const allSelected = chunks.length > 0 && selectedChunkIds.size === chunks.length;
  const totalPages = Math.ceil(totalChunks / pageSize);

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <h1 className="text-lg font-semibold">{document.title}</h1>
            </div>
            {document.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {document.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={document.processStatus} />
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-sm hover:text-primary"
          >
            {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            <span>{totalChunks} 分段</span>
          </button>
          
          {selectedChunkIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              已选择 {selectedChunkIds.size} 项
            </span>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧切片列表 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 切片列表 - 可滚动区域 */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingChunks ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {chunks.map((chunk, index) => (
                  <div
                    key={chunk.chunkId}
                    onClick={() => handleChunkClick(chunk)}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedChunkIds.has(chunk.chunkId)}
                        onCheckedChange={(checked) => 
                          handleSelectChunk(chunk.chunkId, checked as boolean)
                        }
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          分段-{String((currentPage - 1) * pageSize + index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{chunk.content.length} 字符</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">{chunk.content}</p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 分页 - 固定在底部 */}
          {totalPages > 0 && !isLoadingChunks && (
            <div className="py-4 shrink-0">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                          onClick={() => handlePageChange(item as number)}
                          isActive={currentPage === item}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* 右侧详情面板 */}
        <div className="w-80 border-l p-4 overflow-y-auto bg-muted/30">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  基本信息
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">文档ID</p>
                    <p className="font-mono text-xs break-all">{detail.docId}</p>
                  </div>
                  
                  {detail.tags.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">标签</p>
                      <div className="flex flex-wrap gap-1">
                        {detail.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">分片数量:</span>
                    <span>{detail.chunkSize}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Token 消耗
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">输入</p>
                    <p className="font-medium">{formatTokenCount(detail.inputTokenCount)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">输出</p>
                    <p className="font-medium">{formatTokenCount(detail.outputTokenCount)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">总计</p>
                    <p className="font-medium">{formatTokenCount(detail.totalTokenCount)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  文件信息
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">原始文件名</p>
                    <p className="font-medium">{detail.fileUploads.originalName}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">文件类型</p>
                    <p className="font-medium">{detail.fileUploads.contentType}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">文件大小:</span>
                    <span>{formatFileSize(detail.fileUploads.contentLength)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">上传时间:</span>
                    <span>{formatDateTime(detail.fileUploads.createdTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* 编辑抽屉 */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[600px] flex flex-col">
          <SheetHeader className="shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              编辑切片
            </SheetTitle>
            {selectedChunk && (
              <p className="text-sm text-muted-foreground mt-1">
                分段-{String(selectedChunk.chunkIndex + 1).padStart(2, '0')} · {selectedChunk.content.length} 字符
              </p>
            )}
          </SheetHeader>
          
          {selectedChunk && (
            <>
              {/* 可滚动的内容区域 */}
              <div className="flex-1 overflow-y-auto -mx-6 px-6">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 resize-none min-h-full text-base leading-relaxed"
                  placeholder="切片内容..."
                />
              </div>
              
              {/* 固定在底部的按钮 */}
              <div className="flex justify-end gap-2 mt-4 pt-4 pb-6 px-6 border-t shrink-0">
                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                  取消
                </Button>
                <Button 
                  onClick={handleSaveChunk}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '保存'
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
