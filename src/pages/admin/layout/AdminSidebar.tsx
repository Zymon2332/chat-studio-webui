import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  ChevronUp,
  LogOut,
  Building2,
  Cpu,
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "数据看板", path: "/admin" },
  { icon: Users, label: "用户管理", path: "/admin/users" },
  { icon: Building2, label: "模型提供商管理", path: "/admin/suppliers" },
  { icon: Cpu, label: "模型能力管理", path: "/admin/model-capabilities" },
  { icon: Database, label: "知识库管理", path: "/admin/knowledge" },
  { icon: Settings, label: "系统设置", path: "/admin/settings" },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/admin" && location.pathname.startsWith(path));

  const handleNavigate = (path: string) => navigate(path);

  // 退出登录确认对话框状态
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      <Sidebar variant="sidebar">
        <SidebarHeader className="flex flex-col items-center justify-center px-4 py-4 gap-1">
          <span className="font-bold text-base">Chat Studio</span>
          <span className="text-xs text-muted-foreground">管理后台</span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        onClick={() => handleNavigate(item.path)}
                        tooltip={item.label}
                      >
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center w-full hover:bg-sidebar-accent rounded-md p-2 transition-colors justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user?.profileAvatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user?.nickName?.slice(0, 2) ||
                        user?.email?.slice(0, 2) ||
                        "A"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {user?.nickName || user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.userRole === "ADMIN" ? "管理员" : "普通用户"}
                    </span>
                  </div>
                </div>

                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="start"
              className="w-56 bg-popover border shadow-xl"
            >
              {/* 用户信息头部 */}
              <div className="flex items-center gap-3 p-3 border-b border-border">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user?.profileAvatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {user?.nickName?.slice(0, 2) ||
                      user?.email?.slice(0, 2) ||
                      "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user?.nickName || user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.userRole === "ADMIN" ? "管理员" : "普通用户"}
                  </span>
                </div>
              </div>

              <DropdownMenuItem onClick={() => navigate("/")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>返回对话</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogoutClick}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      {/* 退出登录确认对话框 */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出</AlertDialogTitle>
            <AlertDialogDescription>您确定要退出登录吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              退出登录
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
