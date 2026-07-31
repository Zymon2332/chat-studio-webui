import api, { handleResponse } from './api';
import type { ApiResponse, PageRequest, PageResult } from '@/types/api';

export type AgentType = 'DEFAULT' | 'REMOTE' | 'LOCAL';

export type TemplateVariableType = 'STRING' | 'BOOLEAN' | 'NUMBER';

export interface TemplateVariable {
  key: string;
  type: TemplateVariableType;
  description?: string;
  defaultValue?: string;
  isOptional?: boolean;
}

export interface AgentItem {
  id: number;
  name: string;
  avatar: string;
  description: string;
  type: AgentType;
  modelName: string;
  skillsCount: number;
  createdTime: string;
  updatedTime: string;
}

export const fetchAgentPage = async (
  params: PageRequest,
): Promise<PageResult<AgentItem>> => {
  const response = await api.get<ApiResponse<PageResult<AgentItem>>>('/agent/page', { params });
  return handleResponse(response.data);
};

export interface CreateAgentRequest {
  name: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  triggerTemplate: string;
  variables?: TemplateVariable[];
  modelId: number;
  rollbackModelId?: number;
  enableKnowledgeBase: boolean;
  skillIds: number[];
}

export const createAgent = async (data: CreateAgentRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/agent/create', data);
  return handleResponse(response.data);
};

export interface UpdateAgentRequest extends CreateAgentRequest {
  id: number;
}

export const updateAgent = async (data: UpdateAgentRequest): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/agent/update', data);
  return handleResponse(response.data);
};

export const deleteAgent = async (id: number): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/agent/delete/${id}`);
  return handleResponse(response.data);
};

export interface SkillsVO {
  id: string;
  name: string;
  description: string;
  createdTime: string;
}

export interface AgentDetail {
  id: number;
  name: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  triggerTemplate?: string;
  variables?: TemplateVariable[];
  modelId: number;
  rollbackModelId: number | null;
  enableKnowledgeBase: boolean;
  skills: SkillsVO[];
  type?: string;
  modelName?: string;
}

export const fetchAgentDetails = async (id: number): Promise<AgentDetail> => {
  const response = await api.get<ApiResponse<AgentDetail>>(`/agent/details/${id}`);
  return handleResponse(response.data);
};

export interface TeamItem {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  memberAvatars: string[];
  createdTime: string;
  updatedTime: string;
}

export const fetchTeamPage = async (
  params: PageRequest,
): Promise<PageResult<TeamItem>> => {
  const response = await api.get<ApiResponse<PageResult<TeamItem>>>('/agent/team/page', { params });
  return handleResponse(response.data);
};

export type TeamStrategy = 'SUPERVISOR' | 'BLACKBOARD' | 'P2P' | 'GOAL' | 'WORKFLOW';

export interface CreateTeamRequest {
  name: string;
  description: string;
  strategy: TeamStrategy;
  agentIds: number[];
}

export const createTeam = async (data: CreateTeamRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/agent/team/create', data);
  return handleResponse(response.data);
};

export interface TeamDetail extends TeamItem {
  strategy: TeamStrategy;
  agentIds: number[];
}

export const fetchTeamDetails = async (id: number): Promise<TeamDetail> => {
  const response = await api.get<ApiResponse<TeamDetail>>(`/agent/team/details/${id}`);
  return handleResponse(response.data);
};

export interface UpdateTeamRequest extends CreateTeamRequest {
  id: number;
}

export const updateTeam = async (data: UpdateTeamRequest): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/agent/team/update', data);
  return handleResponse(response.data);
};
