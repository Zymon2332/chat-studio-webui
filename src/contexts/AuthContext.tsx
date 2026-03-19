import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserInfo, LoginRequest } from '@/types/auth';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '@/lib/auth';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * 登录
   */
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await loginApi(data);
      setUser(response.userInfo);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutApi();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 检查认证状态（页面刷新时调用）
   */
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const userInfo = await getCurrentUser();
      setUser(userInfo);
    } catch {
      // 获取失败，保持未登录状态
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文的 Hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
