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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Lock,
  Unlock,
  Trash2,
  User,
} from 'lucide-react';
import {
  getUserList,
  createUser,
  updateUser,
  freezeUser,
  activeUser,
  deleteUser,
} from '@/lib/admin/user';
import { UserFormDialog } from '../components/UserFormDialog';
import type {
  UserInfo,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types/user';
import {
  UserStateLabels,
  UserRoleLabels,
  UserStateVariants,
  UserRoleVariants,
} from '@/types/user';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 表单弹窗状态
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [actionType, setActionType] = useState<'freeze' | 'active'>('freeze');
  const [actionLoading, setActionLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserList({
        pageNum: currentPage,
        pageSize,
      });
      setUsers(result.records);
      setTotal(result.total);
    } catch (error) {
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 过滤用户
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.nickName.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 总页数
  const totalPages = Math.ceil(total / pageSize);

  // 打开新增表单
  const handleAdd = () => {
    setEditingUser(null);
    setFormDialogOpen(true);
  };

  // 打开编辑表单
  const handleEdit = (user: UserInfo) => {
    setEditingUser(user);
    setFormDialogOpen(true);
  };

  // 提交表单
  const handleFormSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    setFormLoading(true);
    try {
      if (editingUser) {
        await updateUser(data as UpdateUserRequest);
        toast.success('用户更新成功');
      } else {
        await createUser(data as CreateUserRequest);
        toast.success('用户创建成功');
      }
      setFormDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setFormLoading(false);
    }
  };

  // 打开冻结/激活确认对话框
  const handleActionClick = (user: UserInfo, type: 'freeze' | 'active') => {
    setSelectedUser(user);
    setActionType(type);
    setActionDialogOpen(true);
  };

  // 执行冻结/激活操作
  const handleActionConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (actionType === 'freeze') {
        await freezeUser(selectedUser.userId);
        toast.success('用户已冻结');
      } else {
        await activeUser(selectedUser.userId);
        toast.success('用户已激活');
      }
      setActionDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 打开删除确认对话框
  const handleDeleteClick = (user: UserInfo) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // 执行删除
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.userId);
      toast.success('用户已删除');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
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
          <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">管理系统所有用户账号</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增用户
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索邮箱或昵称..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* 用户表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户信息</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>容量</TableHead>
              <TableHead>邀请码</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <User className="h-8 w-8 mb-2" />
                    <p>暂无用户数据</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profileAvatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.nickName?.slice(0, 2) || user.email.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.nickName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={UserRoleVariants[user.userRole]}>
                      {UserRoleLabels[user.userRole]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={UserStateVariants[user.state]}>
                      {UserStateLabels[user.state]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.capacity === -1 ? (
                      <span className="text-muted-foreground">无限制</span>
                    ) : (
                      user.capacity
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {user.inviteCode}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(user.createdTime)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        {user.state !== 'FROZEN' && (
                          <DropdownMenuItem
                            onClick={() => handleActionClick(user, 'freeze')}
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            冻结
                          </DropdownMenuItem>
                        )}
                        {user.state !== 'ACTIVE' && (
                          <DropdownMenuItem
                            onClick={() => handleActionClick(user, 'active')}
                          >
                            <Unlock className="mr-2 h-4 w-4" />
                            激活
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(user)}
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

      {/* 用户表单弹窗 */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        user={editingUser}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* 冻结/激活确认对话框 */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'freeze' ? '冻结用户' : '激活用户'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要{actionType === 'freeze' ? '冻结' : '激活'}用户 "
              {selectedUser?.nickName || selectedUser?.email}" 吗？
              {actionType === 'freeze' && ' 冻结后该用户将无法登录系统。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActionConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? '处理中...' : '确认'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 "{selectedUser?.nickName || selectedUser?.email}" 吗？
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
