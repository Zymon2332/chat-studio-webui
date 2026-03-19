import api, { handleResponse } from './api';
import type { ApiResponse } from '@/types/api';
import type { Session } from '@/types/session';
import type { Message } from '@/types/chat';

export const getSessionList = async (): Promise<Session[]> => {
  const response = await api.get<ApiResponse<Session[]>>('/session/list');
  return handleResponse(response.data);
};

export const renameSession = async (sessionId: string, title: string): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/session/rename', { sessionId, title });
  handleResponse(response.data);
};

export const deleteSessions = async (sessionIds: string[]): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>('/session/delete', { data: sessionIds });
  handleResponse(response.data);
};

export const getSessionMessages = async (sessionId: string): Promise<Message[]> => {
  const response = await api.get<ApiResponse<Message[]>>(`/session/messages/${sessionId}`);
  return handleResponse(response.data);
};

export const createSession = async (): Promise<string> => {
  const response = await api.post<ApiResponse<string>>('/session/create');
  return handleResponse(response.data);
};
