import { createBrowserRouter, RouterProvider, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeContextProvider, useThemeContext } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Login } from "@/pages/Login";
import { Chat } from "@/pages/Chat";
import { Conversation } from "@/pages/Conversation";
import { KnowledgeBase } from "@/pages/knowledge";
import {
  Settings,
  GeneralSettings,
  AppearanceSettings,
  ProvidersLayout,
  InstalledProviders,
  ProviderMarket,
  ModelSettings,
  AccountSettings,
  AboutSettings,
} from "@/pages/settings";

/**
 * 自动折叠 Sidebar 的包装组件
 * 在首次进入设置页面或知识库页面时自动折叠主 Sidebar
 */
function AutoCollapseSidebar() {
  const location = useLocation();
  const { setOpen, state } = useSidebar();
  const hasCollapsed = useRef(false);
  const hasCollapsedKnowledge = useRef(false);
  
  useEffect(() => {
    const isSettingsPage = location.pathname.startsWith("/settings");
    const isKnowledgePage = location.pathname.startsWith("/knowledge");
    
    // 首次进入设置页面时自动折叠
    if (isSettingsPage && state === "expanded" && !hasCollapsed.current) {
      setOpen(false);
      hasCollapsed.current = true;
    }
    
    // 首次进入知识库页面时自动折叠
    if (isKnowledgePage && state === "expanded" && !hasCollapsedKnowledge.current) {
      setOpen(false);
      hasCollapsedKnowledge.current = true;
    }
    
    // 离开设置页面时重置标记
    if (!isSettingsPage) {
      hasCollapsed.current = false;
    }
    
    // 离开知识库页面时重置标记
    if (!isKnowledgePage) {
      hasCollapsedKnowledge.current = false;
    }
  }, [location.pathname, setOpen, state]);
  
  return <AppSidebar variant="sidebar" />;
}

/**
 * 主布局组件
 * 包含 Sidebar 和主内容区
 */
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AutoCollapseSidebar />
      <SidebarInset className="!m-0 !rounded-none !shadow-none">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * 受保护的主布局（需要登录）
 */
function ProtectedMainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

/**
 * 路由配置
 */
const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false}>
        <Login />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedMainLayout>
        <Chat />
      </ProtectedMainLayout>
    ),
  },
  {
    path: "/chat/:id?",
    element: (
      <ProtectedMainLayout>
        <Chat />
      </ProtectedMainLayout>
    ),
  },
  {
    path: "/conversation/:id",
    element: (
      <ProtectedMainLayout>
        <Conversation />
      </ProtectedMainLayout>
    ),
  },
  {
    path: "/knowledge",
    element: (
      <ProtectedMainLayout>
        <KnowledgeBase />
      </ProtectedMainLayout>
    ),
  },
  {
    path: "/tools",
    element: (
      <ProtectedMainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">工具与技能</h1>
          <p className="text-muted-foreground mt-2">工具功能开发中...</p>
        </div>
      </ProtectedMainLayout>
    ),
  },
  {
    path: "/workflows",
    element: (
      <ProtectedMainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">工作流</h1>
          <p className="text-muted-foreground mt-2">工作流功能开发中...</p>
        </div>
      </ProtectedMainLayout>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedMainLayout>
        <Settings />
      </ProtectedMainLayout>
    ),
    children: [
      { index: true, element: <Navigate to="general" replace /> },
      { path: "general", element: <GeneralSettings /> },
      { path: "appearance", element: <AppearanceSettings /> },
      {
        path: "providers",
        element: <ProvidersLayout />,
        children: [
          { index: true, element: <Navigate to="market" replace /> },
          { path: "installed", element: <InstalledProviders /> },
          { path: "market", element: <ProviderMarket /> },
        ],
      },
      { path: "models", element: <ModelSettings /> },
      { path: "account", element: <AccountSettings /> },
      { path: "about", element: <AboutSettings /> },
    ],
  },
]);

/**
 * 字体大小应用组件
 * 根据 ThemeContext 中的字体大小设置应用到 body
 */
function FontSizeApplier({ children }: { children: React.ReactNode }) {
  const { fontSize } = useThemeContext();

  useEffect(() => {
    document.body.classList.remove('text-sm', 'text-base', 'text-lg');
    document.body.classList.add(`text-${fontSize}`);
  }, [fontSize]);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="app-theme"
    >
      <ThemeContextProvider>
        <FontSizeApplier>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
          </AuthProvider>
        </FontSizeApplier>
      </ThemeContextProvider>
    </ThemeProvider>
  );
}
