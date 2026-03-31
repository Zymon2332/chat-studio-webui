import type { RouteObject } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "@/components/guards/ProtectedRoute";
import { Login } from "@/pages/Login";
import { AdminLayout, Dashboard } from "@/pages/admin";
import { mainRoutes } from "./chat";

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false}>
        <Login />
      </ProtectedRoute>
    ),
  },
  // Admin 路由组（仅管理员可访问）
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <div className="p-8 text-center">用户管理页面开发中...</div>,
      },
      {
        path: "models",
        element: <div className="p-8 text-center">模型管理页面开发中...</div>,
      },
      {
        path: "knowledge",
        element: <div className="p-8 text-center">知识库管理页面开发中...</div>,
      },
      {
        path: "settings",
        element: <div className="p-8 text-center">系统设置页面开发中...</div>,
      },
    ],
  },
  ...mainRoutes,
];
