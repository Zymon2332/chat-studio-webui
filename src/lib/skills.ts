import api, { handleResponse } from './api';
import type { ApiResponse, PageRequest, PageResult } from '@/types/api';

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  createdTime: string;
}

export const fetchSkillPage = async (
  params: PageRequest,
): Promise<PageResult<SkillItem>> => {
  const response = await api.get<ApiResponse<PageResult<SkillItem>>>('/skills/page', { params });
  return handleResponse(response.data);
};

export const createSkill = async (uploadId: string): Promise<void> => {
  const response = await api.post<ApiResponse<void>>(`/skills/create/${uploadId}`);
  return handleResponse(response.data);
};

export const fetchSkillFiles = async (skillId: string): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>(`/skills/fileTree/${skillId}`);
  return handleResponse(response.data);
};

export const deleteSkill = async (skillId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/skills/delete/${skillId}`);
  return handleResponse(response.data);
};

export interface SkillPackageItem {
  id: number;
  name: string;
  description: string;
  createdTime: string;
  skillCount: number;
}

export const fetchSkillPackagePage = async (
  params: PageRequest,
): Promise<PageResult<SkillPackageItem>> => {
  const response = await api.get<ApiResponse<PageResult<SkillPackageItem>>>('/skills/package/page', { params });
  return handleResponse(response.data);
};

export interface CreateSkillPackageRequest {
  name: string;
  description: string;
  skillsIds: number[];
}

export const createSkillPackage = async (data: CreateSkillPackageRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/skills/package/create', data);
  return handleResponse(response.data);
};

export const fetchPackageSkills = async (packageId: number): Promise<SkillItem[]> => {
  const response = await api.get<ApiResponse<SkillItem[]>>(`/skills/package/${packageId}`);
  return handleResponse(response.data);
};

export const deleteSkillPackage = async (packageId: number): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/skills/package/delete/${packageId}`);
  return handleResponse(response.data);
};

export interface UpdateSkillPackageSkillsRequest {
  skillsIds: number[];
}

export const updateSkillPackageSkills = async (
  packageId: number,
  data: UpdateSkillPackageSkillsRequest,
): Promise<void> => {
  const response = await api.post<ApiResponse<void>>(`/skills/package/update/${packageId}`, data.skillsIds);
  return handleResponse(response.data);
};
