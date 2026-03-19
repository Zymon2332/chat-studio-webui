import { Sparkles, Eye, Palette, Wrench, Globe } from "lucide-react";

const abilityIcons: Record<string, { icon: React.ElementType; label: string }> = {
  THINKING: { icon: Sparkles, label: "深度思考" },
  VISUAL_UNDERSTANDING: { icon: Eye, label: "视觉理解" },
  IMAGE_GENERATION: { icon: Palette, label: "图片生成" },
  TOOL: { icon: Wrench, label: "工具调用" },
  NETWORK: { icon: Globe, label: "联网搜索" },
};

interface AbilityIconsProps {
  abilities: string | null | undefined;
}

export function AbilityIcons({ abilities }: AbilityIconsProps) {
  // 空值保护：如果 abilities 为 null/undefined/空字符串，返回 null
  if (!abilities) return null;
  
  const abilityList = abilities.split(",").filter(Boolean);

  return (
    <div className="flex items-center gap-1">
      {abilityList.map((ability) => {
        const config = abilityIcons[ability];
        if (!config) return null;

        const Icon = config.icon;
        return (
          <span
            key={ability}
            title={config.label}
            className="inline-flex items-center justify-center"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        );
      })}
    </div>
  );
}
