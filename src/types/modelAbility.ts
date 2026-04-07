/**
 * 模型能力管理类型定义
 */

/**
 * 模型能力枚举值
 */
export type ModelAbilityType = 
  | 'THINKING'
  | 'VISUAL_UNDERSTANDING'
  | 'IMAGE_GENERATION'
  | 'TOOL'
  | 'NETWORK';

/**
 * 模型能力信息
 */
export interface ModelAbility {
  id: number;
  modelName: string;
  providerId: string;
  abilities: string;
  enabled: boolean;
  createdTime: string;
  updatedTime: string;
}

/**
 * 新增模型能力请求
 */
export interface CreateModelAbilityRequest {
  modelName: string;
  providerId: string;
  abilities: string;
  enabled: boolean;
}

/**
 * 更新模型能力请求
 */
export interface UpdateModelAbilityRequest {
  id: number;
  modelName: string;
  providerId: string;
  abilities: string;
  enabled: boolean;
}

/**
 * 模型能力列表查询参数
 */
export interface ModelAbilityListParams {
  pageNum?: number;
  pageSize?: number;
  providerId?: string;
  modelName?: string;
  enabled?: boolean;
}

/**
 * 能力标签映射
 */
export const AbilityLabels: Record<ModelAbilityType, string> = {
  THINKING: '深度思考',
  VISUAL_UNDERSTANDING: '视觉理解',
  IMAGE_GENERATION: '图片生成',
  TOOL: '工具调用',
  NETWORK: '联网搜索',
};

/**
 * 能力颜色配置
 */
export const AbilityColors: Record<ModelAbilityType, string> = {
  THINKING: 'bg-purple-100 text-purple-700',
  VISUAL_UNDERSTANDING: 'bg-blue-100 text-blue-700',
  IMAGE_GENERATION: 'bg-green-100 text-green-700',
  TOOL: 'bg-orange-100 text-orange-700',
  NETWORK: 'bg-cyan-100 text-cyan-700',
};

/**
 * 所有能力选项
 */
export const AllAbilities: ModelAbilityType[] = [
  'THINKING',
  'VISUAL_UNDERSTANDING',
  'IMAGE_GENERATION',
  'TOOL',
  'NETWORK',
];

/**
 * 解析能力字符串为数组
 */
export function parseAbilities(abilitiesStr: string): ModelAbilityType[] {
  if (!abilitiesStr) return [];
  return abilitiesStr.split(',') as ModelAbilityType[];
}

/**
 * 将能力数组转换为字符串
 */
export function stringifyAbilities(abilities: ModelAbilityType[]): string {
  return abilities.join(',');
}
