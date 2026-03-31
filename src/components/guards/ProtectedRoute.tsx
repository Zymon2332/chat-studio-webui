import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true: 需要登录, false: 禁止已登录访问
  requireRole?: 'ADMIN' | 'ORDINARY'; // 需要的角色，不指定则不检查
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 加载中显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // 需要登录但未登录，跳转登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 禁止已登录访问但已登录，跳转到首页
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 已登录状态下，检查特定角色要求
  if (isAuthenticated && user) {
    // 检查特定角色要求
    if (requireRole && user.userRole !== requireRole) {
      // 权限不足，跳转到首页
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

/**
 * 管理员专属路由守卫
 * 仅 ADMIN 角色可访问
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ProtectedRoute requireAuth={true} requireRole="ADMIN">
      {children}
    </ProtectedRoute>
  );
};
