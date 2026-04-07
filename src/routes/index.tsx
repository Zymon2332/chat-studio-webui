import type { RouteObject } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "@/components/guards/ProtectedRoute";
import { Login } from "@/pages/Login";
import { AdminLayout, Dashboard } from "@/pages/admin";
import { UserManagement } from "@/pages/admin/users/UserManagement";
import { SupplierManagement } from "@/pages/admin/suppliers/SupplierManagement";
import { ModelCapabilityManagement } from "@/pages/admin/modelCapabilities/ModelCapabilityManagement";
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
        element: <UserManagement />,
      },
      {
        path: "suppliers",
        element: <SupplierManagement />,
      },
      {
        path: "models",
        element: <div className="p-8 text-center">模型管理页面开发中...</div>,
      },
      {
        path: "model-capabilities",
        element: <ModelCapabilityManagement />,
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
