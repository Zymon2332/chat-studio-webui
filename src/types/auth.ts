import type { UserInfo } from './user';

export type { UserInfo };

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
