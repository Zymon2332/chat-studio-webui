import { useState, useEffect } from "react";
import { Plus, Search, Cpu, Cloud, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  fetchMarketProviders,
  installProvider,
} from "@/lib/providers";

// UI 使用的 Provider 类型
interface Provider {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseUrl: string;
  category: "cloud" | "local";
}

// 分类图标
const CategoryIcon = ({ category }: { category: Provider["category"] }) => {
  switch (category) {
    case "cloud":
      return <Cloud className="h-4 w-4" />;
    case "local":
      return <Cpu className="h-4 w-4" />;
  }
};

export function ProviderMarket() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 API 获取提供商数据
  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMarketProviders();

      // 转换 API 数据为 UI 格式
      const mappedProviders: Provider[] = data.map((item) => ({
        id: item.id,
        name: item.providerName,
        description: item.description,
        icon: item.icon,
        baseUrl: item.baseUrl,
        category: item.sourceType === "service" ? "cloud" : "local",
      }));

      setProviders(mappedProviders);
    } catch (err) {
      // 500/网络错误已由拦截器统一 toast 提示
      // 4xx 业务错误 - 显示具体错误信息
      const message = err instanceof Error ? err.message : "加载失败";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // 安装相关状态
  const [installingProvider, setInstallingProvider] = useState<Provider | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  // 打开安装抽屉
  const handleInstall = (provider: Provider) => {
    setInstallingProvider(provider);
    setApiKey("");
    setBaseUrl(provider.baseUrl || "");
    setShowApiKey(false);
    setInstallError(null);
    setIsDrawerOpen(true);
  };

  // 关闭安装抽屉
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setInstallingProvider(null);
    setApiKey("");
    setBaseUrl("");
    setInstallError(null);
  };

  // 确认安装
  const handleConfirmInstall = async () => {
    if (!installingProvider) return;

    // 表单验证
    if (!apiKey.trim()) {
      setInstallError("请输入 API Key");
      return;
    }

    try {
      setIsInstalling(true);
      setInstallError(null);

      await installProvider({
        providerId: installingProvider.id,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || installingProvider.baseUrl,
      });

      // 安装成功
      handleCloseDrawer();
      // 刷新列表
      fetchProviders();
    } catch (err) {
      // 500/网络错误已由拦截器统一 toast 提示
      // 4xx 业务错误 - 在抽屉表单内显示具体错误
      setInstallError(err instanceof Error ? err.message : "安装失败");
    } finally {
      setIsInstalling(false);
    }
  };

  // 筛选可安装提供商
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || provider.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索模型提供商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem value="cloud">云端</SelectItem>
            <SelectItem value="local">本地</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 分类标签 */}
      <div className="flex gap-2">
        {["all", "cloud", "local"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              categoryFilter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {cat === "all" && "全部"}
            {cat === "cloud" && "☁️ 云端"}
            {cat === "local" && "🏠 本地"}
          </button>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-center py-12 text-destructive">
          {error}
        </div>
      )}

      {/* 提供商网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            没有找到匹配的提供商
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                {provider.icon ? (
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="w-10 h-10 rounded object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xl">
                    🤖
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <CategoryIcon category={provider.category} />
                  {provider.category === "cloud" && "云端"}
                  {provider.category === "local" && "本地"}
                </div>
              </div>
              <h3 className="font-medium mb-1">{provider.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {provider.description}
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleInstall(provider)}
              >
                <Plus className="h-4 w-4 mr-2" />
                安装
              </Button>
            </div>
          ))
        )}
      </div>

      {/* 安装抽屉 */}
      <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="w-[400px] sm:w-[540px]">
          <DrawerHeader>
            <DrawerTitle>安装 {installingProvider?.name}</DrawerTitle>
            <DrawerDescription>
              配置 API Key 和 Base URL 以安装该提供商
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 py-6 px-4">
            {installError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {installError}
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">
                API Key <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Base URL
              </label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
              />
              {installingProvider?.baseUrl && (
                <p className="text-xs text-muted-foreground mt-1">
                  默认值：{installingProvider.baseUrl}
                </p>
              )}
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleConfirmInstall}
              disabled={isInstalling}
            >
              {isInstalling && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              确认安装
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleCloseDrawer}>
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
