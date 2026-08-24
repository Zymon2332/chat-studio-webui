import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeContextProvider, useThemeContext } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { routes } from "@/routes";

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

// 创建路由器
const router = createBrowserRouter(routes);

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
