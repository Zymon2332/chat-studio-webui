/**
 * 用户管理类型定义
 */

/**
 * 用户状态枚举
 */
export type UserState = 'INIT' | 'ACTIVE' | 'FROZEN';

/**
 * 用户角色枚举
 */
export type UserRole = 'ADMIN' | 'ORDINARY';

/**
 * 用户详情
 */
export interface UserInfo {
  userId: string;
  email: string;
  nickName: string;
  state: UserState;
  inviteCode: string;
  capacity: number;
  profileAvatarUrl: string;
  userRole: UserRole;
  createdTime: string;
}

/**
 * 新增用户请求
 */
export interface CreateUserRequest {
  email: string;
  nickName: string;
  password: string;
  state: UserState;
  inviteCode?: string;
  inviterId?: string;
  capacity: number;
  profileAvatarUrl?: string;
  userRole: UserRole;
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
  userId: string;
  email?: string;
  nickName?: string;
  state?: UserState;
  inviterId?: string;
  capacity?: number;
  profileAvatarUrl?: string;
  userRole?: UserRole;
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 用户状态标签
 */
export const UserStateLabels: Record<UserState, string> = {
  INIT: '初始',
  ACTIVE: '已激活',
  FROZEN: '已冻结',
};

/**
 * 用户角色标签
 */
export const UserRoleLabels: Record<UserRole, string> = {
  ADMIN: '管理员',
  ORDINARY: '普通用户',
};

/**
 * 用户状态样式配置
 */
export const UserStateVariants: Record<UserState, 'default' | 'secondary' | 'destructive'> = {
  INIT: 'secondary',
  ACTIVE: 'default',
  FROZEN: 'destructive',
};

/**
 * 用户角色样式配置
 */
export const UserRoleVariants: Record<UserRole, 'default' | 'secondary'> = {
  ADMIN: 'default',
  ORDINARY: 'secondary',
};
