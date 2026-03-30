import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";

/**
 * 自动折叠 Sidebar 的包装组件
 * 在首次进入设置页面或知识库页面时自动折叠主 Sidebar
 */
export function AutoCollapseSidebar() {
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
export function MainLayout({ children }: { children: React.ReactNode }) {
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
export function ProtectedMainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
