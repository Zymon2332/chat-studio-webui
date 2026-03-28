import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, Zap, List, Layers, Scale, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KnowledgeBaseConfig } from '../types';

interface RetrievalConfigFormProps {
  config: KnowledgeBaseConfig;
  onChange: (config: KnowledgeBaseConfig) => void;
}

// 融合策略配置
const strategies = {
  RRF: {
    value: 'RRF' as const,
    icon: Layers,
    label: 'RRF',
    cnLabel: '递归秩融合',
    shortDesc: '最佳通用性',
    description: '综合多种检索结果的排名位置，平衡不同检索方式的优势',
    applicable: '不确定哪种检索方式更好的场景，或需要兼顾召回率和准确率',
    recommended: true,
  },
  WEIGHT: {
    value: 'WEIGHT' as const,
    icon: Scale,
    label: 'WEIGHT',
    cnLabel: '加权融合',
    shortDesc: '精确控制权重',
    description: '自定义向量检索和关键词检索的权重比例，灵活调整融合方式',
    applicable: '明确知道哪种检索方式更重要，或需要根据业务调整权重的场景',
  },
  RERANK: {
    value: 'RERANK' as const,
    icon: ArrowUpDown,
    label: 'RERANK',
    cnLabel: '重排序优化',
    shortDesc: '精排提升质量',
    description: '使用专门的排序模型对初步结果进行重新排序，显著提升准确性',
    applicable: '对结果质量要求高，可以承受一定延迟的场景',
  },
};

export function RetrievalConfigForm({ config, onChange }: RetrievalConfigFormProps) {
  // 根据检索模式获取可用的融合策略
  const getAvailableFusionStrategies = () => {
    if (config.retrievalMode === 'EMBEDDING') {
      return [strategies.RRF, strategies.RERANK];
    } else if (config.retrievalMode === 'HYBRID') {
      return [strategies.RRF, strategies.WEIGHT];
    } else {
      return [strategies.RRF, strategies.RERANK];
    }
  };

  const handleRetrievalModeChange = (mode: KnowledgeBaseConfig['retrievalMode']) => {
    // 根据新模式获取可用策略，而不是当前 config 中的模式
    let availableStrategies;
    if (mode === 'HYBRID') {
      availableStrategies = [strategies.RRF, strategies.WEIGHT];
    } else {
      availableStrategies = [strategies.RRF, strategies.RERANK];
    }

    onChange({
      ...config,
      retrievalMode: mode,
      fusionStrategy: availableStrategies[0].value as KnowledgeBaseConfig['fusionStrategy'],
      // 重置所有策略特定配置为默认值
      topN: 3,
      rerankMinScore: 0.5,
      denseWeight: 0.5,
      sparseWeight: 0.5,
    });
  };

  return (
    <div className="space-y-6">
      {/* 检索模式 */}
      <div className="space-y-3">
        <Label>检索模式</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { mode: 'EMBEDDING' as const, icon: Search, label: '向量检索', desc: '基于语义理解' },
            { mode: 'HYBRID' as const, icon: Zap, label: '混合检索', desc: '向量+关键词', recommended: true },
            { mode: 'FULL_TEXT' as const, icon: List, label: '全文检索', desc: '关键词匹配' },
          ].map(({ mode, icon: Icon, label, desc, recommended }) => (
            <button
              key={mode}
              onClick={() => handleRetrievalModeChange(mode)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all relative',
                config.retrievalMode === mode
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-accent hover:bg-accent/50'
              )}
            >
              {recommended && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full">
                  推荐
                </div>
              )}
              <Icon
                className={cn(
                  'h-8 w-8',
                  config.retrievalMode === mode ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 融合策略 - 卡片式选择 */}
      <div className="space-y-3">
        <Label>融合策略</Label>
        <div className="grid grid-cols-2 gap-3">
          {getAvailableFusionStrategies().map((item) => {
            const { value, icon: Icon, label, cnLabel, shortDesc, description, applicable } = item;
            const isRecommended = 'recommended' in item ? item.recommended : false;
            return (
            <button
              key={value}
              onClick={() => onChange({ ...config, fusionStrategy: value })}
              className={cn(
                'flex flex-col gap-2 p-4 rounded-lg border-2 transition-all relative text-left',
                config.fusionStrategy === value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-accent hover:bg-accent/50'
              )}
            >
              {isRecommended && (
                <div className="absolute -top-2 left-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full">
                  推荐
                </div>
              )}
              <div className="flex items-start gap-3">
                <Icon
                  className={cn(
                    'h-6 w-6 flex-shrink-0 mt-0.5',
                    config.fusionStrategy === value ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{cnLabel}</span>
                  </div>
                  <div className="text-xs text-primary font-medium mt-0.5">{shortDesc}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed pl-9">
                {description}
              </div>
              <div className="text-[10px] text-muted-foreground/70 bg-muted/50 rounded px-2 py-1 pl-9">
                适用：{applicable}
              </div>
            </button>
            );
          })}
        </div>
      </div>

      {/* 通用配置 */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium">通用配置</div>

        {/* TopK */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">检索结果数量 (TopK)</Label>
            <span className="text-sm font-medium">{config.topK}</span>
          </div>
          <Slider
            value={[config.topK]}
            onValueChange={(values: number[]) => onChange({ ...config, topK: values[0] })}
            min={1}
            max={20}
            step={1}
          />
          <p className="text-xs text-muted-foreground">返回相似度最高的{config.topK}个文档片段</p>
        </div>

        {/* embedMinScore */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">相似度阈值</Label>
            <span className="text-sm font-medium">{config.embedMinScore.toFixed(2)}</span>
          </div>
          <Slider
            value={[config.embedMinScore]}
            onValueChange={(values: number[]) =>
              onChange({ ...config, embedMinScore: values[0] })
            }
            min={0}
            max={1}
            step={0.05}
          />
          <p className="text-xs text-muted-foreground">
            只返回相似度≥{(config.embedMinScore * 100).toFixed(0)}%的结果
          </p>
        </div>
      </div>

      {/* RERANK 配置 */}
      {config.fusionStrategy === 'RERANK' && (
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
            <Search className="w-4 h-4" />
            Rerank 重排序配置
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">使用更精确的模型对结果重新排序，提升准确性</p>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">重排序数量 (TopN)</Label>
              <span className="text-sm font-medium">{config.topN}</span>
            </div>
            <Slider
              value={[config.topN]}
              onValueChange={(values: number[]) => onChange({ ...config, topN: values[0] })}
              min={1}
              max={config.topK}
              step={1}
            />
            <p className="text-xs text-muted-foreground">从TopK中选择{config.topN}个进行精排</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">重排序阈值</Label>
              <span className="text-sm font-medium">{config.rerankMinScore.toFixed(2)}</span>
            </div>
            <Slider
              value={[config.rerankMinScore]}
              onValueChange={(values: number[]) =>
                onChange({ ...config, rerankMinScore: values[0] })
              }
              min={0}
              max={1}
              step={0.05}
            />
            <p className="text-xs text-muted-foreground">精排后分数需≥{(config.rerankMinScore * 100).toFixed(0)}%才保留</p>
          </div>
        </div>
      )}

      {/* WEIGHT 配置 */}
      {config.fusionStrategy === 'WEIGHT' && (
        <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100">
            <Zap className="w-4 h-4" />
            权重配置
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">调整向量检索和关键词检索的权重比例（两者之和必须等于1.0）</p>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">向量检索权重（语义理解）</Label>
              <span className="text-sm font-medium">{config.denseWeight.toFixed(2)}</span>
            </div>
            <Slider
              value={[config.denseWeight]}
              onValueChange={(values: number[]) =>
                onChange({
                  ...config,
                  denseWeight: values[0],
                  sparseWeight: parseFloat((1 - values[0]).toFixed(2)),
                })
              }
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">关键词检索权重（精确匹配）</Label>
              <span className="text-sm font-medium">{config.sparseWeight.toFixed(2)}</span>
            </div>
            <Slider
              value={[config.sparseWeight]}
              onValueChange={(values: number[]) =>
                onChange({
                  ...config,
                  sparseWeight: values[0],
                  denseWeight: parseFloat((1 - values[0]).toFixed(2)),
                })
              }
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          {Math.abs(config.denseWeight + config.sparseWeight - 1) > 0.01 && (
            <p className="text-xs text-destructive">
              ⚠️ 权重之和必须等于1.0（当前：{(config.denseWeight + config.sparseWeight).toFixed(2)}）
            </p>
          )}
        </div>
      )}
    </div>
  );
}
