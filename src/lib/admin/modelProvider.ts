import api, { handleResponse } from '@/lib/api';
import type { ApiResponse, PageResult } from '@/types/api';
import type {
  ModelProvider,
  CreateModelProviderRequest,
  UpdateModelProviderRequest,
  ModelProviderListParams,
} from '@/types/modelProvider';

/**
 * 获取供应商分页列表
 * @param params 查询参数
 */
export const getModelProviderList = async (
  params: ModelProviderListParams = {}
): Promise<PageResult<ModelProvider>> => {
  const response = await api.get<ApiResponse<PageResult<ModelProvider>>>('/admin/model-provider/list', {
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
    },
  });
  return handleResponse(response.data);
};

/**
 * 获取供应商详情
 * @param providerId 供应商 ID
 */
export const getModelProviderDetail = async (providerId: string): Promise<ModelProvider> => {
  const response = await api.get<ApiResponse<ModelProvider>>(`/admin/model-provider/${providerId}`);
  return handleResponse(response.data);
};

/**
 * 新增供应商
 * @param data 供应商数据
 */
export const createModelProvider = async (data: CreateModelProviderRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/admin/model-provider', data);
  return handleResponse(response.data);
};

/**
 * 修改供应商
 * @param data 供应商数据
 */
export const updateModelProvider = async (data: UpdateModelProviderRequest): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/admin/model-provider', data);
  return handleResponse(response.data);
};

/**
 * 删除供应商
 * @param providerId 供应商 ID
 */
export const deleteModelProvider = async (providerId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/admin/model-provider/${providerId}`);
  return handleResponse(response.data);
};
