import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useModelSettings } from "./hooks/useModelSettings";
import { ProviderGroup } from "./components/ProviderGroup";
import { AddModelDrawer } from "./components/AddModelDrawer";
import { ConfigDrawer } from "./components/ConfigDrawer";
import type { Model } from "@/lib/models";

export function ModelSettings() {
  const {
    providers,
    loading,
    error,
    modelToDelete,
    setModelToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    isAddDrawerOpen,
    setIsAddDrawerOpen,
    currentProvider,
    abilityOptions,
    isLoadingAbilities,
    catalogModels,
    isLoadingCatalog,
    isCustomInput,
    setIsCustomInput,
    addForm,
    setAddForm,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleAbilityToggle,
    handleConfirmAdd,
  } = useModelSettings();

  // 配置抽屉状态
  const [configModel, setConfigModel] = useState<Model | null>(null);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);

  // 处理配置点击
  const handleConfigClick = (model: Model) => {
    setConfigModel(model);
    setIsConfigDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">模型管理</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">模型管理</h2>
        <div className="text-center py-12 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">模型管理</h2>
        <div className="text-center py-12 text-muted-foreground">
          暂无模型，请先安装模型提供商
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">模型管理</h2>

      <div className="border rounded-lg overflow-hidden">
        {providers.map((provider) => (
          <ProviderGroup 
            key={provider.providerId} 
            provider={provider} 
            onDelete={handleDeleteClick}
            onAdd={handleOpenAddDrawer}
            onConfig={handleConfigClick}
          />
        ))}
      </div>

      {/* 添加模型抽屉 */}
      <AddModelDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        provider={currentProvider}
        catalogModels={catalogModels}
        isLoadingCatalog={isLoadingCatalog}
        abilityOptions={abilityOptions}
        isLoadingAbilities={isLoadingAbilities}
        form={addForm}
        isCustomInput={isCustomInput}
        onFormChange={setAddForm}
        onCustomInputChange={setIsCustomInput}
        onAbilityToggle={handleAbilityToggle}
        onConfirm={handleConfirmAdd}
        onCancel={handleCloseAddDrawer}
      />

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!modelToDelete}
        onOpenChange={() => setModelToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模型 {modelToDelete?.modelName} 吗？
              <br /><br />
              删除后将无法使用该模型，同时模型配置也将一并删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 配置抽屉 */}
      <ConfigDrawer
        open={isConfigDrawerOpen}
        onOpenChange={setIsConfigDrawerOpen}
        model={configModel}
      />
    </div>
  );
}
