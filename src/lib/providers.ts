import api, { handleResponse } from './api';
import type { ApiResponse } from '@/types/api';

// ============ 类型定义 ============

/**
 * 市场提供商（来自 /models/providers）
 */
export interface MarketProvider {
  id: string;
  providerName: string;
  sourceType: 'service' | 'local';
  baseUrl: string;
  icon: string;
  description: string;
}

/**
 * 已安装提供商（来自 /models/installed/providers）
 */
export interface InstalledProvider {
  id: number;
  providerId: string;
  providerName: string;
  icon: string;
  enabled: boolean;
}

/**
 * 安装提供商请求参数
 */
export interface InstallProviderRequest {
  providerId: string;
  apiKey: string;
  baseUrl: string;
}

// ============ API 函数 ============

/**
 * 获取市场提供商列表
 */
export const fetchMarketProviders = async (): Promise<MarketProvider[]> => {
  const response = await api.get<ApiResponse<MarketProvider[]>>('/models/providers');
  return handleResponse(response.data);
};

/**
 * 获取已安装提供商列表
 */
export const fetchInstalledProviders = async (): Promise<InstalledProvider[]> => {
  const response = await api.get<ApiResponse<InstalledProvider[]>>('/models/installed/providers');
  return handleResponse(response.data);
};

/**
 * 安装提供商
 */
export const installProvider = async (params: InstallProviderRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/models/install', params);
  handleResponse(response.data);
};

/**
 * 卸载提供商
 * @param providerId 提供商ID
 */
export const uninstallProvider = async (providerId: string): Promise<void> => {
  // TODO: 等后端接口确定后实现
  console.log('卸载提供商:', providerId);
};

/**
 * 更新提供商启用状态
 * @param providerId 提供商ID
 * @param enabled 是否启用
 */
export const updateProviderStatus = async (providerId: string, enabled: boolean): Promise<void> => {
  // TODO: 等后端接口确定后实现
  console.log('更新提供商状态:', providerId, enabled);
};

/**
 * 已安装提供商配置信息
 */
export interface InstalledProviderConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * 获取已安装提供商配置
 * @param installedId 已安装提供商ID
 */
export const fetchInstalledProviderConfig = async (installedId: string): Promise<InstalledProviderConfig> => {
  const response = await api.get<ApiResponse<InstalledProviderConfig>>(`/models/installed/info/${installedId}`);
  return handleResponse(response.data);
};

/**
 * 更新已安装提供商配置
 * @param installedId 已安装提供商ID
 * @param apiKey API Key
 * @param baseUrl Base URL
 */
export const updateInstalledProviderConfig = async (
  installedId: string,
  apiKey: string,
  baseUrl: string
): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/models/installed/modify', {
    installedId,
    apiKey,
    baseUrl,
  });
  handleResponse(response.data);
};

/**
 * 删除已安装提供商
 * @param installedId 已安装提供商ID
 */
export const deleteInstalledProvider = async (installedId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/models/delete/installed/${installedId}`);
  handleResponse(response.data);
};
