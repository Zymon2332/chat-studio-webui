import api, { handleResponse } from './api';
import type { ApiResponse } from '@/types/api';

export interface Model {
  id: number;
  providerId: string;
  modelName: string;
  sort: number;
  def: boolean;
  abilities: string;
}

export interface ModelProvider {
  providerId: string;
  providerName: string;
  icon: string;
  models: Model[];
}

export const getDefaultModel = async (): Promise<Model> => {
  const response = await api.get<ApiResponse<Model>>('/models/default');
  return handleResponse(response.data);
};

export const getModels = async (): Promise<ModelProvider[]> => {
  const response = await api.get<ApiResponse<ModelProvider[]>>('/models/list');
  return handleResponse(response.data);
};

export const setDefaultModel = async (modelId: number): Promise<void> => {
  const response = await api.post<ApiResponse<void>>(`/models/setDefault/${modelId}`);
  handleResponse(response.data);
};

/**
 * 删除模型
 * @param modelId 模型ID
 */
export const deleteModel = async (modelId: number): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/models/delete/${modelId}`);
  handleResponse(response.data);
};

/**
 * 添加模型请求参数
 */
export interface AddModelRequest {
  providerId: string;
  modelName: string;
  abilities?: string[];
  setting?: {
    maxTokens: number;
    temperature: number;
    topP: number;
    stopSequences: string;
    frequencyPenalty: number;
    presencePenalty: number;
  };
}

/**
 * 添加模型
 * @param params 添加模型参数
 */
export const addModel = async (params: AddModelRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/models/add', params);
  handleResponse(response.data);
};

/**
 * 获取提供商的模型目录
 * @param providerId 提供商ID
 * @returns 模型名称列表
 */
export const fetchModelCatalog = async (providerId: string): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>(`/models/catalog/${providerId}`);
  return handleResponse(response.data);
};

/**
 * 模型配置信息
 */
export interface ModelSettings {
  maxTokens: number | null;
  temperature: number | null;
  topP: number | null;
  stopSequences: string | null;
  frequencyPenalty: number | null;
  presencePenalty: number | null;
}

/**
 * 更新模型配置请求
 */
export interface UpdateModelSettingsRequest {
  modelId: number;
  maxTokens: number;
  temperature: number;
  topP: number;
  stopSequences: string;
  frequencyPenalty: number;
  presencePenalty: number;
}

/**
 * 获取模型配置
 * @param modelId 模型ID
 */
export const fetchModelSettings = async (modelId: number): Promise<ModelSettings | null> => {
  const response = await api.get<ApiResponse<ModelSettings | null>>(`/models/settings/info/${modelId}`);
  return handleResponse(response.data);
};

/**
 * 更新模型配置
 * @param params 更新配置参数
 */
export const updateModelSettings = async (params: UpdateModelSettingsRequest): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/models/modify/settings', params);
  handleResponse(response.data);
};
