import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { KnowledgeBase } from '../types';
import { BookOpen, Plus, Settings, Trash2, ChevronRight, Library } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface KnowledgeSidebarProps {
  knowledgeBases: KnowledgeBase[];
  currentKbId: string;
  onSelectKb: (id: string) => void;
  onCreateKb: (name: string, description: string) => void;
  onDeleteKb: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function KnowledgeSidebar({
  knowledgeBases,
  currentKbId,
  onSelectKb,
  onCreateKb,
  onDeleteKb,
  isExpanded,
  onToggleExpand,
}: KnowledgeSidebarProps) {
  const [kbToDelete, setKbToDelete] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDescription, setNewKbDescription] = useState('');

  const currentKb = knowledgeBases.find(kb => kb.id === currentKbId);

  const handleCreateKb = () => {
    if (newKbName.trim()) {
      onCreateKb(newKbName.trim(), newKbDescription.trim());
      setNewKbName('');
      setNewKbDescription('');
      setShowCreateDialog(false);
    }
  };

  const handleDeleteKb = () => {
    if (kbToDelete) {
      onDeleteKb(kbToDelete);
      setKbToDelete(null);
    }
  };

  return (
    <>
      {/* 可折叠 Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r bg-background transition-all duration-300 ease-in-out h-full',
          isExpanded ? 'w-64' : 'w-14'
        )}
      >
        {/* 切换按钮 */}
        <div className="flex items-center justify-center p-3 border-b">
          <button
            onClick={onToggleExpand}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title={isExpanded ? '收起' : '展开'}
          >
            <Library className={cn('h-5 w-5 transition-transform duration-300', isExpanded && 'rotate-180')} />
          </button>
        </div>

        {isExpanded ? (
          // 展开状态
          <>
            <div className="p-3 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">知识库列表</h3>
              <div className="space-y-1">
                {knowledgeBases.map((kb) => (
                  <div
                    key={kb.id}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all',
                      currentKbId === kb.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent'
                    )}
                    onClick={() => onSelectKb(kb.id)}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{kb.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {kb.totalDocuments} 文档 · {kb.totalLinks} 链接
                      </div>
                    </div>
                    {currentKbId === kb.id && (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Plus className="h-4 w-4" />
                    新建知识库
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新建知识库</DialogTitle>
                    <DialogDescription>
                      创建一个新的知识库来组织您的文档和链接。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">名称</label>
                      <Input
                        placeholder="输入知识库名称"
                        value={newKbName}
                        onChange={(e) => setNewKbName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">描述（可选）</label>
                      <Textarea
                        placeholder="描述这个知识库的用途"
                        value={newKbDescription}
                        onChange={(e) => setNewKbDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateKb} disabled={!newKbName.trim()}>
                      创建
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 当前知识库操作 */}
            {currentKb && (
              <div className="mt-auto p-3 border-t space-y-2">
                <div className="text-xs text-muted-foreground mb-2">
                  当前：{currentKb.name}
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
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
            )}
          </>
        ) : (
          // 折叠状态 - 只显示图标
          <div className="flex flex-col items-center py-3 gap-2">
            {knowledgeBases.map((kb) => (
              <button
                key={kb.id}
                onClick={() => onSelectKb(kb.id)}
                className={cn(
                  'p-2 rounded-md transition-all relative group',
                  currentKbId === kb.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-muted-foreground'
                )}
                title={`${kb.name} (${kb.totalDocuments} 文档)`}
              >
                <BookOpen className="h-5 w-5" />
                {currentKbId === kb.id && (
                  <span className="absolute right-1 top-1 w-2 h-2 bg-primary rounded-full" />
                )}
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {kb.name}
                </div>
              </button>
            ))}
            <div className="w-8 h-px bg-border my-1" />
            <button
              onClick={() => setShowCreateDialog(true)}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              title="新建知识库"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!kbToDelete} onOpenChange={() => setKbToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除知识库</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除知识库"{currentKb?.name}"吗？此操作将删除该知识库中的所有文档和链接，且不可恢复。
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
