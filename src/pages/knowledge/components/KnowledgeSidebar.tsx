"use client"

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { KnowledgeBase } from '../types';
import { BookOpen, Plus, Settings, Trash2, ChevronRight, Search, FolderOpen, Upload } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { formatTimeAgo } from '@/lib/time';

interface KnowledgeSidebarProps {
  knowledgeBases: KnowledgeBase[];
  currentKbId: number | null;
  onSelectKb: (id: number) => void;
  onCreateClick: () => void;
  onSettingsClick: () => void;
  onDeleteKb: (id: number) => void;
  onSearchTestClick: () => void;
  onUploadClick: () => void;
}

export function KnowledgeSidebar({
  knowledgeBases,
  currentKbId,
  onSelectKb,
  onCreateClick,
  onSettingsClick,
  onDeleteKb,
  onSearchTestClick,
  onUploadClick,
}: KnowledgeSidebarProps) {
  const [kbToDelete, setKbToDelete] = useState<number | null>(null);

  const currentKb = knowledgeBases.find(kb => kb.id === currentKbId);

  const handleDeleteKb = () => {
    if (kbToDelete !== null) {
      onDeleteKb(kbToDelete);
      setKbToDelete(null);
    }
  };

  return (
    <>
      {/* 固定宽度的 Sidebar，无折叠功能 */}
      <Sidebar 
        collapsible="none" 
        className="w-[260px] border-r"
      >
        <SidebarHeader className="p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">知识库列表</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              title="新建知识库"
              onClick={onCreateClick}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-3">
          {knowledgeBases.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">暂无知识库</p>
              <p className="text-xs text-muted-foreground/70 px-4">
                点击右上角 + 按钮创建新知识库
              </p>
            </div>
          ) : (
          <div className="space-y-2">
            {knowledgeBases.map((kb) => (
              <div
                key={kb.id}
                onClick={() => onSelectKb(kb.id)}
                className={cn(
                  'group relative rounded-lg border p-3 cursor-pointer transition-all',
                  'hover:bg-accent/50 hover:border-accent',
                  currentKbId === kb.id
                    ? 'bg-primary/10 border-primary border-l-4 border-l-primary shadow-sm'
                    : 'bg-card border-border'
                )}
              >
                {/* 标题行 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className={cn(
                      'h-4 w-4 shrink-0',
                      currentKbId === kb.id ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      'font-medium truncate',
                      currentKbId === kb.id ? 'text-primary' : 'text-foreground'
                    )}>
                      {kb.name}
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    'h-4 w-4 shrink-0 transition-transform',
                    currentKbId === kb.id 
                      ? 'text-primary translate-x-0.5' 
                      : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                  )} />
                </div>

                {/* 元信息行：文档数 + 更新时间 */}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <span>{kb.docCount} 文档</span>
                  <span className="text-border">•</span>
                  <span>更新于 {formatTimeAgo(kb.updatedTime)}</span>
                </div>

                {/* 标签展示 */}
                {kb.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {kb.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0 h-4 font-normal"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {kb.tags.length > 3 && (
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0 h-4 font-normal"
                      >
                        +{kb.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </SidebarContent>

        {/* 当前知识库操作 */}
        {currentKb && (
            <SidebarFooter className="p-3">
            <div className="text-xs text-muted-foreground mb-2">
              当前：{currentKb.name}
            </div>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onUploadClick}>
                <Upload className="h-4 w-4" />
                上传文档
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onSearchTestClick}>
                <Search className="h-4 w-4" />
                检索测试
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onSettingsClick}>
                <Settings className="h-4 w-4" />
                知识库设置
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => setKbToDelete(currentKb.id)}
              >
                <Trash2 className="h-4 w-4" />
                删除知识库
              </Button>
            </div>
          </SidebarFooter>
        )}
      </Sidebar>

      {/* 删除确认对话框 */}
      <AlertDialog open={kbToDelete !== null} onOpenChange={() => setKbToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除知识库</AlertDialogTitle>
            <AlertDialogDescription>
              只能删除空知识库。请先将"{currentKb?.name}"中的所有文档删除后，再执行此操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKb} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
