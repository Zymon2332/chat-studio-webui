import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function ProvidersLayout() {
  return (
    <div className="space-y-6">
      {/* Tab 导航 - 纯文本样式，加大字体 */}
      <div className="flex gap-6 text-xl">
        <NavLink
          to="market"
          className={({ isActive }) =>
            cn(
              "transition-colors",
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          模型提供商
        </NavLink>
        <NavLink
          to="installed"
          end
          className={({ isActive }) =>
            cn(
              "transition-colors",
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          已安装
        </NavLink>
      </div>

      {/* 子页面 */}
      <Outlet />
    </div>
  );
}
