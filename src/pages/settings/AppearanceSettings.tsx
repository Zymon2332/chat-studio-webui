import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeContext, codeThemes, type FontSize } from "@/contexts/ThemeContext";

const fontSizeOptions: { value: FontSize; label: string; description: string }[] = [
  { value: "sm", label: "小", description: "14px" },
  { value: "base", label: "中", description: "16px" },
  { value: "lg", label: "大", description: "18px" },
];

const themeOptions = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
  { value: "system", label: "跟随系统" },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, codeTheme, setCodeTheme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">界面设置</h2>

      {/* 外观分组 */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">外观</h3>
        <div className="space-y-0">
          {/* 主题模式 */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex-1">
              <div className="font-medium">主题模式</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                选择您偏好的界面主题
              </div>
            </div>
            <div className="w-[180px]">
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 字体大小 */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex-1">
              <div className="font-medium">字体大小</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                调整界面字体大小
              </div>
            </div>
            <div className="w-[180px]">
              <Select value={fontSize} onValueChange={(val) => setFontSize(val as FontSize)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择字体大小" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 代码分组 */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">代码</h3>
        <div className="space-y-0">
          {/* 代码块主题 */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex-1">
              <div className="font-medium">代码块主题</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                选择代码高亮的配色方案
              </div>
            </div>
            <div className="w-[180px]">
              <Select value={codeTheme} onValueChange={setCodeTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent>
                  {codeThemes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
