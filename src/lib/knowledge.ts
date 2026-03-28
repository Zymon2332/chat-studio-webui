import { api, handleResponse } from './api';
import type { ApiResponse, PageResult, PageRequest } from '@/types/api';
import type { KnowledgeBase, KnowledgeBaseFormData, Tag, KnowledgeBaseDetail, RetrieveResult, RetrieveRequest, Document, DocumentDetail, Chunk } from '@/pages/knowledge/types';

/**
 * 获取知识库列表
 * GET /kb/list
 */
export const fetchKnowledgeBases = async (): Promise<KnowledgeBase[]> => {
  const response = await api.get<ApiResponse<KnowledgeBase[]>>('/kb/list');
  return handleResponse(response.data);
};

/**
 * 创建知识库
 * POST /kb/add
 */
export const createKnowledgeBase = async (data: KnowledgeBaseFormData): Promise<number> => {
  const response = await api.post<ApiResponse<number>>('/kb/add', data);
  return handleResponse(response.data);
};

/**
 * 获取知识库标签列表
 * GET /tags/kb
 */
export const fetchKbTags = async (): Promise<Tag[]> => {
  const response = await api.get<ApiResponse<Tag[]>>('/tags/kb');
  return handleResponse(response.data);
};

/**
 * 获取知识库详细信息
 * GET /kb/info/{kbId}
 */
export const fetchKnowledgeBaseDetail = async (kbId: number): Promise<KnowledgeBaseDetail> => {
  const response = await api.get<ApiResponse<KnowledgeBaseDetail>>(`/kb/info/${kbId}`);
  return handleResponse(response.data);
};

/**
 * 更新知识库
 * PUT /kb/update
 */
export const updateKnowledgeBase = async (kbId: number, data: KnowledgeBaseFormData): Promise<void> => {
  const response = await api.put<ApiResponse<void>>('/kb/update', {
    id: kbId,
    ...data
  });
  return handleResponse(response.data);
};

/**
 * 删除知识库
 * DELETE /kb/delete/{kbId}
 */
export const deleteKnowledgeBase = async (kbId: number): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/kb/delete/${kbId}`);
  return handleResponse(response.data);
};

/**
 * 检索知识库
 * POST /kb/retrieve
 */
export const retrieveKnowledgeBase = async (data: RetrieveRequest): Promise<RetrieveResult[]> => {
  const response = await api.post<ApiResponse<RetrieveResult[]>>('/kb/retrieve', data);
  return handleResponse(response.data);
};

/**
 * 获取文档标签列表
 * GET /tags/doc
 */
export const fetchDocTags = async (): Promise<Tag[]> => {
  const response = await api.get<ApiResponse<Tag[]>>("/tags/doc");
  return handleResponse(response.data);
};

/**
 * 上传文档
 * POST /doc/upload
 */
export const uploadDocument = async (formData: FormData): Promise<void> => {
  const response = await api.post<ApiResponse<void>>("/doc/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return handleResponse(response.data);
};

export interface UploadDocumentRequest {
  kbId: number;
  uploadId: string;
  splitMode: 'HEADER' | 'LENGTH' | 'REGEX';
  splitLength: number;
  headerLevel?: number;
  overlapLength?: number;
  regex?: string;
  joinDelimiter?: string;
  tags?: Array<{id?: number; name: string}>;
}

/**
 * 上传文档（新版）
 * POST /doc/upload
 */
export const uploadDocumentV2 = async (data: UploadDocumentRequest): Promise<void> => {
  const response = await api.post<ApiResponse<void>>("/doc/upload", data);
  return handleResponse(response.data);
};

/**
 * 获取文档列表（分页）
 * GET /doc/page
 * @param kbId 知识库ID
 * @param params 分页参数
 */
export const fetchDocuments = async (
  kbId: number,
  params: PageRequest
): Promise<PageResult<Document>> => {
  const response = await api.get<ApiResponse<PageResult<Document>>>('/doc/page', {
    params: { kbId, ...params }
  });
  return handleResponse(response.data);
};

/**
 * 获取文档详情
 * GET /doc/info
 * @param docId 文档ID
 */
export const fetchDocumentDetail = async (
  docId: string
): Promise<DocumentDetail> => {
  const response = await api.get<ApiResponse<DocumentDetail>>('/doc/info', {
    params: { docId }
  });
  return handleResponse(response.data);
};

/**
 * 删除文档
 * DELETE /doc/delete/{docId}
 * @param docId 文档ID
 */
export const deleteDocument = async (docId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/doc/delete/${docId}`);
  return handleResponse(response.data);
};

/**
 * 获取切片列表（分页）
 * GET /chunk/page
 * @param docId 文档ID
 * @param params 分页参数
 */
export const fetchChunks = async (
  docId: string,
  params: PageRequest
): Promise<PageResult<Chunk>> => {
  const response = await api.get<ApiResponse<PageResult<Chunk>>>('/chunk/page', {
    params: { docId, ...params }
  });
  return handleResponse(response.data);
};

/**
 * 更新切片内容
 * POST /chunk/update
 * @param data 更新参数
 */
export const updateChunk = async (data: {
  docId: string;
  chunkId: string;
  content: string;
}): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('/chunk/update', data);
  return handleResponse(response.data);
};

export interface PreviewChunkRequest {
  uploadId: string;
  splitMode: 'HEADER' | 'LENGTH' | 'REGEX';
  splitLength: number;
  headerLevel?: number;
  overlapLength?: number;
  regex?: string;
  joinDelimiter?: string;
}

export interface PreviewChunk {
  chunkId: string;
  chunkIndex: number;
  content: string;
}

export interface PreviewChunkResponse {
  estimateCount: number;
  chunks: PreviewChunk[];
}

/**
 * 预览切片
 * POST /chunk/preview
 * @param data 预览参数
 */
export const previewChunks = async (
  data: PreviewChunkRequest
): Promise<PreviewChunkResponse> => {
  const response = await api.post<ApiResponse<PreviewChunkResponse>>('/chunk/preview', data);
  return handleResponse(response.data);
};
