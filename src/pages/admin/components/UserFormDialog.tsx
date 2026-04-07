import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  type UserInfo,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserState,
  type UserRole,
  UserStateLabels,
  UserRoleLabels,
} from '@/types/user';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserInfo | null;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  loading?: boolean;
}

const defaultFormData: CreateUserRequest = {
  email: '',
  nickName: '',
  password: '',
  state: 'ACTIVE',
  capacity: -1,
  userRole: 'ORDINARY',
};

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!user;
  const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>(() => {
    if (user) {
      return {
        userId: user.userId,
        email: user.email,
        nickName: user.nickName,
        state: user.state,
        capacity: user.capacity,
        profileAvatarUrl: user.profileAvatarUrl,
        userRole: user.userRole,
      };
    }
    return defaultFormData;
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        userId: user.userId,
        email: user.email,
        nickName: user.nickName,
        state: user.state,
        capacity: user.capacity,
        profileAvatarUrl: user.profileAvatarUrl,
        userRole: user.userRole,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [user, open]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileAvatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {user?.nickName?.slice(0, 2) || user?.email?.slice(0, 2) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">用户 ID</p>
                <p className="font-mono text-sm">{user?.userId}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickName">
                昵称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nickName"
                placeholder="用户昵称"
                value={formData.nickName || ''}
                onChange={(e) => handleChange('nickName', e.target.value)}
                required
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">
                密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="6-64 位密码"
                value={(formData as CreateUserRequest).password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
                maxLength={64}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userRole">
                用户角色 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.userRole}
                onValueChange={(value: UserRole) => handleChange('userRole', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{UserRoleLabels.ADMIN}</SelectItem>
                  <SelectItem value="ORDINARY">{UserRoleLabels.ORDINARY}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">
                用户状态 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.state}
                onValueChange={(value: UserState) => handleChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INIT">{UserStateLabels.INIT}</SelectItem>
                  <SelectItem value="ACTIVE">{UserStateLabels.ACTIVE}</SelectItem>
                  <SelectItem value="FROZEN">{UserStateLabels.FROZEN}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">
              容量 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              placeholder="-1 表示无限制"
              value={formData.capacity ?? ''}
              onChange={(e) => handleChange('capacity', parseInt(e.target.value, 10) || 0)}
              required
            />
            <p className="text-xs text-muted-foreground">输入 -1 表示无限制</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileAvatarUrl">头像地址</Label>
            <Input
              id="profileAvatarUrl"
              placeholder="https://example.com/avatar.png"
              value={formData.profileAvatarUrl || ''}
              onChange={(e) => handleChange('profileAvatarUrl', e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : isEdit ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
