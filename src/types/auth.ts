/**
 * 用户信息
 */
export interface UserInfo {
  userId: string;
  email: string;
  nickName: string;
  state: string;             // 用户状态
  inviteCode: string;        // 邀请码
  capacity: number;          // 容量限制
  profileAvatarUrl: string;  // 头像 URL
  userRole: 'ADMIN' | 'ORDINARY';  // 用户角色
  createdTime: string;       // ISO 8601 格式
}

/**
 * 登录请求
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 登录响应数据
 */
export interface LoginData {
  userInfo: UserInfo;
  tokenValue: string;        // Token 字符串
  tokenExpireTime: number;   // 过期时间戳（毫秒）
}
