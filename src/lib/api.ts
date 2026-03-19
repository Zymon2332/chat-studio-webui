import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Axios 实例
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许携带 Cookie
});

/**
 * 响应拦截器 - 处理错误
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    // 处理 HTTP 错误
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.msg;
      
      switch (status) {
        case 401:
          // 未授权，跳转登录页（避免在登录页重复跳转）
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // 业务错误 - 抛出给组件决定
          throw new Error(msg || '没有权限访问该资源');
        case 404:
          // 业务错误 - 抛出给组件决定
          throw new Error(msg || '请求的资源不存在');
        case 500:
          // 服务器错误 - 统一 toast 提示
          toast.error(msg || '服务器内部错误，请稍后重试');
          throw new Error(msg || '服务器内部错误');
        default:
          if (status >= 500) {
            // 5xx 错误 - 统一 toast 提示
            toast.error('服务异常，请稍后重试');
          }
          throw new Error(msg || `请求失败 (${status})`);
      }
    } else if (error.request) {
      // 网络错误 - 统一 toast 提示
      toast.error('网络连接失败，请检查网络设置');
      throw new Error('网络连接失败');
    } else {
      // 其他错误
      throw new Error(error.message || '请求发生错误');
    }
    
    return Promise.reject(error);
  }
);

/**
 * 处理 API 响应
 */
export function handleResponse<T>(responseData: ApiResponse<T>): T {
  const { code, msg, success, data } = responseData;
  
  if (code !== 'SUCCESS' || !success) {
    throw new Error(msg || '请求失败');
  }
  
  return data;
}

export default api;
