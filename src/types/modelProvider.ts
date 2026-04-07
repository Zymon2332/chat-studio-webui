/**
 * 模型供应商管理类型定义
 */

/**
 * 来源类型枚举
 */
export type SourceType = 'service' | 'local';

/**
 * 供应商信息
 */
export interface ModelProvider {
  id: string;
  providerName: string;
  sourceType: SourceType;
  baseUrl: string;
  icon: string;
  description: string;
}

/**
 * 新增供应商请求
 */
export interface CreateModelProviderRequest {
  id: string;
  providerName: string;
  sourceType: SourceType;
  baseUrl: string;
  icon: string;
  description: string;
}

/**
 * 更新供应商请求
 */
export interface UpdateModelProviderRequest {
  id: string;
  providerName: string;
  sourceType: SourceType;
  baseUrl: string;
  icon: string;
  description: string;
}

/**
 * 供应商列表查询参数
 */
export interface ModelProviderListParams {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 来源类型标签
 */
export const SourceTypeLabels: Record<SourceType, string> = {
  service: '云服务',
  local: '本地',
};

/**
 * 来源类型样式配置
 */
export const SourceTypeVariants: Record<SourceType, 'default' | 'secondary'> = {
  service: 'default',
  local: 'secondary',
};
