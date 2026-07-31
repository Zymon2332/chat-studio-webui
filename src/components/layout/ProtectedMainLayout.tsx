import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SessionProvider } from "@/contexts/SessionContext";
import { AppSidebar } from "./app-sidebar";

export function ProtectedMainLayout() {
  return (
    <ProtectedRoute requireAuth={true}>
      <SessionProvider>
        <SidebarProvider>
          <div className="noise-overlay" />
          <div className="fixed inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
          />
          <AppSidebar />
          <SidebarInset className="flex flex-col min-h-0">
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </SessionProvider>
    </ProtectedRoute>
  );
}
