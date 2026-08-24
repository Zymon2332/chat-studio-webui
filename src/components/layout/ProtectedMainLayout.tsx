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
          <AppSidebar />
          <SidebarInset className="flex flex-col min-h-0">
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </SessionProvider>
    </ProtectedRoute>
  );
}
