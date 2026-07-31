import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-8xl font-serif-display font-bold text-[#D4A040] leading-none">404</h1>
      <p className="text-xl text-muted-foreground">页面未找到</p>
      <p className="text-sm text-muted-foreground/60">您访问的页面不存在</p>
      <Button onClick={() => navigate("/")} className="mt-4">
        <Home className="mr-2 h-4 w-4" />
        返回首页
      </Button>
    </div>
  );
}
