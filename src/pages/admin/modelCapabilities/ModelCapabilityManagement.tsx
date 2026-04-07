import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Cpu,
} from 'lucide-react';
import {
  getModelAbilityList,
  createModelAbility,
  updateModelAbility,
  enableModelAbility,
  disableModelAbility,
  deleteModelAbility,
} from '@/lib/admin/modelAbility';
import { getModelProviderList } from '@/lib/admin/modelProvider';
import { ModelAbilityFormDialog } from '../components/ModelAbilityFormDialog';
import type {
  ModelAbility,
  CreateModelAbilityRequest,
  UpdateModelAbilityRequest,
} from '@/types/modelAbility';
import {
  AbilityLabels,
  AbilityColors,
  parseAbilities,
} from '@/types/modelAbility';
import type { ModelProvider } from '@/types/modelProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ModelCapabilityManagement: React.FC = () => {
  const [models, setModels] = useState<ModelAbility[]>([]);
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');

  // 表单弹窗状态
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelAbility | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelAbility | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 获取模型能力列表
  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getModelAbilityList({
        pageNum: currentPage,
        pageSize,
        providerId: filterProvider === 'all' ? undefined : filterProvider,
        modelName: searchKeyword || undefined,
        enabled: filterEnabled === 'all' ? undefined : filterEnabled === 'true',
      });
      setModels(result.records);
      setTotal(result.total);
    } catch (error) {
      toast.error('获取模型能力列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterProvider, searchKeyword, filterEnabled]);

  // 获取供应商列表
  const fetchProviders = async () => {
    try {
      const result = await getModelProviderList({ pageSize: 100 });
      setProviders(result.records);
    } catch (error) {
      toast.error('获取供应商列表失败');
    }
  };

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    fetchProviders();
  }, []);

  // 总页数
  const totalPages = Math.ceil(total / pageSize);

  // 打开新增表单
  const handleAdd = () => {
    setEditingModel(null);
    setFormDialogOpen(true);
  };

  // 打开编辑表单
  const handleEdit = (model: ModelAbility) => {
    setEditingModel(model);
    setFormDialogOpen(true);
  };

  // 提交表单
  const handleFormSubmit = async (data: CreateModelAbilityRequest | UpdateModelAbilityRequest) => {
    setFormLoading(true);
    try {
      if (editingModel) {
        await updateModelAbility(data as UpdateModelAbilityRequest);
        toast.success('模型能力更新成功');
      } else {
        await createModelAbility(data as CreateModelAbilityRequest);
        toast.success('模型能力创建成功');
      }
      setFormDialogOpen(false);
      fetchModels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setFormLoading(false);
    }
  };

  // 切换启用状态
  const handleToggleEnabled = async (model: ModelAbility) => {
    try {
      if (model.enabled) {
        await disableModelAbility(model.id);
        toast.success('模型能力已停用');
      } else {
        await enableModelAbility(model.id);
        toast.success('模型能力已启用');
      }
      fetchModels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  // 打开删除确认对话框
  const handleDeleteClick = (model: ModelAbility) => {
    setSelectedModel(model);
    setDeleteDialogOpen(true);
  };

  // 执行删除
  const handleDeleteConfirm = async () => {
    if (!selectedModel) return;
    setDeleteLoading(true);
    try {
      await deleteModelAbility(selectedModel.id);
      toast.success('模型能力已删除');
      setDeleteDialogOpen(false);
      fetchModels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 获取供应商名称
  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.providerName || providerId;
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">模型能力管理</h1>
          <p className="text-muted-foreground">配置模型的能力支持</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增模型能力
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索模型名称..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filterProvider} onValueChange={setFilterProvider}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="所有供应商" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有供应商</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.providerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterEnabled} onValueChange={setFilterEnabled}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="所有状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="true">已启用</SelectItem>
            <SelectItem value="false">已停用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 模型能力表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型名称</TableHead>
              <TableHead>供应商</TableHead>
              <TableHead>能力配置</TableHead>
              <TableHead>启用状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Cpu className="h-8 w-8 mb-2" />
                    <p>暂无模型能力数据</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <span className="font-medium">{model.modelName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getProviderName(model.providerId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parseAbilities(model.abilities).map((ability) => (
                        <Badge
                          key={ability}
                          className={`text-xs ${AbilityColors[ability]}`}
                        >
                          {AbilityLabels[ability]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={model.enabled}
                      onCheckedChange={() => handleToggleEnabled(model)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(model.updatedTime)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(model)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(model)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {!loading && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {getPageNumbers().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={
                  currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* 模型能力表单弹窗 */}
      <ModelAbilityFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        modelAbility={editingModel}
        providers={providers}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除模型能力</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模型 "{selectedModel?.modelName}" 的能力配置吗？
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLoading ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
