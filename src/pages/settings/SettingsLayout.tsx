import { NavLink, Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Settings,
  Palette,
  Cpu,
  Boxes,
  User,
  Info,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: "general", label: "通用", icon: Settings },
  { path: "appearance", label: "界面", icon: Palette },
  { path: "providers", label: "模型提供商", icon: Cpu },
  { path: "models", label: "模型", icon: Boxes },
  { path: "account", label: "账号", icon: User },
  { path: "about", label: "关于", icon: Info },
];

export function SettingsLayout() {
  return (
    <div className="h-full flex">
      {/* 左侧导航 - 使用 Sidebar 组件保持视觉一致 */}
      <Sidebar collapsible="none" className="w-[240px] border-r">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <NavLink to={item.path} className="w-full">
                        {({ isActive }) => (
                          <SidebarMenuButton isActive={isActive} className="w-full">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 右侧内容区 - 占满剩余空间 */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
