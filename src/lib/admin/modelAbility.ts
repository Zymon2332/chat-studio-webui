import api, { handleResponse } from '@/lib/api';
import type { ApiResponse, PageResult } from '@/types/api';
import type {
  ModelAbility,
  CreateModelAbilityRequest,
  UpdateModelAbilityRequest,
  ModelAbilityListParams,
} from '@/types/modelAbility';

/**
 * 获取模型能力分页列表
 * @param params 查询参数
 */
export const getModelAbilityList = async (
  params: ModelAbilityListParams = {}
): Promise<PageResult<ModelAbility>> => {
  const response = await api.get<ApiResponse<PageResult<ModelAbility>>>('/admin/model-ability/list', {
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      providerId: params.providerId,
      modelName: params.modelName,
      enabled: params.enabled,
    },
  });
  return handleResponse(response.data);
};

/**
 * 获取模型能力详情
 * @param id 模型能力 ID
 */
export const getModelAbilityDetail = async (id: number): Promise<ModelAbility> => {
  const response = await api.get<ApiResponse<ModelAbility>>(`/admin/model-ability/${id}`);
  return handleResponse(response.data);
};

/**
 * 新增模型能力
 * @param data 模型能力数据
 */
export const createModelAbility = async (data: CreateModelAbilityRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/admin/model-ability', data);
  return handleResponse(response.data);
};

/**
 * 修改模型能力
 * @param data 模型能力数据
 */
export const updateModelAbility = async (data: UpdateModelAbilityRequest): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/admin/model-ability', data);
  return handleResponse(response.data);
};

/**
 * 启用模型能力
 * @param id 模型能力 ID
 */
export const enableModelAbility = async (id: number): Promise<void> => {
  const response = await api.post<ApiResponse<void>>(`/admin/model-ability/${id}/enable`);
  return handleResponse(response.data);
};

/**
 * 停用模型能力
 * @param id 模型能力 ID
 */
export const disableModelAbility = async (id: number): Promise<void> => {
  const response = await api.post<ApiResponse<void>>(`/admin/model-ability/${id}/disable`);
  return handleResponse(response.data);
};

/**
 * 删除模型能力
 * @param id 模型能力 ID
 */
export const deleteModelAbility = async (id: number): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/admin/model-ability/${id}`);
  return handleResponse(response.data);
};
