export interface Tag {
  id: number;
  name: string;
}

export interface KnowledgeBase {
  id: number;
  name: string;
  description: string | null;
  createdTime: string;
  updatedTime: string;
  docCount: number;
  tags: Tag[];
}

export type ViewMode = 'all' | 'files';
export type SortBy = 'updated' | 'name' | 'citations';

export type ProcessStatus =
  | 'PENDING'
  | 'PARSING'
  | 'SHARDING'
  | 'VECTORIZING'
  | 'COMPLETED'
  | 'FAILED';

export interface Document {
  docId: string;
  title: string;
  inputTokenCount: number | null;
  outputTokenCount: number | null;
  totalTokenCount: number | null;
  tags: string[];
  processStatus: ProcessStatus;
  errorText: string | null;
  chunkSize: number;
  size: number;
  uploadTime: string;
}

export interface KnowledgeBaseConfig {
  retrievalMode: 'EMBEDDING' | 'HYBRID' | 'FULL_TEXT';
  topK: number;
  embedMinScore: number;
  fusionStrategy: 'RRF' | 'WEIGHT' | 'RERANK';
  topN: number;
  rerankMinScore: number;
  denseWeight: number;
  sparseWeight: number;
}

export interface KnowledgeBaseFormData {
  name: string;
  description: string;
  type: 'DOCUMENT' | 'VIDEO' | 'IMAGE';
  responseType: 'BASIC' | 'MULTIMODAL';
  tags: { id?: number; name: string }[];
  config: KnowledgeBaseConfig;
}

export interface KnowledgeBaseDetail {
  id: number;
  name: string;
  description: string;
  type: 'DOCUMENT' | 'VIDEO' | 'IMAGE';
  responseType: 'BASIC' | 'MULTIMODAL';
  docCount: number;
  config: KnowledgeBaseConfig;
  tags: Tag[];
}

export interface RetrieveResult {
  text: string;
  vectorId: string;
  score: number;
  charLength: number;
  docName: string;
  docId: string;
}

export interface RetrieveRequest {
  kbId: number;
  content: string;
  config: KnowledgeBaseConfig;
}

export interface DocumentSegment {
  segmentId: string;
  docId: string;
  title: string;
  content: string;
  charCount: number;
  status: 'ENABLED' | 'DISABLED';
  vectorId?: string;
  createdTime: string;
  updatedTime: string;
}

export interface FileUploadInfo {
  originalName: string;
  storageType: string | null;
  storagePath: string;
  contentType: string;
  contentLength: number;
  createdTime: string;
}

export interface DocumentDetail {
  docId: string;
  title: string;
  inputTokenCount: number | null;
  outputTokenCount: number | null;
  totalTokenCount: number | null;
  chunkSize: number;
  tags: string[];
  fileUploads: FileUploadInfo;
}

export interface Chunk {
  chunkId: string;
  chunkIndex: number;
  content: string;
}
