/**
 * 统一 API 响应结构
 */
export interface ApiResponse<T> {
  code: string;        // "200" 表示成功
  msg: string;         // 消息
  success: boolean;    // 业务是否成功
  data: T;             // 实际数据
}

/**
 * 分页查询参数
 */
export interface PageRequest {
  pageNum: number;
  pageSize: number;
}

/**
 * 分页查询结果
 */
export interface PageResult<T> {
  records: T[];        // 数据列表
  current: number;     // 当前页
  size: number;        // 每页条数
  total: number;       // 总条数
}
