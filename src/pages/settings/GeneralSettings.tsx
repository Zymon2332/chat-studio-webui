import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGE_KEY = "app-language";

type Language = "zh-CN" | "en";

const languages: { value: Language; label: string }[] = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en", label: "English" },
];

export function GeneralSettings() {
  const [language, setLanguage] = useState<Language>("zh-CN");
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 读取保存的语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language;
    if (savedLanguage && languages.some((lang) => lang.value === savedLanguage)) {
      setLanguage(savedLanguage);
    }
    setMounted(true);
  }, []);

  // 保存语言选择到 localStorage
  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    localStorage.setItem(LANGUAGE_KEY, value);
    // TODO: 接入 i18n 后实际切换界面语言
    console.log("语言已切换为:", value);
  };

  // 避免服务端渲染 hydration 不匹配
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">通用设置</h2>

      {/* 基础设置分组 */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          基础设置
        </h3>
        <div className="space-y-0">
          {/* 语言设置项 */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex-1">
              <div className="font-medium">界面语言</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                选择您偏好的界面语言
              </div>
            </div>
            <div className="w-[180px]">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
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
