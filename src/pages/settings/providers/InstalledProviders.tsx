import { useNavigate, NavLink } from "react-router-dom";
import {
  Settings,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  fetchInstalledProviders,
  fetchInstalledProviderConfig,
  updateInstalledProviderConfig,
  deleteInstalledProvider,
} from "@/lib/providers";

// UI 使用的 Provider 类型
interface Provider {
  id: string;
  providerId: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export function InstalledProviders() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(
    null
  );

  // 配置抽屉相关状态
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [configuringProvider, setConfiguringProvider] = useState<Provider | null>(null);
  const [configApiKey, setConfigApiKey] = useState("");
  const [configBaseUrl, setConfigBaseUrl] = useState("");
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 从 API 获取已安装提供商数据
  useEffect(() => {
    const loadInstalledProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInstalledProviders();

        // 转换 API 数据为 UI 格式
        const mappedProviders: Provider[] = data.map((item) => ({
          id: item.id.toString(),
          providerId: item.providerId,
          name: item.providerName,
          icon: item.icon,
          enabled: item.enabled,
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

    loadInstalledProviders();
  }, []);

  // 处理启用/禁用切换
  const handleToggle = async (provider: Provider, checked: boolean) => {
    // 本地先更新状态
    setProviders((prev) =>
      prev.map((p) =>
        p.id === provider.id ? { ...p, enabled: checked } : p
      )
    );

    // TODO: 调用后端 API 更新启用状态
    console.log(`切换提供商 ${provider.name} 状态为:`, checked);
  };

  // 打开配置抽屉
  const handleOpenConfig = async (provider: Provider) => {
    try {
      setIsLoadingConfig(true);
      const config = await fetchInstalledProviderConfig(provider.id);
      setConfiguringProvider(provider);
      setConfigApiKey(config.apiKey);
      setConfigBaseUrl(config.baseUrl);
      setConfigDrawerOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "加载配置失败");
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // 关闭配置抽屉
  const handleCloseConfig = () => {
    setConfigDrawerOpen(false);
    setConfiguringProvider(null);
    setConfigApiKey("");
    setConfigBaseUrl("");
    setIsSaving(false);
  };

  // 保存配置
  const handleSaveConfig = async () => {
    if (!configuringProvider) return;

    // 表单验证
    if (!configApiKey.trim()) {
      toast.error("请输入 API Key");
      return;
    }
    if (!configBaseUrl.trim()) {
      toast.error("请输入 Base URL");
      return;
    }

    try {
      setIsSaving(true);
      await updateInstalledProviderConfig(
        configuringProvider.id,
        configApiKey.trim(),
        configBaseUrl.trim()
      );

      toast.success("保存成功");
      handleCloseConfig();
      // 刷新列表
      const data = await fetchInstalledProviders();
      const mappedProviders: Provider[] = data.map((item) => ({
        id: item.id.toString(),
        providerId: item.providerId,
        name: item.providerName,
        icon: item.icon,
        enabled: item.enabled,
      }));
      setProviders(mappedProviders);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 跳转到模型管理
  const handleManageModels = (providerId: string) => {
    navigate(`/settings/models?provider=${providerId}`);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!providerToDelete) return;

    try {
      await deleteInstalledProvider(providerToDelete.id);
      toast.success("删除成功");
      setProviderToDelete(null);
      // 刷新列表
      const data = await fetchInstalledProviders();
      const mappedProviders: Provider[] = data.map((item) => ({
        id: item.id.toString(),
        providerId: item.providerId,
        name: item.providerName,
        icon: item.icon,
        enabled: item.enabled,
      }));
      setProviders(mappedProviders);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg bg-card overflow-hidden">
        {providers.map((provider, index) => (
          <div
            key={provider.id}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-accent/50 transition-colors",
              index !== providers.length - 1 && "border-b"
            )}
          >
            <div className="flex items-center gap-4">
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
              <div className="font-medium">{provider.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={provider.enabled}
                onCheckedChange={(checked) => handleToggle(provider, checked)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenConfig(provider)}
                disabled={isLoadingConfig}
              >
                {isLoadingConfig && configuringProvider?.id === provider.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-1" />
                )}
                配置
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleManageModels(provider.providerId)}
                title="管理模型"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setProviderToDelete(provider)}
                title="卸载"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {providers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              还没有安装任何模型提供商
            </div>
            <NavLink to="/settings/providers/market">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                去市场添加
              </Button>
            </NavLink>
          </div>
        )}
      </div>

      {/* 配置抽屉 */}
      <Drawer direction="right" open={configDrawerOpen} onOpenChange={setConfigDrawerOpen}>
        <DrawerContent className="w-[400px] sm:w-[540px]">
          <DrawerHeader>
            <DrawerTitle>配置 {configuringProvider?.name}</DrawerTitle>
            <DrawerDescription>
              配置 API Key 和 Base URL
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 py-6 px-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                API Key
              </label>
              <Input
                type="password"
                value={configApiKey}
                onChange={(e) => setConfigApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Base URL
              </label>
              <Input
                value={configBaseUrl}
                onChange={(e) => setConfigBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存配置
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleCloseConfig}>
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!providerToDelete}
        onOpenChange={() => setProviderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认卸载</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要卸载 {providerToDelete?.name} 吗？
              <br />
              <br />
              如果删除模型提供商，则该提供商下已存在的模型都会被删除
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              卸载
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
