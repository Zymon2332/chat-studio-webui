import api, { handleResponse } from '@/lib/api';
import type { ApiResponse, PageResult } from '@/types/api';
import type {
  UserInfo,
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
} from '@/types/user';

/**
 * 获取用户分页列表
 * @param params 查询参数
 */
export const getUserList = async (
  params: UserListParams = {}
): Promise<PageResult<UserInfo>> => {
  const response = await api.get<ApiResponse<PageResult<UserInfo>>>('/admin/userList', {
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
    },
  });
  return handleResponse(response.data);
};

/**
 * 获取用户详情
 * @param userId 用户 ID
 */
export const getUserDetail = async (userId: string): Promise<UserInfo> => {
  const response = await api.get<ApiResponse<UserInfo>>(`/admin/user/${userId}`);
  return handleResponse(response.data);
};

/**
 * 新增用户
 * @param data 用户数据
 */
export const createUser = async (data: CreateUserRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/admin/user', data);
  return handleResponse(response.data);
};

/**
 * 修改用户
 * @param data 用户数据
 */
export const updateUser = async (data: UpdateUserRequest): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/admin/user', data);
  return handleResponse(response.data);
};

/**
 * 冻结用户
 * @param userId 用户 ID
 */
export const freezeUser = async (userId: string): Promise<void> => {
  const response = await api.post<ApiResponse<void>>(`/admin/user/${userId}/freeze`);
  return handleResponse(response.data);
};

/**
 * 激活用户
 * @param userId 用户 ID
 */
export const activeUser = async (userId: string): Promise<void> => {
  const response = await api.post<ApiResponse<void>>(`/admin/active/${userId}`);
  return handleResponse(response.data);
};

/**
 * 删除用户
 * @param userId 用户 ID
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/admin/user/${userId}`);
  return handleResponse(response.data);
};
