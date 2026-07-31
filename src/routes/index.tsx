import type { RouteObject } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "@/components/guards/ProtectedRoute";
import { Login } from "@/pages/Login";
import { AdminLayout, Dashboard } from "@/pages/admin";
import { UserManagement } from "@/pages/admin/users/UserManagement";
import { SupplierManagement } from "@/pages/admin/suppliers/SupplierManagement";
import { ModelCapabilityManagement } from "@/pages/admin/modelCapabilities/ModelCapabilityManagement";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import NotFound from "@/pages/NotFound";
import { mainLayoutRoutes } from "./chat";

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
      { index: true, element: <Dashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "suppliers", element: <SupplierManagement /> },
      { path: "models", element: <PlaceholderPage title="模型管理" /> },
      { path: "model-capabilities", element: <ModelCapabilityManagement /> },
      { path: "knowledge", element: <PlaceholderPage title="知识库管理" /> },
      { path: "settings", element: <PlaceholderPage title="系统设置" /> },
    ],
  },
  ...mainLayoutRoutes,
  { path: "*", element: <NotFound /> },
];
