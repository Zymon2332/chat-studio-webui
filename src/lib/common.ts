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

/**
 * S3 POST Policy 签名响应
 */
export interface PostSignatureResponse {
  endpoint: string;
  bucket: string;
  fields: {
    'x-amz-signature': string;
    'x-amz-algorithm': string;
    'x-amz-credential': string;
    'x-amz-date': string;
    key: string;
    policy: string;
  };
  taskId: string;
}

/**
 * 上传确认请求
 */
export interface UploadConfirmRequest {
  objectKey: string;
  originalFileName: string;
  taskId: string;
  appId: 'DOCUMENT';
}

/**
 * 获取文件上传预签名凭证请求
 */
export interface PostSignatureRequest {
  fileOriginalName: string;
  contentType: string;
}

/**
 * 获取文件上传预签名凭证
 * POST /file/post_signature
 */
export const fetchPostSignature = async (data: PostSignatureRequest): Promise<PostSignatureResponse> => {
  const response = await api.post<ApiResponse<PostSignatureResponse>>('/file/post_signature', data);
  return handleResponse(response.data);
};

/**
 * 确认文件上传完成
 * POST /file/upload_confirm
 */
export const confirmUpload = async (data: UploadConfirmRequest): Promise<string> => {
  const response = await api.post<ApiResponse<string>>('/file/upload_confirm', data);
  return handleResponse(response.data);
};

/**
 * 使用 POST Policy 上传文件到 S3
 * @param file 要上传的文件
 * @param contentType 文件 MIME 类型
 * @param signature 预签名凭证
 * @param onProgress 上传进度回调（可选）
 * @returns 上传结果
 */
export const uploadFileToS3 = async (
  file: File,
  contentType: string,
  signature: PostSignatureResponse,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const formData = new FormData();

  // 添加 policy 字段（必须先于 file）
  Object.entries(signature.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // 添加 Content-Type（必需，必须与 policy 条件匹配）
  formData.append('Content-Type', contentType);

  // 添加文件
  formData.append('file', file);

  // 构建完整的 endpoint URL
  const uploadUrl = `${signature.endpoint}/${signature.bucket}`;

  // 使用原生 fetch 以便支持上传进度
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 进度监听
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`上传失败: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('网络错误，上传失败'));
    });

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
};
