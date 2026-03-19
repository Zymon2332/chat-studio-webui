import api, { handleResponse } from './api';
import type { ApiResponse } from '@/types/api';

export interface DictItem {
  code: string;
  name: string;
}

export const fetchDictItems = async (type: string): Promise<DictItem[]> => {
  const response = await api.get<ApiResponse<DictItem[]>>(`/dict/items/${type}`);
  return handleResponse(response.data);
};
