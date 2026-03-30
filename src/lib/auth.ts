import api, { handleResponse } from './api';
import type { LoginRequest, LoginData, UserInfo } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

/**
 * 用户登录
 */
export const login = async (data: LoginRequest): Promise<LoginData> => {
  const response = await api.post<ApiResponse<LoginData>>('/auth/login', data);
  return handleResponse(response.data);
};

/**
 * 发送验证码
 */
export const sendVerificationCode = async (email: string): Promise<void> => {
  const response = await api.get<ApiResponse<void>>('/auth/sendCode', {
    params: { email }
  });
  handleResponse(response.data);
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<UserInfo> => {
  const response = await api.get<ApiResponse<UserInfo>>('/user/info');
  return handleResponse(response.data);
};

/**
 * 用户注册
 */
export interface RegisterRequest {
  email: string;
  pwd: string;
  captcha: string;
  inviteCode?: string;
}

export const register = async (data: RegisterRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/auth/register', data);
  handleResponse(response.data);
};

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/auth/logout');
  handleResponse(response.data);
};
