import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const FONT_SIZE_KEY = 'app-font-size';
const CODE_THEME_KEY = 'app-code-theme';

export type FontSize = 'sm' | 'base' | 'lg';

export interface CodeTheme {
  value: string;
  label: string;
  type: 'light' | 'dark';
}

export const codeThemes: CodeTheme[] = [
  { value: 'github-light', label: 'GitHub Light', type: 'light' },
  { value: 'github-dark', label: 'GitHub Dark', type: 'dark' },
  { value: 'light-plus', label: 'VS Code Light+', type: 'light' },
  { value: 'dark-plus', label: 'VS Code Dark+', type: 'dark' },
  { value: 'dracula', label: 'Dracula', type: 'dark' },
];

interface ThemeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  codeTheme: string;
  setCodeTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('base');
  const [codeTheme, setCodeThemeState] = useState<string>('github-light');

  // 从 localStorage 读取设置
  useEffect(() => {
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize;
    const savedCodeTheme = localStorage.getItem(CODE_THEME_KEY);

    if (savedFontSize && ['sm', 'base', 'lg'].includes(savedFontSize)) {
      setFontSizeState(savedFontSize);
    }

    if (savedCodeTheme && codeThemes.some(t => t.value === savedCodeTheme)) {
      setCodeThemeState(savedCodeTheme);
    }
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
  };

  const setCodeTheme = (theme: string) => {
    setCodeThemeState(theme);
    localStorage.setItem(CODE_THEME_KEY, theme);
  };

  return (
    <ThemeContext.Provider value={{ fontSize, setFontSize, codeTheme, setCodeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
}
