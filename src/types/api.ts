/**
 * 统一 API 响应结构
 */
export interface ApiResponse<T> {
  code: string;        // "200" 表示成功
  msg: string;         // 消息
  success: boolean;    // 业务是否成功
  data: T;             // 实际数据
}
