import { Streamdown } from "streamdown";
import { createCodePlugin } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";
import { useThemeContext, codeThemes } from "@/contexts/ThemeContext";
import { useTheme } from "next-themes";
import "streamdown/styles.css";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({
  content,
  isStreaming,
}: MarkdownRendererProps) {
  const { codeTheme } = useThemeContext();
  const { theme } = useTheme();

  // 根据当前界面主题和代码主题配置，决定使用哪个主题
  const selectedTheme = codeThemes.find(t => t.value === codeTheme);
  const isDarkMode = theme === 'dark';
  
  // 如果是暗黑模式，优先使用暗黑代码主题，反之亦然
  const lightTheme = isDarkMode 
    ? (selectedTheme?.type === 'light' ? 'github-light' : codeTheme)
    : (selectedTheme?.type === 'dark' ? 'github-dark' : codeTheme);
    
  const darkTheme = isDarkMode
    ? (selectedTheme?.type === 'dark' ? codeTheme : 'github-dark')
    : (selectedTheme?.type === 'light' ? codeTheme : 'github-dark');

  // 创建带有自定义主题的 code 插件
  const codePlugin = createCodePlugin({
    themes: [lightTheme as any, darkTheme as any],
  });

  return (
    <Streamdown
      mode={isStreaming ? "streaming" : "static"}
      plugins={{
        code: codePlugin,
        mermaid: mermaid,
        math: math,
        cjk: cjk,
      }}
      mermaid={{ config: { theme: "neutral" } }}
      animated
      isAnimating={isStreaming}
    >
      {content}
    </Streamdown>
  );
}
