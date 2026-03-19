import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getModels,
  deleteModel,
  addModel,
  fetchModelCatalog,
  type Model,
  type ModelProvider,
  type AddModelRequest,
} from "@/lib/models";
import { fetchDictItems } from "@/lib/common";
import type { DictItem } from "@/lib/common";

interface AddModelForm {
  modelName: string;
  abilities: string[];
  useDefaultConfig: boolean;
  setting: {
    maxTokens: number;
    temperature: number;
    topP: number;
    stopSequences: string;
    frequencyPenalty: number;
    presencePenalty: number;
  };
}

const defaultForm: AddModelForm = {
  modelName: "",
  abilities: [],
  useDefaultConfig: true,
  setting: {
    maxTokens: 0,
    temperature: 0.7,
    topP: 1,
    stopSequences: "",
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
};

export function useModelSettings() {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);

  // 添加模型抽屉状态
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<ModelProvider | null>(null);
  const [abilityOptions, setAbilityOptions] = useState<DictItem[]>([]);
  const [isLoadingAbilities, setIsLoadingAbilities] = useState(false);
  const [catalogModels, setCatalogModels] = useState<string[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [addForm, setAddForm] = useState<AddModelForm>(defaultForm);

  // 加载模型列表
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getModels();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // 加载能力选项
  const loadAbilityOptions = useCallback(async () => {
    try {
      setIsLoadingAbilities(true);
      const items = await fetchDictItems("ability_type");
      setAbilityOptions(items);
    } catch {
      // 错误已在拦截器处理
    } finally {
      setIsLoadingAbilities(false);
    }
  }, []);

  // 加载模型目录
  const loadModelCatalog = useCallback(async (providerId: string) => {
    try {
      setIsLoadingCatalog(true);
      const models = await fetchModelCatalog(providerId);
      setCatalogModels(models);
    } catch {
      // 错误已在拦截器处理
      setCatalogModels([]);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  // 抽屉打开时加载数据
  useEffect(() => {
    if (isAddDrawerOpen && currentProvider) {
      loadAbilityOptions();
      loadModelCatalog(currentProvider.providerId);
    }
  }, [isAddDrawerOpen, currentProvider, loadAbilityOptions, loadModelCatalog]);

  // 处理删除点击
  const handleDeleteClick = useCallback((model: Model) => {
    if (model.def) {
      toast.error("默认模型不能删除，请先设置其他模型为默认");
      return;
    }
    setModelToDelete(model);
  }, []);

  // 确认删除
  const handleConfirmDelete = useCallback(async () => {
    if (!modelToDelete) return;

    try {
      await deleteModel(modelToDelete.id);
      toast.success("删除成功");
      setModelToDelete(null);
      // 刷新列表
      loadModels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  }, [modelToDelete, loadModels]);

  // 打开添加模型抽屉
  const handleOpenAddDrawer = useCallback((provider: ModelProvider) => {
    setCurrentProvider(provider);
    setAddForm(defaultForm);
    setIsCustomInput(false);
    setIsAddDrawerOpen(true);
  }, []);

  // 关闭添加模型抽屉
  const handleCloseAddDrawer = useCallback(() => {
    setIsAddDrawerOpen(false);
    setCurrentProvider(null);
    setIsCustomInput(false);
    setCatalogModels([]);
  }, []);

  // 处理能力选择
  const handleAbilityToggle = useCallback((code: string) => {
    setAddForm((prev) => ({
      ...prev,
      abilities: prev.abilities.includes(code)
        ? prev.abilities.filter((a) => a !== code)
        : [...prev.abilities, code],
    }));
  }, []);

  // 确认添加模型
  const handleConfirmAdd = useCallback(async () => {
    if (!currentProvider) return;

    // 表单验证
    if (!addForm.modelName.trim()) {
      toast.error("请输入模型名称");
      return;
    }

    try {
      const request: AddModelRequest = {
        providerId: currentProvider.providerId,
        modelName: addForm.modelName.trim(),
      };

      // 如果有选择能力
      if (addForm.abilities.length > 0) {
        request.abilities = addForm.abilities;
      }

      // 如果不使用默认配置
      if (!addForm.useDefaultConfig) {
        request.setting = addForm.setting;
      }

      await addModel(request);
      toast.success("添加成功");
      handleCloseAddDrawer();
      // 刷新列表
      loadModels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "添加失败");
    }
  }, [currentProvider, addForm, handleCloseAddDrawer, loadModels]);

  return {
    // 数据状态
    providers,
    loading,
    error,
    
    // 删除相关
    modelToDelete,
    setModelToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    
    // 添加模型抽屉状态
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
    
    // 操作方法
    loadModels,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleAbilityToggle,
    handleConfirmAdd,
  };
}

export type { AddModelForm };
